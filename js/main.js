'use strict';

/* ----------------------------------------------------------------
   CONFIG — centralised constants (Low Priority backlog item)
---------------------------------------------------------------- */
const CONFIG = {
  SLIDER_INTERVAL:  5000,
  SWIPE_THRESHOLD:  50,
  SCROLL_THRESHOLD: 10,
  BACK_TO_TOP_PX:   400,
  // Newsletter subscription form — Formspree form ID
  // IMPORTANT: Replace YOUR_NEW_FORM_ID with your new Formspree newsletter form ID
  // after deleting the old one at formspree.io
  FORMSPREE_URL:         'https://formspree.io/f/xpqeplwy',


  // Contact page form — separate Formspree form, separate ID
  // IMPORTANT: Replace YOUR_CONTACT_FORM_ID with your Formspree contact form ID
  CONTACT_FORMSPREE_URL: 'https://formspree.io/f/YOUR_CONTACT_FORM_ID',
};

/* ----------------------------------------------------------------
   Utility
---------------------------------------------------------------- */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ================================================================
   01 — HAMBURGER MENU
   H02: Focus trap on open; Escape closes and restores focus.
   Uses transform/opacity/visibility — NO display manipulation.
================================================================ */
(function initHamburger() {
  try {
    const navbar    = qs('.navbar');
    const hamburger = qs('.nav-hamburger');
    const navList   = qs('.nav-links');
    const navLinks  = qsa('.nav-links a');

    if (!hamburger || !navList) return;

    navList.id = 'nav-links';

    /* H02: Focus trap helpers */
    let savedFocus  = null;
    let trapHandler = null;

    function getFocusable() {
      return qsa(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        navList
      ).filter(el => el.offsetParent !== null);
    }

    function openMenu() {
      navList.classList.add('mobile-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close navigation menu');
      hamburger.innerHTML = '&#10005;';
      document.body.style.overflow = 'hidden';

      /* H02: save focus, move into nav */
      savedFocus = document.activeElement;
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();

      /* H02: trap Tab/Shift+Tab within nav */
      trapHandler = function(e) {
        if (e.key !== 'Tab') return;
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', trapHandler);
    }

    function closeMenu() {
      navList.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
      hamburger.innerHTML = '&#9776;';
      document.body.style.overflow = '';

      /* H02: remove trap, restore focus */
      if (trapHandler) {
        document.removeEventListener('keydown', trapHandler);
        trapHandler = null;
      }
      if (savedFocus) {
        savedFocus.focus();
        savedFocus = null;
      }
    }

    function isMenuOpen() {
      return navList.classList.contains('mobile-open');
    }

    hamburger.addEventListener('click', () => {
      isMenuOpen() ? closeMenu() : openMenu();
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('click', (e) => {
      if (isMenuOpen() && navbar && !navbar.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen()) {
        closeMenu();
        hamburger.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isMenuOpen()) closeMenu();
    });

  } catch (err) {
    console.warn('[YGPT] initHamburger failed:', err);
  }
})();


/* ================================================================
   02 — NAVBAR SCROLL SHADOW + BACKDROP BLUR
================================================================ */
(function initNavScroll() {
  try {
    const navbar = qs('.navbar');
    if (!navbar) return;

    function updateNavbar() {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > CONFIG.SCROLL_THRESHOLD);
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

  } catch (err) {
    console.warn('[YGPT] initNavScroll failed:', err);
  }
})();


/* ================================================================
   03 — ACTIVE NAV LINK (IntersectionObserver)
   H04: aria-current="true" on active in-page nav link.
   M13: navHeight cached at init; recalculated only on resize.
================================================================ */
(function initActiveNav() {
  try {
    const sections = qsa('main section[id]');
    const navLinks = qsa('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    const linkMap = {};
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) linkMap[href.slice(1)] = link;
    });

    /* H04: set aria-current on active link */
    function setActive(id) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      if (linkMap[id]) {
        linkMap[id].classList.add('active');
        linkMap[id].setAttribute('aria-current', 'true');
      }
    }

    /* M13: cache navHeight; recalculate only on resize */
    let navHeight = qs('.navbar')?.offsetHeight || 83;

    window.addEventListener('resize', () => {
      navHeight = qs('.navbar')?.offsetHeight || 83;
    }, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: `-${navHeight + 10}px 0px -60% 0px`, threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));

  } catch (err) {
    console.warn('[YGPT] initActiveNav failed:', err);
  }
})();


