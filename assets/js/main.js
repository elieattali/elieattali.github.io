(function () {
  'use strict';

  var root = document.documentElement;
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /* Thème clair / sombre ------------------------------------------------- */

  function currentTheme() {
    return root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
  }

  // Doit correspondre à --bg dans style.css
  var THEME_COLORS = { light: '#f7f6f2', dark: '#0d0f12' };

  function syncThemeColor() {
    var color = THEME_COLORS[currentTheme()];
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute('content', color);
    });
  }

  var themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeColor();
    });
  }

  if (root.hasAttribute('data-theme')) syncThemeColor();

  /* Menu mobile ---------------------------------------------------------- */

  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  function setMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navMenu.classList.toggle('is-open', open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) setMenu(false);
    });
  }

  /* Liens internes ------------------------------------------------------- */

  // Défilement vers la section sans ajouter d'ancre à l'URL : un
  // rechargement ramène ainsi toujours en haut de page.
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var id = link.getAttribute('href').slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    var behavior = reduceMotion.matches ? 'auto' : 'smooth';
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: behavior });
    } else {
      target.scrollIntoView({ behavior: behavior, block: 'start' });
    }

    // Déplace le focus clavier vers la section ciblée
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* En-tête au défilement ------------------------------------------------ */

  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Apparition progressive et section active ----------------------------- */

  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    // Léger décalage entre éléments voisins d'un même groupe
    document.querySelectorAll('.projects, .skills, .hero .container').forEach(function (group) {
      group.querySelectorAll('.reveal').forEach(function (el, i) {
        el.style.setProperty('--delay', (i * 0.08) + 's');
      });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { revealObserver.observe(el); });

    var navLinks = document.querySelectorAll('.nav-menu a');
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Année du pied de page ------------------------------------------------ */

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
