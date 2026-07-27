/* ======================================================
   SHARIQUE BAIG — Cybersecurity Portfolio
   Interactivity & Animations
   ====================================================== */

// ── Typing Animation ──
const typedText = document.getElementById('typed-text');
const phrases = [
  'Securing your digital assets through offensive security.',
  'I find vulnerabilities before attackers do.',
  'OWASP Top 10 · Pentesting · Security Consulting',
  '16+ vulnerabilities discovered across 3+ engagements.'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 80;

function typeEffect() {
  const currentPhrase = phrases[phraseIndex];

  if (isDeleting) {
    typedText.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    typingDelay = 40;
  } else {
    typedText.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    typingDelay = 80;
  }

  if (!isDeleting && charIndex === currentPhrase.length) {
    typingDelay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typingDelay = 500;
  }

  setTimeout(typeEffect, typingDelay);
}

// Start typing after a short delay
setTimeout(typeEffect, 1000);


// ── Navbar Scroll Effect ──
const navbar = document.getElementById('navbar');

function handleScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });


// ── Mobile Navigation Toggle ──
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});


// ── Active Navigation Link on Scroll ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

function setActiveLink() {
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navAnchors.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + id) {
          a.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', setActiveLink, { passive: true });


// ── Case Study Tabs ──
const caseTabs = document.querySelectorAll('.case-tab');
const casePanels = document.querySelectorAll('.case-panel');

caseTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    // Update active tab
    caseTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update active panel
    casePanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === target) {
        panel.classList.add('active');
      }
    });
  });
});


// ── Scroll Reveal Animation ──
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }
);

revealElements.forEach(el => revealObserver.observe(el));


// ── Copy Email to Clipboard ──
const copyBtn = document.getElementById('copyEmail');
const emailAddress = 'shariquebaig0@gmail.com';

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailAddress).then(() => {
      const originalIcon = copyBtn.innerHTML;
      // Show checkmark icon
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy email: ', err);
    });
  });
}
