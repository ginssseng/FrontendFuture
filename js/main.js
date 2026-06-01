/* ═══════════════════════════════════════════════════
   FRONTEND FUTURE 2026 — main.js
   All interactive features & animations
═══════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────────────── */
const initCursor = () => {
  const dot = document.getElementById('cursor-dot');
  if (!dot) return;

  // Hide on touch devices
  if ('ontouchstart' in window) {
    dot.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let raf;

  const moveDot = () => {
    dotX += (mouseX - dotX) * 0.18;
    dotY += (mouseY - dotY) * 0.18;
    dot.style.left = dotX + 'px';
    dot.style.top  = dotY + 'px';
    raf = requestAnimationFrame(moveDot);
  };

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!raf) moveDot();
  });

  // Hover effect on interactive elements
  const hoverTargets = 'a, button, [data-bs-toggle], .speaker-card, .ticket-card, .stat-card, .testimonial-card, .social-btn, input, select, .form-check-input';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('cursor-hover');
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
  });
};


/* ─────────────────────────────────────────────────
   2. STICKY HEADER — scroll-aware class
───────────────────────────────────────────────── */
const initHeader = () => {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
};


/* ─────────────────────────────────────────────────
   3. SMOOTH SCROLL (nav links + any href="#id")
───────────────────────────────────────────────── */
const initSmoothScroll = () => {
  const HEADER_OFFSET = 80; // px — accounts for fixed header

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile navbar if open
      const navCollapse = document.getElementById('navbarContent');
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }

      // Update active nav link
      document.querySelectorAll('.navbar-nav .nav-link').forEach(l => l.classList.remove('active'));
      const matchingNav = document.querySelector(`.navbar-nav a[href="${targetId}"]`);
      if (matchingNav) matchingNav.classList.add('active');
    });
  });

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section[id], div[id="register"]');
  const navLinks  = document.querySelectorAll('.navbar-nav .nav-link');

  const highlightNav = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
};


/* ─────────────────────────────────────────────────
   4. COUNTDOWN TIMER
───────────────────────────────────────────────── */
const initCountdown = () => {
  const elDays  = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins  = document.getElementById('cd-mins');
  const elSecs  = document.getElementById('cd-secs');

  if (!elDays) return;

  // Conference date: April 15 2026, 09:00 Moscow time (UTC+3)
  const target = new Date('2026-04-15T09:00:00+03:00').getTime();

  const pad  = n => String(n).padStart(2, '0');
  const flip = (el, val) => {
    const newVal = pad(val);
    if (el.textContent !== newVal) {
      el.classList.add('cd-flip');
      el.textContent = newVal;
      setTimeout(() => el.classList.remove('cd-flip'), 400);
    }
  };

  const tick = () => {
    const now  = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      [elDays, elHours, elMins, elSecs].forEach(el => el.textContent = '00');
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    flip(elDays,  d);
    flip(elHours, h);
    flip(elMins,  m);
    flip(elSecs,  s);
  };

  tick();
  setInterval(tick, 1000);
};


/* ─────────────────────────────────────────────────
   5. SCROLL REVEAL — IntersectionObserver
───────────────────────────────────────────────── */
const initScrollReveal = () => {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling elements within same parent
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.querySelectorAll('.reveal:not(.revealed)')]
          : [];
        const delay = siblings.indexOf(entry.target) * 80;

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  items.forEach(el => observer.observe(el));
};


/* ─────────────────────────────────────────────────
   6. STATS COUNTER ANIMATION
───────────────────────────────────────────────── */
const initCounters = () => {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1600;
    const start    = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString('ru-RU');
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
};


