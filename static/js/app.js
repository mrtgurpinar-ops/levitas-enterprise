/* ===================================================================
   Levitas Enterprise — Core Client Controller & Live Terminal Engine
   21st.dev Dynamic Interactive Engine & Mobile Performance Core
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initLiveTerminal();
  initMobileBottomNav();
});

/* 1. Navbar Glassmorphism Scroll Handler (Passive 60fps Listener) */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 30) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* 2. Live Autonomous Agent Simulator (Terminal in Hero) */
function initLiveTerminal() {
  const terminalLines = [
    { prefix: '[SYSTEM]', text: 'Levitas Multi-Agent Swarm v2.4 initialized.', type: 'muted' },
    { prefix: '[INGEST]', text: 'Customer intent parsed: "Auto repair quote via WhatsApp audio"', type: 'cyan' },
    { prefix: '[WHISPER-AI]', text: 'De-noised & transcribed in 140ms (TR_TR 99.4% confidence)', type: 'emerald' },
    { prefix: '[ROUTING]', text: 'Dispatched to Gemini 3.1 & Claude 3.7 Cascade pipeline...', type: 'purple' },
    { prefix: '[SCHEMA]', text: 'Generated structured Pydantic parts list & labor estimate JSON', type: 'cyan' },
    { prefix: '[ERP-SYNC]', text: 'PostgreSQL record #84920 created. PDF quote generated in 1.2s', type: 'gold' },
    { prefix: '[DISPATCH]', text: 'WhatsApp Business Cloud API Webhook response sent (HTTP 200 OK)', type: 'emerald' }
  ];

  const terminalBody = document.getElementById('liveTerminalBody');
  if (!terminalBody) return;

  let lineIndex = 0;
  let timerId = null;

  function addTerminalLine() {
    // If document is not visible, delay adding lines to save battery
    if (document.hidden) {
      timerId = setTimeout(addTerminalLine, 2000);
      return;
    }

    if (lineIndex >= terminalLines.length) {
      timerId = setTimeout(() => {
        terminalBody.innerHTML = `
          <div class="t-line">
            <span class="t-prefix">[RE-CYCLE]</span>
            <span class="t-text muted">Pipeline auto-optimized. Listening for next event...</span>
          </div>
        `;
        lineIndex = 0;
        timerId = setTimeout(addTerminalLine, 1200);
      }, 3500);
      return;
    }

    const item = terminalLines[lineIndex];
    const lineEl = document.createElement('div');
    lineEl.className = 't-line animate-fade-in';
    lineEl.innerHTML = `
      <span class="t-prefix">${item.prefix}</span>
      <span class="t-text ${item.type}">${item.text}</span>
    `;

    terminalBody.appendChild(lineEl);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    lineIndex++;

    const delay = Math.floor(Math.random() * 500) + 650;
    timerId = setTimeout(addTerminalLine, delay);
  }

  // Start terminal typing
  setTimeout(addTerminalLine, 500);
}

/* 3. Mobile Bottom Navigation Active Tab Tracker & Smooth Navigation */
function initMobileBottomNav() {
  const bottomNavItems = document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item');
  if (!bottomNavItems.length) return;

  // Handle click on bottom nav items
  bottomNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        
        bottomNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const yOffset = -70; // Account for fixed header
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // Track scroll position to update active bottom nav item dynamically
  const sectionIds = ['hero', 'services', 'comparison', 'calculator', 'inquiry'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          bottomNavItems.forEach(item => {
            if (item.getAttribute('data-target') === id) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
  }
}
