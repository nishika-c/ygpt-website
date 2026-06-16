/**
 * nav.js — YGPT Navigation
 * Injects consistent navbar HTML across all pages and handles:
 *  - Active state detection (homepage + inner pages)
 *  - Hamburger menu toggle
 *  - Dropdown for "Grow" submenu
 *  - Sticky scroll shadow
 *  - Back-to-top button
 */
(function () {
  'use strict';

  /* ─── 1. DETERMINE ACTIVE PAGE ─────────────────────────────────────── */
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  function isActive(href) {
    if (!href) return false;
    if (href === 'index.html') {
      return page === 'index.html' || page === '' || path === '/';
    }
    if (href.startsWith('#')) {
      return page === 'index.html' || page === '' || path === '/';
    }
    return page === href;
  }

  /* ─── 2. NAV DATA ───────────────────────────────────────────────────── */
  const navItems = [
    { label: 'Home',        href: 'index.html' },
    { label: 'About',       href: 'about.html' },
    { label: 'Initiatives', href: '#initiatives' },
    { label: 'Events',      href: 'events.html' },
    { label: 'Clubs',       href: 'clubs.html' },
    { label: 'Contact',     href: 'contact.html' },
    {
      label: 'Grow',
      href: '#sponsors',
      dropdown: [
        { label: 'Resources',              href: 'resources.html' },
        { label: 'Learning (Coming Soon)', href: '#', comingSoon: true },
      ],
    },
  ];

  /* ─── 3. BUILD NAV HTML ─────────────────────────────────────────────── */
  function buildNavLinks() {
    return navItems.map(item => {
      const active = isActive(item.href) ? ' class="active" aria-current="page"' : '';

      if (item.dropdown) {
        const ddItems = item.dropdown.map(sub => {
          const cs = sub.comingSoon
            ? ' <span class="nav-badge" aria-label="Coming soon">Soon</span>'
            : '';
          const disabled = sub.comingSoon ? ' aria-disabled="true" tabindex="-1"' : '';
          return `<li><a href="${sub.href}"${disabled}>${sub.label}${cs}</a></li>`;
        }).join('');

        return `
        <li class="nav-has-dropdown">
          <a href="${item.href}"${active}>
            ${item.label} <span class="nav-dropdown-indicator" aria-hidden="true">&#9660;</span>
          </a>
          <ul class="nav-dropdown" role="list">
            ${ddItems}
          </ul>
        </li>`;
      }

      return `<li><a href="${item.href}"${active}>${item.label}</a></li>`;
    }).join('');
  }

  /* ─── 4. INJECT NAVBAR ──────────────────────────────────────────────── */
  function injectNav() {
    const existing = document.getElementById('navbar');
    if (!existing) return;

    if (existing.children.length > 1) {
      enhanceNav(existing);
      if (typeof window._initHamburger    === 'function') window._initHamburger();
      if (typeof window._initGrowDropdown === 'function') window._initGrowDropdown();
      return;
    }

    existing.innerHTML = `
      <a href="index.html" class="nav-brand">
        <img src="assets/images/logo.png"
             alt="YGPT — Youth For Global Peace &amp; Transformation"
             class="nav-logo"
             width="160" height="44"
             loading="eager"
             decoding="auto"
             fetchpriority="high">
      </a>

      <ul class="nav-links" id="nav-links" role="list">
        ${buildNavLinks()}
      </ul>

      <div class="nav-actions">
        <a href="index.html#newsletter" class="btn-dark nav-cta">Join Now</a>
        <button class="nav-icon-btn" type="button" aria-label="Notifications" title="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <a href="contact.html" class="nav-icon-btn" aria-label="Join YGPT — member profile" title="Join / Profile">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>
      </div>

      <button class="nav-hamburger"
              type="button"
              aria-label="Open navigation menu"
              aria-expanded="false"
              aria-controls="nav-links">&#9776;</button>
    `;

    enhanceNav(existing);

    /* TASK 1 FIX: re-init main.js hamburger + dropdown after nav injection */
    if (typeof window._initHamburger    === 'function') window._initHamburger();
    if (typeof window._initGrowDropdown === 'function') window._initGrowDropdown();
  }

  /* ─── 5. ENHANCE: HAMBURGER + DROPDOWN + SCROLL SHADOW ─────────────── */
  function enhanceNav(nav) {
    const hamburger = nav.querySelector('.nav-hamburger');
    const navLinks  = nav.querySelector('#nav-links') || nav.querySelector('.nav-links');

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('nav-open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        hamburger.innerHTML = isOpen ? '&times;' : '&#9776;';
      });

      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinks.classList.contains('nav-open')) {
          navLinks.classList.remove('nav-open');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open navigation menu');
          hamburger.innerHTML = '&#9776;';
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('nav-open')) {
          navLinks.classList.remove('nav-open');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open navigation menu');
          hamburger.innerHTML = '&#9776;';
          hamburger.focus();
        }
      });
    }

    nav.querySelectorAll('.nav-has-dropdown').forEach(item => {
      const toggle   = item.querySelector('a');
      const dropdown = item.querySelector('.nav-dropdown');
      if (!toggle || !dropdown) return;

      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const open = item.classList.toggle('dropdown-open');
          toggle.setAttribute('aria-expanded', String(open));
        }
      });

      document.addEventListener('click', (e) => {
        if (!item.contains(e.target)) {
          item.classList.remove('dropdown-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    const onScroll = () => {
      nav.classList.toggle('navbar--scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── 6. BACK-TO-TOP BUTTON ─────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      const show = window.scrollY > 400;
      btn.setAttribute('aria-hidden', String(!show));
      btn.classList.toggle('visible', show);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── 7. DYNAMIC COPYRIGHT YEAR ────────────────────────────────────── */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ─── 8. INIT ────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectNav();
      initBackToTop();
      setYear();
    });
  } else {
    injectNav();
    initBackToTop();
    setYear();
  }

})();