/* ─────────────────────────────────────────────────
   7. SPEAKER MODAL — populate with data attributes
───────────────────────────────────────────────── */
const initSpeakerModal = () => {
  const modalEl = document.getElementById('speakerModal');
  if (!modalEl) return;

  modalEl.addEventListener('show.bs.modal', e => {
    const trigger = e.relatedTarget; // the card that triggered the modal
    if (!trigger) return;

    const get = attr => trigger.getAttribute('data-' + attr) || '';

    // Populate fields
    document.getElementById('smodal-name').textContent  = get('name');
    document.getElementById('smodal-role').textContent  = `${get('role')} · ${get('company')}`;
    document.getElementById('smodal-topic').textContent = get('topic');
    document.getElementById('smodal-talk').textContent  = get('talk');
    document.getElementById('smodal-bio').textContent   = get('bio');

    // Avatar
    const avatar = document.getElementById('smodal-avatar');
    avatar.textContent = get('initials');
    // Remove all av-* classes then add correct one
    avatar.className = 'smodal-avatar';
    avatar.classList.add(get('avatar-class'));
  });
};


/* ─────────────────────────────────────────────────
   8. REGISTRATION FORM VALIDATION
───────────────────────────────────────────────── */
const initForm = () => {
  const form      = document.getElementById('registerForm');
  const successEl = document.getElementById('form-success');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  // Real-time validation on blur
  const validateField = (field) => {
    field.classList.remove('is-valid', 'is-invalid');

    if (field.type === 'checkbox') {
      field.classList.add(field.checked ? 'is-valid' : 'is-invalid');
      return field.checked;
    }

    const valid = field.checkValidity();
    field.classList.add(valid ? 'is-valid' : 'is-invalid');
    return valid;
  };

  form.querySelectorAll('.reg-input, #reg-privacy').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate all fields
    const fields   = [...form.querySelectorAll('.reg-input, #reg-privacy')];
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      // Shake the form on error
      form.classList.add('form-shake');
      setTimeout(() => form.classList.remove('form-shake'), 500);

      // Focus first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Simulate async submission
    submitBtn.disabled = true;
    submitBtn.querySelector('.submit-text').classList.add('d-none');
    submitBtn.querySelector('.submit-loading').classList.remove('d-none');

    await new Promise(r => setTimeout(r, 1400)); // simulate network

    // Show success state
    form.classList.add('d-none');
    if (successEl) {
      successEl.classList.remove('d-none');
      // Animate in
      successEl.style.animation = 'fadeInUp .5s ease both';
    }
  });
};


