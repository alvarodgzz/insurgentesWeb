#!/bin/zsh -l
cd -- "$(dirname -- "$0")" || exit 1
node scripts/preview.mjs --open
