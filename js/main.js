const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('navLinks');
const mobileNav = window.matchMedia('(max-width: 780px)');

function setMenuOpen(isOpen, returnFocus = false) {
  navLinks.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  navLinks.inert = mobileNav.matches && !isOpen;
  if (returnFocus) navToggle.focus();
}

if (navToggle && navLinks) {
  navToggle.closest('.nav').classList.add('nav-ready');
  setMenuOpen(false);
  navToggle.addEventListener('click', () => {
    setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false, mobileNav.matches));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!navToggle.closest('.nav').contains(event.target)) setMenuOpen(false);
  });
  mobileNav.addEventListener('change', () => {
    const restoreFocus = mobileNav.matches && navLinks.contains(document.activeElement);
    setMenuOpen(false, restoreFocus);
  });
}

/* ===== Scroll reveal ===== */
/* Fades + lifts .reveal elements into place as they enter the viewport.
   Staggers siblings that share a parent (card grids, gallery) so they
   don't all pop in at once. Skips straight to visible for anyone who
   prefers reduced motion. */
(function () {
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (!revealEls.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const siblingIndex = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const count = siblingIndex.get(parent) || 0;
    el.style.transitionDelay = Math.min(count * 60, 300) + 'ms';
    siblingIndex.set(parent, count + 1);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => {
    el.classList.add('is-pending');
    observer.observe(el);
  });
})();

/* ===== Gallery lightbox ===== */
/* Single-photo viewer for the collage-wall gallery. On open, the clicked
   photo animates from its pinned-poster rotation (read live off the grid
   item's computed transform) to perfectly straight as it scales up —
   echoing the "un-pinning a photo off the wall" idea instead of a flat
   fade. Loops at both ends, supports keyboard/swipe/filmstrip nav, and
   locks body scroll while open. Skips the tilt animation for anyone who
   prefers reduced motion, matching the .reveal system above. */