/* ================================================================
   04 — SMOOTH SCROLL WITH NAVBAR OFFSET
   M13: navHeight read once; not recalculated per scroll tick.
================================================================ */
(function initSmoothScroll() {
  try {
    /* M13: navHeight is cached via shared resize listener in initActiveNav.
       Here we read it fresh on each click (click is rare; fine to recompute). */
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = qs('.navbar')?.offsetHeight || 83;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });

  } catch (err) {
    console.warn('[YGPT] initSmoothScroll failed:', err);
  }
})();


/* ================================================================
   05 — TESTIMONIAL SLIDER
   H03: aria-live="off" during autoplay; Pause/Play button;
        aria-roledescription="carousel" (set in HTML);
        only active card has aria-hidden="false".
================================================================ */
(function initTestiSlider() {
  try {
    const slider    = qs('.testi-slider');
    const cards     = qsa('.testi-card');
    const dots      = qsa('.testi-dot');
    const prevBtn   = qs('#testi-prev');
    const nextBtn   = qs('#testi-next');
    const pauseBtn  = qs('#testi-pause');

    if (!slider || !cards.length) return;

    let currentIndex = 0;
    const total      = cards.length;
    let isPaused     = false;

    function goTo(index) {
      /* Guard: if only 1 card, no-op */
      if (total <= 1) return;

      currentIndex = ((index % total) + total) % total;

      cards.forEach((card, i) => {
        const isActive = i === currentIndex;
        card.classList.toggle('testi-card--active', isActive);
        /* H03: only active card aria-hidden="false" */
        card.setAttribute('aria-hidden', String(!isActive));
      });

      dots.forEach((dot, i) => {
        const isActive = i === currentIndex;
        dot.classList.toggle('testi-dot--active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });
    }

    prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(currentIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex + 1); }
    });

    /* Touch swipe */
    let touchStartX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      const delta = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(delta) > CONFIG.SWIPE_THRESHOLD) {
        delta > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
      }
    }, { passive: true });

    /* Autoplay */
    let autoTimer = null;

    function startAuto() {
      if (isPaused) return;
      stopAuto();
      autoTimer = setInterval(() => goTo(currentIndex + 1), CONFIG.SLIDER_INTERVAL);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    /* H03: Pause/Play toggle button — WCAG 2.2.2 */
    function setPauseState(paused) {
      isPaused = paused;
      if (isPaused) {
        stopAuto();
        if (pauseBtn) {
          pauseBtn.innerHTML   = '&#9654;';
          pauseBtn.setAttribute('aria-label', 'Play automatic slideshow');
        }
      } else {
        startAuto();
        if (pauseBtn) {
          pauseBtn.innerHTML   = '&#9646;&#9646;';
          pauseBtn.setAttribute('aria-label', 'Pause automatic slideshow');
        }
      }
    }

    pauseBtn?.addEventListener('click', () => setPauseState(!isPaused));

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', () => { if (!isPaused) startAuto(); });
    slider.addEventListener('focusin',    stopAuto);
    slider.addEventListener('focusout',   () => { if (!isPaused) startAuto(); });

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stopAuto() : (isPaused ? null : startAuto());
    });

    goTo(0);
    startAuto();

  } catch (err) {
    console.warn('[YGPT] initTestiSlider failed:', err);
  }
})();


