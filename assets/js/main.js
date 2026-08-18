/*===============================================================
   INTERACTION LAYER
   Boot, cursor, nav, theme, reveals, split type, counters,
   tilt, magnetics — plus the three scroll engines:
     · scenes   — sections fly in and out of depth
     · gallery  — pinned horizontal project track
     · marquee  — kinetic skill lanes
===============================================================*/
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /*=============== BOOT ===============*/
  var boot = document.getElementById('boot');
  if (boot) {
    var dismiss = function () { boot.classList.add('boot--done'); };
    if (document.readyState === 'complete') dismiss();
    else window.addEventListener('load', dismiss);
    setTimeout(dismiss, 1600);
  }

  /*=============== CURSOR ===============*/
  var cursor = document.getElementById('cursor');
  var cursorGlow = document.getElementById('cursor-glow');

  if (canHover && !reduceMotion) {
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;
    var glowRaf = null;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;

      if (cursor && !cursor.classList.contains('awake')) cursor.classList.add('awake');
      if (cursorGlow && !cursorGlow.classList.contains('active')) cursorGlow.classList.add('active');

      if (glowRaf) return;
      glowRaf = requestAnimationFrame(function () {
        document.documentElement.style.setProperty('--mx', mx + 'px');
        document.documentElement.style.setProperty('--my', my + 'px');
        glowRaf = null;
      });
    }, { passive: true });

    if (cursor) {
      (function trail() {
        cx += (mx - cx) * 0.16;
        cy += (my - cy) * 0.16;
        cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
        requestAnimationFrame(trail);
      })();

      var HOT = 'a, button, .skills__item, [data-tilt], input, textarea';
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest && e.target.closest(HOT)) cursor.classList.add('hot');
      }, { passive: true });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest && e.target.closest(HOT)) cursor.classList.remove('hot');
      }, { passive: true });
    }
  }

  /*=============== MOBILE NAV ===============*/
  var navMenu = document.getElementById('nav-menu');
  var navToggle = document.getElementById('nav-toggle');
  var navClose = document.getElementById('nav-close');
  var navOverlay = document.getElementById('nav-overlay');

  function openMenu() {
    if (!navMenu) return;
    navMenu.classList.add('show-menu');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('show-menu');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navToggle) navToggle.addEventListener('click', openMenu);
  if (navClose) navClose.addEventListener('click', closeMenu);
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav__link').forEach(function (l) {
    l.addEventListener('click', closeMenu);
  });

  /*=============== SCROLL: header, progress, field, HUD % ===============*/
  var header = document.getElementById('header');
  var progressBar = document.querySelector('.progress__bar');
  var field = document.getElementById('field');
  var hudPct = document.getElementById('hud-pct');
  var scrollTick = false;

  function onScroll() {
    var y = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var p = docH > 0 ? Math.min(y / docH, 1) : 0;

    if (header) header.classList.toggle('scrolled', y >= 50);
    if (progressBar) progressBar.style.transform = 'scaleX(' + p + ')';
    if (hudPct) hudPct.textContent = Math.round(p * 100) + '%';

    // The field recedes past the hero so content stays legible over it
    if (field) {
      var fade = Math.max(0, 1 - y / (window.innerHeight * 0.9));
      field.style.opacity = (0.3 + fade * 0.7).toFixed(3);
    }
    if (window.Field) window.Field.setScroll(p);

    scrollTick = false;
  }

  window.addEventListener('scroll', function () {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /*=============== ACTIVE NAV LINK + HUD INDEX ===============*/
  var hudIndex = document.getElementById('hud-index');
  var SECTION_ORDER = ['home', 'experience', 'about', 'projects', 'skills', 'contact'];
  var SECTION_NAMES = {
    home: 'Home', experience: 'Experience', about: 'About',
    projects: 'Projects', skills: 'Skills', contact: 'Contact'
  };

  var navLinks = {};
  document.querySelectorAll('.nav__link[href^="#"]').forEach(function (l) {
    navLinks[l.getAttribute('href').slice(1)] = l;
  });

  var sectionObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;

      Object.keys(navLinks).forEach(function (key) {
        navLinks[key].classList.toggle('active-link', key === id);
      });

      if (hudIndex) {
        var idx = SECTION_ORDER.indexOf(id);
        if (idx >= 0) {
          hudIndex.textContent =
            '0' + (idx + 1) + ' / 0' + SECTION_ORDER.length + ' — ' + SECTION_NAMES[id];
        }
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('section[id]').forEach(function (s) { sectionObs.observe(s); });

  /*=============== THEME ===============*/
  var themeBtn = document.getElementById('theme-button');

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }
  function paintThemeIcon() {
    if (!themeBtn) return;
    var icon = themeBtn.querySelector('i');
    if (icon) icon.className = isLight() ? 'ri-sun-line' : 'ri-moon-line';
  }

  if (themeBtn) {
    paintThemeIcon();
    themeBtn.addEventListener('click', function () {
      var light = !isLight();
      if (light) document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');

      localStorage.setItem('theme', light ? 'light' : 'dark');
      paintThemeIcon();
      if (window.Field) window.Field.setTheme(light);
    });
  }
  if (window.Field && isLight()) window.Field.setTheme(true);

  /*=============== REVEALS ===============*/
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger')
    .forEach(function (el) { revealObs.observe(el); });

  /*=============== SPLIT TYPE ===============*/
  function splitText(root, mode, baseDelay, step) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    var index = 0;

    textNodes.forEach(function (node) {
      if (!node.nodeValue.trim()) return;

      var parts = mode === 'chars'
        ? node.nodeValue.split('')
        : node.nodeValue.split(/(\s+)/);

      var frag = document.createDocumentFragment();

      parts.forEach(function (part) {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          var gap = document.createElement('span');
          gap.className = 'split__space';
          frag.appendChild(gap);
          return;
        }
        var unit = document.createElement('span');
        unit.className = 'split__unit';
        unit.textContent = part;
        unit.style.transitionDelay = (baseDelay + index * step).toFixed(3) + 's';
        index++;
        frag.appendChild(unit);
      });

      node.parentNode.replaceChild(frag, node);
    });

    root.classList.add('split');
  }

  document.querySelectorAll('[data-split]').forEach(function (el) {
    var target = el.firstElementChild && !el.firstElementChild.nextElementSibling
      ? el.firstElementChild
      : el;
    splitText(target, 'chars', 0.35, 0.045);
    revealObs.observe(target);
  });

  document.querySelectorAll('[data-split-words]').forEach(function (el) {
    splitText(el, 'words', 0, 0.075);
    revealObs.observe(el);
  });

  /*=============== COUNTERS ===============*/
  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;

      var el = e.target;
      var target = parseInt(el.dataset.target, 10) || 0;
      counterObs.unobserve(el);

      if (reduceMotion) { el.textContent = target + '+'; return; }

      var duration = 1400;
      var start = null;

      requestAnimationFrame(function tick(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + '+';
        if (t < 1) requestAnimationFrame(tick);
      });
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(function (el) { counterObs.observe(el); });

  /*=============== SLAB TILT + SHEEN ===============*/
  if (canHover && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt-max')) || 8;
      var depths = el.querySelectorAll('[data-depth]');
      var raf = null;
      var mouse = { x: 0, y: 0 };

      function apply() {
        var rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) { raf = null; return; }

        var px = (mouse.x - rect.left) / rect.width;
        var py = (mouse.y - rect.top) / rect.height;

        var rx = (0.5 - py) * max;
        var ry = (px - 0.5) * max;

        el.style.transform =
          'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translate3d(0,-6px,0)';
        el.style.setProperty('--sx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--sy', (py * 100).toFixed(1) + '%');

        raf = null;
      }

      el.addEventListener('pointerenter', function () {
        el.style.transitionDuration = '0.12s';
        depths.forEach(function (d) {
          d.style.transform = 'translateZ(' + (parseFloat(d.getAttribute('data-depth')) || 0) + 'px)';
        });
      });

      el.addEventListener('pointermove', function (ev) {
        mouse.x = ev.clientX;
        mouse.y = ev.clientY;
        if (!raf) raf = requestAnimationFrame(apply);
      }, { passive: true });

      el.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        el.style.transitionDuration = '';
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0)';
        depths.forEach(function (d) { d.style.transform = 'translateZ(0)'; });
      });
    });

    /* Sheen tracking for non-tilt slabs (gallery cards, stack cards) */
    document.querySelectorAll('.slab:not([data-tilt])').forEach(function (el) {
      el.addEventListener('pointermove', function (ev) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--sx', ((ev.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        el.style.setProperty('--sy', ((ev.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  }

  /*=============== MAGNETIC CONTROLS ===============*/
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var raf = null;
      var mouse = { x: 0, y: 0 };

      function pull() {
        var rect = el.getBoundingClientRect();
        var dx = (mouse.x - (rect.left + rect.width / 2)) / rect.width;
        var dy = (mouse.y - (rect.top + rect.height / 2)) / rect.height;
        el.style.transform = 'translate3d(' + (dx * 14).toFixed(2) + 'px,' + (dy * 12).toFixed(2) + 'px,0)';
        raf = null;
      }

      el.addEventListener('pointermove', function (ev) {
        mouse.x = ev.clientX;
        mouse.y = ev.clientY;
        if (!raf) raf = requestAnimationFrame(pull);
      }, { passive: true });

      el.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        el.style.transform = '';
      });
    });
  }

  /*===============================================================
     SCENE ENGINE — sections fly in from depth and recede past
     the camera. Runs on one master rAF loop with the gallery.
  ===============================================================*/
  var scenes = [];
  if (!reduceMotion) {
    document.querySelectorAll('.scene').forEach(function (el) {
      scenes.push({ el: el, live: true });
    });
  }

  function sceneFrame(vh) {
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var r = s.el.getBoundingClientRect();

      // Far outside the viewport: settle once, then skip.
      if (r.top > vh * 1.4 || r.bottom < -vh * 0.4) {
        if (s.live) {
          s.el.style.transform = '';
          s.el.style.opacity = '';
          s.live = false;
        }
        continue;
      }
      s.live = true;

      // Entering: rises out of depth, tilting upright.
      var ein = clamp((vh - r.top) / (vh * 0.85), 0, 1);
      var e = 1 - Math.pow(1 - ein, 3);

      // Leaving: lifts toward the camera and dissolves.
      var eout = clamp((vh * 0.45 - r.bottom) / (vh * 0.45), 0, 1);
      var o = eout * eout;

      var ty = (1 - e) * 90 - o * 70;
      var rx = (1 - e) * 7;
      var sc = 0.955 + 0.045 * e + o * 0.03;
      var op = Math.min(0.25 + 0.75 * e, 1 - o * 0.6);

      s.el.style.transform =
        'perspective(1400px) translate3d(0,' + ty.toFixed(1) + 'px,0) rotateX(' + rx.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
      s.el.style.opacity = op.toFixed(3);

      // Drives the ghost numeral's parallax.
      s.el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height), 0, 1).toFixed(3));
    }
  }

  /*===============================================================
     PROJECT GALLERY — vertical scroll drives the track sideways;
     cards rotate in 3D as they cross the center of the stage.
  ===============================================================*/
  var pin = document.getElementById('proj-pin');
  var track = document.getElementById('proj-track');
  var galleryCards = track ? Array.prototype.slice.call(track.children) : [];
  var galleryOn = false;
  var maxShift = 0;

  function setupGallery() {
    if (!pin || !track) return;
    var wide = window.matchMedia('(min-width: 1024px)').matches && !reduceMotion;

    if (!wide) {
      galleryOn = false;
      pin.style.height = '';
      track.style.transform = '';
      galleryCards.forEach(function (c) { c.style.transform = ''; });
      return;
    }

    galleryOn = true;
    track.style.transform = 'translate3d(0,0,0)';
    maxShift = Math.max(track.scrollWidth - window.innerWidth, 0);
    pin.style.height = (window.innerHeight + maxShift) + 'px';
  }

  function galleryFrame(vh) {
    if (!galleryOn || maxShift <= 0) return;

    var top = pin.getBoundingClientRect().top;
    var p = clamp(-top / maxShift, 0, 1);
    track.style.transform = 'translate3d(' + (-p * maxShift).toFixed(1) + 'px,0,0)';

    var vw = window.innerWidth;
    for (var i = 0; i < galleryCards.length; i++) {
      var cr = galleryCards[i].getBoundingClientRect();
      if (cr.right < -100 || cr.left > vw + 100) continue;
      var cc = (cr.left + cr.width / 2 - vw / 2) / vw;
      var ry = -cc * 10;
      var sc2 = 1 - Math.min(Math.abs(cc), 0.6) * 0.07;
      galleryCards[i].style.transform =
        'perspective(1200px) rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc2.toFixed(3) + ')';
    }
  }

  // Keyboard users: when focus lands inside an off-screen card,
  // jump the window scroll so the pinned track brings it into view.
  // Keyboard focus only — mouse clicks focus links too, and recentering
  // mid-click would move the control out from under the cursor.
  if (track) {
    track.addEventListener('focusin', function (e) {
      if (!galleryOn || maxShift <= 0) return;
      if (!e.target.matches(':focus-visible')) return;
      var card = e.target.closest('.project-card');
      if (!card) return;
      var targetP = clamp(
        (card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2) / maxShift, 0, 1);
      var pinTop = pin.getBoundingClientRect().top + window.scrollY;
      // 'instant' so the CSS smooth-scroll doesn't animate the jump
      window.scrollTo({ top: pinTop + targetP * maxShift, behavior: 'instant' });
    });
  }

  /*=============== MASTER LOOP ===============*/
  if (!reduceMotion && (scenes.length || pin)) {
    (function masterLoop() {
      if (!document.hidden) {
        var vh = window.innerHeight;
        sceneFrame(vh);
        galleryFrame(vh);
      }
      requestAnimationFrame(masterLoop);
    })();
  }

  /*=============== DEMO MEDIA LAZY LOAD (Loom + self-hosted) ===============*/
  document.querySelectorAll('.project-card').forEach(function (card) {
    var iframe = card.querySelector('.project-card__loom');
    if (iframe) {
      card.addEventListener('mouseenter', function () {
        if (!iframe.src && iframe.dataset.src) iframe.src = iframe.dataset.src;
      });
      card.addEventListener('mouseleave', function () {
        if (iframe.src) iframe.src = '';
      });
    }

    var video = card.querySelector('.project-card__video');
    if (video) {
      card.addEventListener('mouseenter', function () {
        if (!video.src && video.dataset.src) video.src = video.dataset.src;
        video.play().catch(function () {});
      });
      card.addEventListener('mouseleave', function () {
        video.pause();
        video.currentTime = 0;
      });
    }
  });

  /*=============== VIDEO MODAL ===============*/
  var videoModal = document.getElementById('video-modal');
  var modalVideo = document.getElementById('modal-video');
  var modalClose = document.getElementById('video-modal-close');
  var vmOverlay = document.querySelector('.video-modal__overlay');

  function closeModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (vmOverlay) vmOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (videoModal && videoModal.classList.contains('active')) closeModal();
    else if (navMenu && navMenu.classList.contains('show-menu')) closeMenu();
  });

  /*=============== SMOOTH SCROLL ===============*/
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');

      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      // offsetTop is layout-truth: unaffected by in-flight scene transforms.
      var offset = (header ? header.offsetHeight : 0) + 16;
      window.scrollTo({
        top: Math.max(target.offsetTop - offset, 0),
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  /*=============== SETUP + RESIZE ===============*/
  function setupAll() {
    setupGallery();
  }

  if (document.readyState === 'complete') setupAll();
  else window.addEventListener('load', setupAll);
  setupAll();

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupAll, 200);
  }, { passive: true });
})();
