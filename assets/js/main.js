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

/*=============== THEME TOGGLE ===============*/
const themeBtn = document.getElementById('theme-button');
const saved = localStorage.getItem('theme');
if (saved === 'light') {
  document.body.classList.add('light-theme');
  themeBtn.querySelector('i').classList.replace('ri-moon-line', 'ri-sun-line');
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const icon = themeBtn.querySelector('i');
  icon.classList.toggle('ri-moon-line');
  icon.classList.toggle('ri-sun-line');
  localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
});

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

/*=============== TERMINAL AUTO-SCROLL ANIMATION ===============*/
const terminalScroll = document.getElementById('terminal-scroll');
if (terminalScroll) {
  const agents = [
    // Agent Teams
    { name: 'DevAgent-Lead', status: 'running', team: 'dev-team', desc: 'code review & architecture' },
    { name: 'DevAgent-Frontend', status: 'running', team: 'dev-team', desc: 'React component generation' },
    { name: 'DevAgent-Backend', status: 'running', team: 'dev-team', desc: 'API & service development' },
    { name: 'DevAgent-QA', status: 'running', team: 'dev-team', desc: 'test generation & validation' },
    { name: 'ProductLead-Agent', status: 'running', team: 'product', desc: 'requirements & roadmap' },
    // Always-on agents
    { name: 'CredOS-Agent', status: 'active', team: 'production', desc: 'credit analysis pipeline' },
    { name: 'DocParser-AI', status: 'active', team: 'production', desc: 'document extraction & OCR' },
    { name: 'WorkflowBot', status: 'active', team: 'production', desc: 'n8n orchestration engine' },
    { name: 'SlackAssist', status: 'active', team: 'production', desc: 'team comms automation' },
    { name: 'Claude-Code', status: 'active', team: 'daily', desc: 'daily coding partner' },
    // More specialized agents
    { name: 'EmailDraft-AI', status: 'running', team: 'automation', desc: 'smart email composition' },
    { name: 'MeetingNotes-Agent', status: 'running', team: 'automation', desc: 'transcript summarization' },
    { name: 'ResearchBot', status: 'running', team: 'research', desc: 'web research & synthesis' },
    { name: 'DataPipeline-Agent', status: 'running', team: 'data', desc: 'ETL & data transformation' },
    { name: 'PRReviewer', status: 'running', team: 'dev-team', desc: 'automated code review' },
    { name: 'TestGen-Agent', status: 'running', team: 'dev-team', desc: 'unit & integration tests' },
    { name: 'DeployBot', status: 'running', team: 'devops', desc: 'CI/CD orchestration' },
    { name: 'MonitorAgent', status: 'running', team: 'devops', desc: 'uptime & health checks' },
    { name: 'ContentWriter-AI', status: 'running', team: 'content', desc: 'blog & docs generation' },
    { name: 'SchedulerBot', status: 'running', team: 'daily', desc: 'calendar optimization' },
    { name: 'BugHunter-Agent', status: 'running', team: 'dev-team', desc: 'error detection & fixes' },
    { name: 'APIIntegrator', status: 'running', team: 'automation', desc: 'third-party API bridges' },
  ];

  const inner = document.createElement('div');
  inner.className = 'hero__terminal-scroll-inner';
  terminalScroll.appendChild(inner);

  let currentIndex = 0;
  const VISIBLE = 5;
  const INTERVAL = 2200;

  function createLine(agent, delay) {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    div.style.animationDelay = delay + 'ms';
    div.innerHTML = `<span class="agent-name">${agent.name}</span> <span class="status">${agent.status}</span> <span class="team">[${agent.team}]</span> <span class="desc">${agent.desc}</span>`;
    return div;
  }

  // Initial load — show first batch
  function showInitialBatch() {
    for (let i = 0; i < VISIBLE; i++) {
      const agent = agents[i % agents.length];
      inner.appendChild(createLine(agent, i * 120));
    }
    currentIndex = VISIBLE;
  }

  // Scroll: remove top line, add new one at bottom
  function scrollNext() {
    const lines = inner.querySelectorAll('.terminal-line');
    if (lines.length > 0) {
      const first = lines[0];
      first.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      first.style.opacity = '0';
      first.style.transform = 'translateY(-10px)';

      setTimeout(() => {
        first.remove();
        const agent = agents[currentIndex % agents.length];
        inner.appendChild(createLine(agent, 0));
        currentIndex++;
      }, 400);
    }
  }

  // Start after initial typing animation
  setTimeout(() => {
    showInitialBatch();
    setInterval(scrollNext, INTERVAL);
  }, 1200);
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