/* ─────────────────────────────────────────────────
   9. CARD TILT EFFECT (desktop only)
───────────────────────────────────────────────── */
const initCardTilt = () => {
  if (window.matchMedia('(hover: none)').matches) return; // skip on touch

  const TILT_MAX   = 8;  // degrees
  const SCALE      = 1.03;

  const cards = document.querySelectorAll('.speaker-card, .ticket-card, .testimonial-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotateX = -dy * TILT_MAX;
      const rotateY =  dx * TILT_MAX;

      card.style.transform   = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${SCALE})`;
      card.style.transition  = 'transform .05s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform .4s cubic-bezier(.25,.46,.45,.94)';
    });
  });
};


/* ─────────────────────────────────────────────────
   10. HERO PARALLAX — subtle on mouse move
───────────────────────────────────────────────── */
const initHeroParallax = () => {
  const hero   = document.querySelector('.hero-section');
  const orb1   = document.querySelector('.hero-orb-1');
  const orb2   = document.querySelector('.hero-orb-2');
  const title  = document.querySelector('.hero-title');
  if (!hero || !orb1 || !orb2) return;

  if (window.matchMedia('(hover: none)').matches) return;

  let ticking = false;

  hero.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.width  / 2) / rect.width;
      const y = (e.clientY - rect.height / 2) / rect.height;

      orb1.style.transform = `translate(${x * 30}px, ${y * 20}px) scale(1)`;
      orb2.style.transform = `translate(${-x * 25}px, ${-y * 18}px) scale(1)`;
      if (title) title.style.transform = `translate(${x * 6}px, ${y * 4}px)`;

      ticking = false;
    });
  });

  hero.addEventListener('mouseleave', () => {
    orb1.style.transform  = '';
    orb2.style.transform  = '';
    if (title) title.style.transform = '';
    orb1.style.transition = 'transform .8s ease';
    orb2.style.transition = 'transform .8s ease';
  });
};


/* ─────────────────────────────────────────────────
   11. TICKER — pause on hover
───────────────────────────────────────────────── */
const initTicker = () => {
  const track = document.querySelector('.ticker-track');
  if (!track) return;

  const strip = document.querySelector('.ticker-strip');
  if (!strip) return;

  strip.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });

  strip.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
};


/* ─────────────────────────────────────────────────
   12. PROGRAM TABS — visual refresh on switch
───────────────────────────────────────────────── */
const initProgramTabs = () => {
  const tabBtns = document.querySelectorAll('.program-tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('shown.bs.tab', () => {
      // Re-trigger scroll reveal for newly visible accordion items
      const paneId   = btn.getAttribute('data-bs-target');
      const pane     = document.querySelector(paneId);
      if (!pane) return;

      pane.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('revealed');
        setTimeout(() => el.classList.add('revealed'), 80);
      });
    });
  });
};


/* ─────────────────────────────────────────────────
   13. ACCORDION — scroll into view on open (mobile)
───────────────────────────────────────────────── */
const initAccordionScroll = () => {
  document.querySelectorAll('.prog-item').forEach(item => {
    item.addEventListener('shown.bs.collapse', () => {
      if (window.innerWidth > 768) return;

      const btn = item.querySelector('.prog-btn');
      if (!btn) return;

      const top = btn.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};


/* ─────────────────────────────────────────────────
   14. TICKET CARD HIGHLIGHT — pulse featured card
───────────────────────────────────────────────── */
const initTicketHighlight = () => {
  const featured = document.querySelector('.ticket-card--featured');
  if (!featured) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => featured.classList.add('ticket-pulse'), 400);
        observer.unobserve(featured);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(featured);
};


/* ─────────────────────────────────────────────────
   15. GLITCH TITLE — extra random trigger
───────────────────────────────────────────────── */
const initGlitchTitle = () => {
  const titleLine = document.querySelector('.hero-title-line1');
  if (!titleLine) return;

  // Randomly re-trigger glitch on hover
  titleLine.addEventListener('mouseenter', () => {
    titleLine.style.animation = 'none';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        titleLine.style.animation = '';
      });
    });
  });
};


/* ─────────────────────────────────────────────────
   16. BACK TO TOP — appears after scroll
───────────────────────────────────────────────── */
const initBackToTop = () => {
  // Create button dynamically
  const btn = document.createElement('button');
  btn.id        = 'back-to-top';
  btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
  btn.setAttribute('aria-label', 'Наверх');
  document.body.appendChild(btn);

  // Styles injected via JS to keep CSS file focused
  const style = document.createElement('style');
  style.textContent = `
    #back-to-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 46px;
      height: 46px;
      background: var(--ink);
      color: var(--bg);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: none;
      z-index: 500;
      opacity: 0;
      transform: translateY(16px) scale(0.9);
      transition: opacity .35s ease, transform .35s ease, background .25s ease;
      pointer-events: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.18);
    }
    #back-to-top.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    #back-to-top:hover {
      background: var(--red);
      transform: translateY(-3px) scale(1);
    }
    .cd-flip {
      animation: cdFlip .35s ease;
    }
    @keyframes cdFlip {
      0%   { transform: translateY(0);    opacity: 1; }
      40%  { transform: translateY(-8px); opacity: 0; }
      60%  { transform: translateY(8px);  opacity: 0; }
      100% { transform: translateY(0);    opacity: 1; }
    }
    .form-shake {
      animation: shake .45s cubic-bezier(.36,.07,.19,.97);
    }
    @keyframes shake {
      10%, 90% { transform: translateX(-2px); }
      20%, 80% { transform: translateX(4px);  }
      30%, 50%, 70% { transform: translateX(-6px); }
      40%, 60% { transform: translateX(6px);  }
    }
    .ticket-pulse {
      animation: ticketPulse .7s ease;
    }
    @keyframes ticketPulse {
      0%   { box-shadow: 0 0 0 0 rgba(200,255,0,.45); }
      70%  { box-shadow: 0 0 0 18px rgba(200,255,0,0); }
      100% { box-shadow: 0 0 0 0 rgba(200,255,0,0); }
    }
    .navbar-nav .nav-link.active {
      color: var(--ink) !important;
    }
    .navbar-nav .nav-link.active::after {
      transform: scaleX(1);
    }
    .program-tab-btn.active {
      background: var(--ink) !important;
      color: var(--bg) !important;
      border-color: var(--ink) !important;
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};


