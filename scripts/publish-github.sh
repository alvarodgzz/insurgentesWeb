#!/usr/bin/env bash
# Creates alvarodgzz/insurgentesWeb as a PUBLIC repository if it does not exist,
# enables GitHub Pages, and pushes the reviewed website to main. Existing
# repositories keep their visibility. Run locally after `gh auth login`.
set -euo pipefail

project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
repository='alvarodgzz/insurgentesWeb'
expected_owner='alvarodgzz'
export GH_HOST='github.com'

fail() {
  printf 'Stopped: %s\n' "$1" >&2
  exit 1
}

cd -- "$project_root"
command -v node >/dev/null || fail 'Install Node.js 22 or later, then run this script again.'

# Finish all local validation before changing Git or GitHub.
node --test tests/*.test.mjs
SITE_URL='https://losinsurgentes.mx/' node scripts/build.mjs
node scripts/check.mjs
node scripts/prepare-pages.mjs

command -v git >/dev/null || fail 'Install Git, then run this script again.'
command -v gh >/dev/null || fail 'Install the GitHub CLI and run gh auth login --hostname github.com.'
login="$(gh api --hostname github.com user --jq .login)" || fail 'Run gh auth login --hostname github.com, then try again.'
[[ "$login" == "$expected_owner" ]] || fail 'The active GitHub account must be alvarodgzz. Use gh auth switch --hostname github.com --user alvarodgzz.'

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git_root="$(git rev-parse --show-toplevel)"
  [[ "$(cd -- "$git_root" && pwd -P)" == "$project_root" ]] || fail 'This folder belongs to a different parent Git repository. Review that repository before publishing.'
else
  [[ ! -e .git ]] || fail 'A .git entry already exists but is not usable. Review it before publishing.'
  git init -b main
fi

branch="$(git symbolic-ref --quiet --short HEAD)" || fail 'The checkout has a detached HEAD. Switch to main before publishing.'
[[ "$branch" == 'main' ]] || fail 'The current branch is not main. Review your work and switch to main before publishing.'

has_origin=false
if git remote get-url origin >/dev/null 2>&1; then
  has_origin=true
  origin_fetch="$(git remote get-url --all origin)"
  origin_push="$(git remote get-url --all --push origin)"
  while IFS= read -r remote_url; do
    case "$remote_url" in
      'https://github.com/alvarodgzz/insurgentesWeb'|'https://github.com/alvarodgzz/insurgentesWeb.git'|'git@github.com:alvarodgzz/insurgentesWeb'|'git@github.com:alvarodgzz/insurgentesWeb.git'|'ssh://git@github.com/alvarodgzz/insurgentesWeb'|'ssh://git@github.com/alvarodgzz/insurgentesWeb.git') ;;
      *) fail 'The origin remote points somewhere other than alvarodgzz/insurgentesWeb. Review it before publishing; this script will not replace it.' ;;
    esac
  done <<< "$origin_fetch
$origin_push"
fi

# Set a repository-local identity only when Git has no effective value.
if [[ -z "$(git config --get user.name || true)" ]]; then
  profile_name="$(gh api --hostname github.com user --jq '.name // .login')"
  git config --local user.name "$profile_name"
fi
if [[ -z "$(git config --get user.email || true)" ]]; then
  profile_id="$(gh api --hostname github.com user --jq .id)"
  [[ "$profile_id" =~ ^[0-9]+$ ]] || fail 'Could not read the numeric GitHub account ID.'
  git config --local user.email "${profile_id}+${expected_owner}@users.noreply.github.com"
fi

is_project_path() {
  case "$1" in
    */.*|*.log) return 1 ;;
    index.html|README.md|PROJECT_STATUS.md|AGENTS.md|start.command|.gitignore|.github/*|assets/*|css/*|js/*|images/*|content/*|admin/*|templates/*|docs/*|scripts/*|tests/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Also protect against private files that an existing Git index already tracks.
while IFS= read -r -d '' tracked_path; do
  is_project_path "$tracked_path" || fail 'Git already tracks files outside the website allowlist. Review the tracked files before publishing; this script will not remove them.'
done < <(git ls-files -z)

git add -- index.html README.md PROJECT_STATUS.md AGENTS.md start.command .gitignore .github assets css js images content admin templates docs scripts tests
while IFS= read -r -d '' staged_path; do
  is_project_path "$staged_path" || fail 'The staged changes include files outside the website allowlist. Review the staged files before committing.'
done < <(git diff --cached --name-only -z)
if ! git diff --cached --quiet; then
  git commit -m 'Update Los Insurgentes website and GitHub Pages configuration'
fi
git rev-parse --verify HEAD >/dev/null || fail 'The repository needs a commit before publishing.'

if gh repo view "$repository" --json nameWithOwner --jq .nameWithOwner >/dev/null 2>&1; then
  if [[ "$has_origin" == false ]]; then
    git remote add origin "https://github.com/${repository}.git"
  fi
else
  if [[ "$has_origin" == true ]]; then
    gh repo create "$repository" --public
  else
    gh repo create "$repository" --public --source . --remote origin
  fi
fi

# Keep the preview password out of Git and command-line arguments. The ignored
# local file is only read by gh on stdin; Actions receives a repository secret.
if [[ -s .env.preview-password ]]; then
  gh secret set PREVIEW_PASSWORD --repo "$repository" < .env.preview-password
fi

# Push first: GitHub Pages cannot be initialized reliably on an empty repository.
# Reuse gh authentication for HTTPS without changing global Git credentials.
# No force push: existing remote history must remain intact.
push_auth=(-c credential.helper= -c 'credential.helper=!gh auth git-credential')
push_log="$(mktemp "${TMPDIR:-/tmp}/insurgentes-push.XXXXXX")"
trap 'rm -f -- "$push_log"' EXIT
if git "${push_auth[@]}" push -u origin main 2>&1 | tee "$push_log"; then
  :
elif grep -Fq 'RPC failed; HTTP 400' "$push_log"; then
  # Some older Git/libcurl or intermediary combinations reject chunked uploads.
  # Buffer this project's ~33 MiB initial pack for this retry only. Git documents
  # this as a chunked-transfer workaround, not a general fix for push failures.
  printf '\nHTTP 400 during upload. Retrying once with HTTP/1.1 and a 64 MiB buffer.\n'
  git "${push_auth[@]}" -c http.version=HTTP/1.1 -c http.postBuffer=67108864 push -u origin main
else
  fail 'Git push failed. The local commit and remote are preserved; GitHub Pages setup has not run.'
fi

# A disconnected upload can print "Everything up-to-date" after an error.
# Confirm the actual branch on GitHub before requesting any deployment.
remote_main="$(git "${push_auth[@]}" ls-remote --exit-code origin refs/heads/main)" || fail 'Could not verify main on GitHub. Pages setup has not run.'
read -r remote_commit remote_ref <<< "$remote_main"
local_commit="$(git rev-parse refs/heads/main)"
[[ "$remote_commit" == "$local_commit" && "$remote_ref" == 'refs/heads/main' ]] || fail 'GitHub main does not match the local commit. Pages setup has not run.'
printf '\nGitHub main verified: %s\n' "$remote_commit"

# Updating only build_type preserves any existing domain and HTTPS settings.
if pages_type="$(gh api --hostname github.com "repos/${repository}/pages" --jq '.build_type // ""' 2>/dev/null)"; then
  if [[ "$pages_type" != workflow ]]; then
    gh api --hostname github.com --method PUT "repos/${repository}/pages" -f build_type=workflow >/dev/null
  fi
else
  gh api --hostname github.com --method POST "repos/${repository}/pages" -f build_type=workflow >/dev/null
fi

# The push can trigger a run before Pages is enabled. Explicitly dispatch a new
# run after setup, also covering reruns with no new commits. Workflow concurrency
# serializes deployments for main.
gh workflow run pages.yml --repo "$repository" --ref main

printf '\nChanges pushed and deployment requested. Check the GitHub Actions result:\n'
printf 'https://github.com/%s/actions\n' "$repository"
printf 'Expected protected preview after a successful deployment: https://losinsurgentes.mx/\n'
