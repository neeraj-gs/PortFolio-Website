/*=============== CURSOR GLOW ===============*/
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
  let raf = null;
  document.addEventListener('mousemove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
      raf = null;
    });
  });
  document.addEventListener('mousemove', () => cursorGlow.classList.add('active'), { once: true });
}

/*=============== MOBILE NAV ===============*/
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navOverlay = document.getElementById('nav-overlay');

const openMenu = () => {
  navMenu.classList.add('show-menu');
  if (navOverlay) navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};
const closeMenu = () => {
  navMenu.classList.remove('show-menu');
  if (navOverlay) navOverlay.classList.remove('active');
  document.body.style.overflow = '';
};

if (navToggle) navToggle.addEventListener('click', openMenu);
if (navClose) navClose.addEventListener('click', closeMenu);
if (navOverlay) navOverlay.addEventListener('click', closeMenu);
document.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeMenu));

/*=============== HEADER SCROLL ===============*/
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY >= 50);
});

/*=============== ACTIVE NAV LINK ===============*/
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  sections.forEach(s => {
    const top = s.offsetTop - 100;
    const h = s.offsetHeight;
    const id = s.getAttribute('id');
    const link = document.querySelector(`.nav__link[href*="${id}"]`);
    if (link) link.classList.toggle('active-link', y > top && y <= top + h);
  });
});

/*=============== THEME TOGGLE (soft-disabled: dark-only for now, see CLAUDE.md) ===============*/
const themeBtn = document.getElementById('theme-button');
localStorage.removeItem('theme');

/*=============== SCROLL REVEAL ===============*/
const revealObs = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger').forEach(el => {
  revealObs.observe(el);
});

/*=============== TEXT REVEAL ===============*/
document.querySelectorAll('.text-reveal').forEach(el => {
  // Keep child elements (like spans with classes) intact
  const children = el.children;
  if (children.length === 0) {
    // Pure text — split words
    const text = el.textContent.trim();
    el.innerHTML = text.split(' ').map(w => `<span>${w}&nbsp;</span>`).join('');
  } else {
    // Already has children — wrap each child's text
    Array.from(children).forEach(child => {
      child.style.display = 'inline-block';
      child.style.transform = 'translateY(115%)';
      child.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  }
  revealObs.observe(el);
});

// When text-reveal becomes visible, animate children
const origAdd = DOMTokenList.prototype.add;
DOMTokenList.prototype.add = function(...tokens) {
  origAdd.apply(this, tokens);
  if (tokens.includes('visible') && this._element && this._element.classList.contains('text-reveal')) {
    Array.from(this._element.children).forEach((child, i) => {
      setTimeout(() => { child.style.transform = 'translateY(0)'; }, i * 60);
    });
  }
};
// Patch _element reference
document.querySelectorAll('.text-reveal').forEach(el => {
  el.classList._element = el;
});

/*=============== COUNTER ANIMATION ===============*/
const counterObs = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.target);
      let cur = 0;
      const step = target / 35;
      const timer = setInterval(() => {
        cur += step;
        if (cur >= target) {
          el.textContent = target + '+';
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(cur) + '+';
        }
      }, 35);
      counterObs.unobserve(el);
    }
  }),
  { threshold: 0.5 }
);
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

/*=============== 3D TILT ON PROJECT CARDS ===============*/
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
}

/*=============== LOOM VIDEO LAZY LOAD ===============*/
document.querySelectorAll('.project-card').forEach(card => {
  const iframe = card.querySelector('.project-card__loom');
  if (iframe) {
    card.addEventListener('mouseenter', () => {
      if (!iframe.src && iframe.dataset.src) iframe.src = iframe.dataset.src;
    });
    card.addEventListener('mouseleave', () => {
      if (iframe.src) iframe.src = '';
    });
  }
});

/*=============== VIDEO MODAL ===============*/
const videoModal = document.getElementById('video-modal');
const modalVideo = document.getElementById('modal-video');
const modalClose = document.getElementById('video-modal-close');
const vmOverlay = document.querySelector('.video-modal__overlay');

const closeVM = () => {
  if (!videoModal) return;
  videoModal.classList.remove('active');
  document.body.style.overflow = '';
  modalVideo.pause();
  modalVideo.currentTime = 0;
};
if (modalClose) modalClose.addEventListener('click', closeVM);
if (vmOverlay) vmOverlay.addEventListener('click', closeVM);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModal?.classList.contains('active')) closeVM();
});

/*=============== VANTA.JS NET — SUBTLE HERO BACKGROUND ===============*/
let vantaEffect = null;

function initVanta() {
  if (typeof VANTA === 'undefined') return;

  const isLight = document.body.classList.contains('light-theme');

  if (vantaEffect) vantaEffect.destroy();

  vantaEffect = VANTA.NET({
    el: '#home',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1.0,
    scaleMobile: 0.4,
    color: isLight ? 0xea580c : 0xff6b35,
    backgroundColor: isLight ? 0xfafafa : 0x06060b,
    points: 4,
    maxDistance: 25,
    spacing: 25,
    showDots: true,
  });

  document.getElementById('home').classList.add('vanta-active');
}

if (typeof VANTA !== 'undefined') initVanta();

themeBtn.addEventListener('click', () => {
  setTimeout(initVanta, 50);
});

/*=============== SMOOTH SCROLL ===============*/
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - header.offsetHeight - 20,
        behavior: 'smooth'
      });
    }
  });
});