/* ================================================================
   06 — NEWSLETTER FORM
   C01: Real Formspree POST; honeypot; improved email regex;
        trim before validation; error handling; maxlength in HTML.
================================================================ */
(function initNewsletterForm() {
  try {
    const form       = qs('#nl-form');
    const emailInput = qs('#nl-email');
    const submitBtn  = qs('.nl-submit');
    const feedback   = qs('#nl-feedback');

    if (!form || !emailInput || !submitBtn || !feedback) return;

    /* C01: RFC-5321-inspired email regex (M09) */
    function isValidEmail(email) {
      if (email.length < 5 || email.length > 254) return false;
      return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
    }

    function showFeedback(message, type) {
      feedback.textContent = message;
      feedback.className   = `nl-feedback nl-feedback--${type}`;
    }

    function clearFeedback() {
      feedback.textContent = '';
      feedback.className   = 'nl-feedback';
    }

    function setLoading(isLoading) {
      submitBtn.setAttribute('data-loading', String(isLoading));
      submitBtn.disabled = isLoading;
      if (!isLoading) submitBtn.textContent = 'Subscribe →';
    }

    async function handleSubmit(e) {
      e.preventDefault();
      clearFeedback();

      /* C01: trim before validation */
      const email   = emailInput.value.trim();
      const botField = form.querySelector('[name="bot-field"]');

      /* C01: honeypot — if bot-field filled, silently succeed */
      if (botField && botField.value) {
        showFeedback('You\'re subscribed! Thank you for joining.', 'success');
        form.reset();
        return;
      }

      if (!email) {
        showFeedback('Please enter your email address.', 'error');
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.focus();
        return;
      }

      if (!isValidEmail(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.focus();
        return;
      }

      emailInput.removeAttribute('aria-invalid');
      setLoading(true);

      try {
        /* C01: Real Formspree POST with JSON */
        const response = await fetch(CONFIG.FORMSPREE_URL, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept':        'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          showFeedback('You\'re subscribed! Thank you for joining.', 'success');
          emailInput.value = '';
          emailInput.blur();
        } else {
          const data = await response.json().catch(() => ({}));
          const msg  = data?.errors?.[0]?.message || 'Submission failed. Please try again.';
          showFeedback(msg, 'error');
        }

      } catch (err) {
        /* C01: network errors surfaced in #nl-feedback */
        showFeedback('Network error. Please check your connection and try again.', 'error');
        console.warn('[YGPT Newsletter] Submit error:', err);
      } finally {
        setLoading(false);
      }
    }

    form.addEventListener('submit', handleSubmit);

    emailInput.addEventListener('input', () => {
      if (emailInput.getAttribute('aria-invalid') === 'true') {
        emailInput.removeAttribute('aria-invalid');
        clearFeedback();
      }
    });

  } catch (err) {
    console.warn('[YGPT] initNewsletterForm failed:', err);
  }
})();


/* ================================================================
   07 — SCROLL REVEAL (IntersectionObserver)
   C02: .is-hidden class added by JS; elements default visible in CSS.
   Single shared observer; fires once per element, then unobserves.
   Stagger parents delay children at 80ms increments.
================================================================ */
(function initScrollReveal() {
  try {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      qsa('[data-animate]').forEach(el => {
        el.classList.remove('is-hidden');
        el.style.opacity    = '1';
        el.style.transform  = 'none';
        el.style.willChange = 'auto';
      });
      return;
    }

    const targets        = qsa('[data-animate]');
    const staggerParents = qsa('[data-animate-stagger]');

    if (!targets.length) return;

    /* C02: Add .is-hidden to all [data-animate] elements before observer runs */
    targets.forEach(el => el.classList.add('is-hidden'));

    /* Apply stagger delays */
    staggerParents.forEach(parent => {
      const children = qsa('[data-animate]', parent);
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 80}ms`;
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          el.classList.remove('is-hidden');
          el.classList.add('is-visible');

          /* Clean up will-change after animation completes */
          el.addEventListener('transitionend', () => {
            el.style.willChange = 'auto';
          }, { once: true });

          observer.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));

  } catch (err) {
    console.warn('[YGPT] initScrollReveal failed:', err);
  }
})();


/* ================================================================
   08 — ANIMATED COUNTERS
   Counts up when metrics section enters viewport.
================================================================ */
(function initCounters() {
  try {
    const counters = qsa('[data-count]');
    if (!counters.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el        = entry.target;
          const target    = parseInt(el.getAttribute('data-count'), 10);
          const original  = el.textContent.trim();
          const hasLakh   = original.includes('Lakh') || el.getAttribute('data-format') === 'lakh';
          const duration  = 1600;
          const startTime = performance.now();

          function tick(now) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = Math.round(eased * target);

            if (hasLakh) {
              const lakhVal = Math.max(1, Math.round(current / 100000));
              el.textContent = `${lakhVal} Lakh+`;
            } else if (target >= 1000) {
              el.textContent = current.toLocaleString('en-IN') + '+';
            } else {
              el.textContent = current + '+';
            }

            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));

  } catch (err) {
    console.warn('[YGPT] initCounters failed:', err);
  }
})();


/* ================================================================
   09 — DYNAMIC COPYRIGHT YEAR
   C05: Sets current year in #year span.
================================================================ */
(function initCopyrightYear() {
  try {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  } catch (err) {
    console.warn('[YGPT] initCopyrightYear failed:', err);
  }
})();


/* ================================================================
   10 — BACK TO TOP BUTTON
   Appears after scrolling CONFIG.BACK_TO_TOP_PX.
   Uses transform/opacity; respects prefers-reduced-motion.
================================================================ */
(function initBackToTop() {
  try {
    const btn = qs('#back-to-top');
    if (!btn) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateBtn() {
      const show = window.scrollY > CONFIG.BACK_TO_TOP_PX;
      btn.classList.toggle('back-to-top--visible', show);
      btn.setAttribute('aria-hidden', String(!show));
    }

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      /* Return focus to top of page */
      const skipLink = qs('.skip-link');
      if (skipLink) skipLink.focus();
    });

    window.addEventListener('scroll', updateBtn, { passive: true });
    updateBtn();

  } catch (err) {
    console.warn('[YGPT] initBackToTop failed:', err);
  }
})();


/* ================================================================
   11 — EVENT DATE FILTERING
   M14: Reads data-date="YYYY-MM-DD" from .event-row elements;
        marks past events visually; filters out events older than 1yr.
================================================================ */
(function initEventDates() {
  try {
    const eventRows = qsa('.event-row[data-date]');
    if (!eventRows.length) return;

    const now    = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    eventRows.forEach(row => {
      const dateStr = row.getAttribute('data-date');
      if (!dateStr) return;

      const eventDate = new Date(dateStr);
      if (isNaN(eventDate.getTime())) return;

      if (eventDate < oneYearAgo) {
        /* Hide events older than 1 year */
        row.style.display = 'none';
        row.setAttribute('aria-hidden', 'true');
      } else if (eventDate < now) {
        /* Mark as past but keep visible */
        row.classList.add('event-row--past');
        const titleEl = row.querySelector('.ev-title');
        if (titleEl && !titleEl.querySelector('.past-badge')) {
          const badge = document.createElement('span');
          badge.className   = 'past-badge';
          badge.textContent = ' (Past)';
          badge.setAttribute('aria-label', 'past event');
          titleEl.appendChild(badge);
        }
      }
    });

  } catch (err) {
    console.warn('[YGPT] initEventDates failed:', err);
  }
})();


/* ================================================================
   12 — CITY QUERY PARAM PRE-FILL
   If contact.html?city=CityName, pre-fill the city select/input.
================================================================ */
(function initCityPrefill() {
  try {
    const params  = new URLSearchParams(window.location.search);
    const city    = params.get('city');
    if (!city) return;

    /* Try to find a city select or input on the contact form */
    const cityField = qs('[name="city"], #city, #contact-city');
    if (!cityField) return;

    if (cityField.tagName === 'SELECT') {
      const options = Array.from(cityField.options);
      const match   = options.find(o =>
        o.value.toLowerCase().includes(city.toLowerCase()) ||
        o.textContent.toLowerCase().includes(city.toLowerCase())
      );
      if (match) cityField.value = match.value;
    } else {
      cityField.value = city;
    }

  } catch (err) {
    console.warn('[YGPT] initCityPrefill failed:', err);
  }
})();