/* ─────────────────────────────────────────────────
   17. SECTION ENTRANCE — big title split reveal
───────────────────────────────────────────────── */
const initSectionTitleReveal = () => {
  const titles = document.querySelectorAll('.section-title');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('title-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const style = document.createElement('style');
  style.textContent = `
    .section-title {
      clip-path: inset(0 100% 0 0);
      transition: clip-path .7s cubic-bezier(.77,0,.175,1);
    }
    .section-title.title-revealed {
      clip-path: inset(0 0% 0 0);
    }
  `;
  document.head.appendChild(style);

  titles.forEach(t => observer.observe(t));
};


/* ─────────────────────────────────────────────────
   18. KEYBOARD ACCESSIBILITY — focus ring on tab
───────────────────────────────────────────────── */
const initKeyboardA11y = () => {
  // Show focus styles only when navigating by keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

  const style = document.createElement('style');
  style.textContent = `
    .keyboard-nav *:focus-visible {
      outline: 2px solid var(--red) !important;
      outline-offset: 3px !important;
      border-radius: 4px;
    }
    body:not(.keyboard-nav) *:focus {
      outline: none !important;
    }
  `;
  document.head.appendChild(style);
};


/* ─────────────────────────────────────────────────
   19. PROGRAM ACCORDION — custom + / × icon toggle
───────────────────────────────────────────────── */
const initAccordionIcons = () => {
  // Bootstrap accordion fires show/hide events — we inject a custom icon span
  document.querySelectorAll('.prog-btn').forEach(btn => {
    // Inject icon span
    const icon = document.createElement('span');
    icon.className   = 'prog-custom-icon ms-auto flex-shrink-0';
    icon.innerHTML   = '<i class="bi bi-plus-lg"></i>';
    icon.style.cssText = 'font-size:1rem; color: inherit; transition: transform .3s ease;';
    btn.appendChild(icon);

    const collapseId = btn.getAttribute('data-bs-target');
    const collapse   = document.querySelector(collapseId);
    if (!collapse) return;

    collapse.addEventListener('show.bs.collapse', () => {
      icon.innerHTML = '<i class="bi bi-dash-lg"></i>';
      icon.style.transform = 'rotate(180deg)';
    });

    collapse.addEventListener('hide.bs.collapse', () => {
      icon.innerHTML = '<i class="bi bi-plus-lg"></i>';
      icon.style.transform = 'rotate(0deg)';
    });
  });
};


/* ─────────────────────────────────────────────────
   20. HERO SCROLL-OUT FADE
───────────────────────────────────────────────── */
const initHeroFadeOut = () => {
  const heroContent = document.querySelector('.hero-inner');
  if (!heroContent) return;

  const onScroll = () => {
    const scrolled = window.scrollY;
    const heroH    = document.querySelector('.hero-section')?.offsetHeight || 700;
    const opacity  = Math.max(1 - scrolled / (heroH * 0.5), 0);
    const translateY = scrolled * 0.15;

    heroContent.style.opacity   = opacity;
    heroContent.style.transform = `translateY(${translateY}px)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
};


/* ─────────────────────────────────────────────────
   INIT ALL — DOMContentLoaded
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initHeader();
  initSmoothScroll();
  initCountdown();
  initScrollReveal();
  initCounters();
  initSpeakerModal();
  initForm();
  initCardTilt();
  initHeroParallax();
  initTicker();
  initProgramTabs();
  initAccordionScroll();
  initTicketHighlight();
  initGlitchTitle();
  initBackToTop();
  initSectionTitleReveal();
  initKeyboardA11y();
  initAccordionIcons();
  initHeroFadeOut();

  // Mark page as loaded (for CSS transitions)
  document.body.classList.add('js-loaded');

  console.log('%c[FF26] JavaScript loaded ✓', 'color:#e63018; font-family:monospace; font-weight:bold;');
});