(function () {
  const gallerySection = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  if (!gallerySection || !lightbox) return;

  const triggers = Array.from(gallerySection.querySelectorAll('.gallery-trigger'));
  if (!triggers.length) return;

  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const stage = lightbox.querySelector('.lightbox-stage');
  const imgEl = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');
  const counterEl = document.getElementById('lightboxCounter');
  const filmstripEl = document.getElementById('lightboxFilmstrip');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function firstSrcsetUrl(srcset) {
    if (!srcset) return '';
    const first = srcset.split(',')[0].trim();
    return first.split(' ')[0];
  }

  const slides = triggers.map((btn) => {
    const img = btn.querySelector('img');
    return {
      src: img.getAttribute('src') || '',
      srcset: img.getAttribute('srcset') || '',
      sizes: img.getAttribute('sizes') || '',
      alt: img.getAttribute('alt') || '',
      thumb: firstSrcsetUrl(img.getAttribute('srcset')) || img.getAttribute('src') || ''
    };
  });

  // Build the filmstrip once from the same slide data.
  const thumbButtons = slides.map((slide, i) => {
    const thumbBtn = document.createElement('button');
    thumbBtn.type = 'button';
    thumbBtn.className = 'lightbox-thumb';
    thumbBtn.setAttribute('aria-label', 'Ir a la foto ' + (i + 1) + ' de ' + slides.length);
    const thumbImg = document.createElement('img');
    thumbImg.src = slide.thumb;
    thumbImg.alt = '';
    thumbImg.loading = 'lazy';
    thumbBtn.appendChild(thumbImg);
    thumbBtn.addEventListener('click', () => goTo(i));
    filmstripEl.appendChild(thumbBtn);
    return thumbBtn;
  });

  // Gallery tiles get their resting tilt from --rotate-a/-b/-c/-d in a
  // 4-item nth-child cycle (see .gallery-item:nth-child rules in style.css).
  // We read the *resting* angle here rather than the live computed transform,
  // because a click always happens while the tile is still :hover-straightened
  // (hover resets rotation to 0 before the click fires), which would otherwise
  // make the lightbox's un-tilt animation a no-op for every mouse user.
  const rotationVars = ['--rotate-a', '--rotate-b', '--rotate-c', '--rotate-d'];
  function getRestingRotationDeg(index) {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const raw = rootStyles.getPropertyValue(rotationVars[index % 4]).trim();
    return parseFloat(raw) || 0;
  }

  let currentIndex = 0;
  let pendingIndex = null;
  let slideTimer = null;
  let lastFocused = null;
  const backgroundElements = Array.from(document.body.children).filter(
    (element) => element !== lightbox && element.tagName !== 'SCRIPT'
  );
  let previousInertStates = [];

  function updateContent(index) {
    const slide = slides[index];
    imgEl.src = slide.src;
    imgEl.srcset = slide.srcset;
    imgEl.sizes = '90vw';
    imgEl.alt = slide.alt;
    captionEl.textContent = slide.alt;
    counterEl.textContent = (index + 1) + ' / ' + slides.length;
    currentIndex = index;
    thumbButtons.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === index);
      btn.setAttribute('aria-current', String(i === index));
    });
    const activeThumb = thumbButtons[index];
    if (activeThumb && activeThumb.offsetParent !== null && typeof activeThumb.scrollIntoView === 'function') {
      activeThumb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }

  function goTo(index) {
    if (index === (pendingIndex ?? currentIndex)) return;
    window.clearTimeout(slideTimer);
    pendingIndex = index;
    if (prefersReducedMotion) {
      updateContent(index);
      pendingIndex = null;
      return;
    }
    imgEl.style.opacity = '0';
    slideTimer = window.setTimeout(() => {
      updateContent(index);
      pendingIndex = null;
      imgEl.style.opacity = '1';
    }, 150);
  }

  function nextSlide() { goTo(((pendingIndex ?? currentIndex) + 1) % slides.length); }
  function prevSlide() { goTo(((pendingIndex ?? currentIndex) - 1 + slides.length) % slides.length); }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'Tab') {
      // Filter to actually-visible buttons — on mobile the filmstrip is
      // display:none, so its (still-in-DOM) thumbnail buttons must be
      // excluded here or the trap lets focus escape once they'd otherwise
      // be "first"/"last".
      const focusables = Array.from(lightbox.querySelectorAll('button')).filter(
        (el) => el.offsetParent !== null
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openLightbox(index, triggerBtn) {
    window.clearTimeout(slideTimer);
    pendingIndex = null;
    lastFocused = triggerBtn;
    const angle = getRestingRotationDeg(index);

    updateContent(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    previousInertStates = backgroundElements.map((element) => element.inert);
    backgroundElements.forEach((element) => { element.inert = true; });

    if (!prefersReducedMotion) {
      imgEl.style.transition = 'none';
      imgEl.style.opacity = '0';
      imgEl.style.transform = 'rotate(' + angle + 'deg) scale(0.85)';
      // Force reflow so the transition below re-arms after the reset.
      void imgEl.offsetWidth;
      imgEl.style.transition = '';
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'rotate(0deg) scale(1)';
    } else {
      imgEl.style.transition = 'none';
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'none';
    }

    document.addEventListener('keydown', onKeydown);
    closeBtn.focus();
  }

  function closeLightbox() {
    window.clearTimeout(slideTimer);
    pendingIndex = null;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    backgroundElements.forEach((element, index) => {
      element.inert = previousInertStates[index];
    });
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  triggers.forEach((btn, i) => {
    btn.addEventListener('click', () => openLightbox(i, btn));
  });

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Simple touch-swipe navigation on the image stage.
  let touchStartX = null;
  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40;
    if (dx > threshold) prevSlide();
    else if (dx < -threshold) nextSlide();
    touchStartX = null;
  }, { passive: true });
})();
