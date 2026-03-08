/* =========================================
   ROBOTICS CLUB — APP.JS v2.0
   Modernized Vanilla JavaScript SPA
   ========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import firebaseConfig from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let isAdmin = false;
let projects = [];
let teamMembers = [];
let equipment = [];

// ── Data ──────────────────────────────────
// Data will be fetched from Firestore

const scheduleData = [
  {
    month: 'March',
    items: [
      { week: 'Week 1', topic: 'Robotics Fundamentals', subtopic: 'Arduino Basics', activity: 'LED & Motor Control', lead: 'Hardware Lead' },
      { week: 'Week 2', topic: 'Sensors & IoT', subtopic: 'IR, Ultrasonic, LDR', activity: 'Sensor Interfacing Tasks', lead: 'Electronics Lead' },
      { week: 'Week 3', topic: 'Competition Orientation', subtopic: 'RoboWars + FIRST Intro', activity: 'Teams Finalized', lead: 'Club Lead' },
      { week: 'Week 4', topic: 'Advanced Mechanics', subtopic: 'Obstacle Avoidance Bot', activity: 'Working Bot Demo', lead: 'Mechanical Lead' },
    ],
  },
  {
    month: 'April',
    items: [
      { week: 'Week 1', topic: 'Python for Robotics', subtopic: 'Control Logic & Loops', activity: 'Mini-Automation Script', lead: 'Software Lead' },
      { week: 'Week 2', topic: 'Computer Vision', subtopic: 'OpenCV Basics', activity: 'Object Detection Demo', lead: 'AI/ML Lead' },
      { week: 'Week 3', topic: 'ROS Introduction', subtopic: 'Nodes, Topics, Services', activity: 'Simulated Robot Task', lead: 'Software Lead' },
      { week: 'Week 4', topic: 'Project Sprint', subtopic: 'Team Project Milestone', activity: 'Progress Presentation', lead: 'Club Lead' },
    ],
  },
];

const calEvents = [
  { title: 'Arduino Workshop', date: offsetDate(1), color: '#00f5d4' },
  { title: 'BattleBots Qualifiers', date: offsetDate(5), color: '#0099ff' },
  { title: 'Guest Lecture: AI & Robotics', date: offsetDate(9), color: '#9d4dff' },
  { title: 'Sensor Interfacing Lab', date: offsetDate(14), color: '#00f5d4' },
  { title: 'Robotics Competition', date: offsetDate(38), color: '#ff3a6e' },
  { title: 'Demo Day & Showcase', date: offsetDate(60), color: '#ffab40' },
];

const galleryItems = [
  { image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=600', caption: 'Rover Build' },
  { image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600', caption: 'Bipedal Bot' },
  { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600', caption: 'Circuit Lab' },
  { image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=600', caption: 'Arm Manipulator' },
  { image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&q=80&w=600', caption: 'Drone Swarm' },
  { image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600', caption: 'Prosthetic Arm' },
  { image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600', caption: 'Workshop Day' },
  { image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=600', caption: 'Team Hack' },
];

// ── Equipment/Lab Inventory ───────────────
// Equipment will be fetched from Firestore

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ── SVG Icons ─────────────────────────────
const icons = {
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowUpRight: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  bot: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
  cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 0 0-2 2v1a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V6a2 2 0 0 0-2-2h-3"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  camera: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
};

// ── Particle System ────────────────────────
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let mouseParticle = { x: null, y: null };

  window.addEventListener('mousemove', (e) => {
    mouseParticle.x = e.clientX;
    mouseParticle.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouseParticle.x = null;
    mouseParticle.y = null;
  });

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.speedY = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.6 ? '#00f5d4' : Math.random() > 0.5 ? '#0099ff' : '#9d4dff';
    }
    update() {
      // Mouse interaction (repulsion & follow)
      if (mouseParticle.x != null && mouseParticle.y != null) {
        let dx = mouseParticle.x - this.x;
        let dy = mouseParticle.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          // Repel slightly
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let force = (150 - distance) / 150;
          this.x -= forceDirectionX * force * 1.5;
          this.y -= forceDirectionY * force * 1.5;
        }
      }

      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create 90 particles
  for (let i = 0; i < 90; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 100) * 0.12;
          ctx.strokeStyle = '#00f5d4';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
      // Connection to mouse cursor
      if (mouseParticle.x != null && mouseParticle.y != null) {
        const dx = particles[i].x - mouseParticle.x;
        const dy = particles[i].y - mouseParticle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 150) * 0.25;
          ctx.strokeStyle = '#0099ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseParticle.x, mouseParticle.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }
  animate();
}

// ── Router ────────────────────────────────
const routes = ['home', 'projects', 'events', 'team', 'gallery', 'lab', 'contact'];
let currentPage = 'home';

function navigate(page) {
  if (!routes.includes(page)) page = 'home';
  currentPage = page;

  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(page + '-page');
  if (target) {
    target.classList.add('active');
    target.classList.add('animate-fade-in');
  }

  document.querySelectorAll('.nav-link, .mob-nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({}, '', '#' + page);
  initReveal();
}

// ── Navbar ────────────────────────────────
function initNavbar() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  });
  const toggle = document.getElementById('nav-toggle');
  if (toggle) toggle.addEventListener('click', toggleMobileMenu);
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const toggle = document.getElementById('nav-toggle');
  if (!menu || !toggle) return;
  const isOpen = menu.classList.toggle('open');
  toggle.innerHTML = isOpen ? icons.x : icons.menu;
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const toggle = document.getElementById('nav-toggle');
  if (menu) menu.classList.remove('open');
  if (toggle) toggle.innerHTML = icons.menu;
}

// ── Render: Navbar ────────────────────────
function renderNavbar() {
  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'Projects', page: 'projects' },
    { name: 'Events', page: 'events' },
    { name: 'Team', page: 'team' },
    { name: 'Gallery', page: 'gallery' },
    { name: 'Lab', page: 'lab' },
    { name: 'Contact', page: 'contact' },
  ];
  const desktopLinks = navLinks.map(l =>
    `<a href="#${l.page}" class="nav-link" data-page="${l.page}">${l.name}</a>`
  ).join('');
  const mobileLinks = navLinks.map(l =>
    `<a href="#${l.page}" class="mob-nav-link" data-page="${l.page}">${l.name}</a>`
  ).join('');
  return `
  <div class="scanline"></div>
  <nav id="navbar">
    <div class="container-custom nav-inner">
      <a href="#home" class="nav-logo" data-page="home">
        <div class="nav-logo-icon">⚙</div>
        <span>ROBOTICS CLUB</span>
      </a>
      <div class="nav-links">
        ${desktopLinks}
        <button id="nav-admin-btn" class="btn btn-outline btn-sm" style="display:none;" data-nav="admin">Dashboard</button>
        <button class="btn btn-primary btn-sm" data-nav="contact">Join Club</button>
      </div>
      <button class="nav-toggle" id="nav-toggle">${icons.menu}</button>
    </div>
    <div id="mobile-menu">
      ${mobileLinks}
      <button class="btn btn-primary btn-md" data-nav="contact">Join Club</button>
    </div>
  </nav>`;
}

// ── Render: Footer ────────────────────────
function renderFooter() {
  return `
  <footer id="site-footer">
    <div class="container-custom footer-grid">
      <div>
        <div class="footer-brand-title">⚙ ROBOTICS CLUB</div>
        <p class="footer-brand-desc">PW IOI Pune Campus — Building the Machines of Tomorrow. Inspiring engineers, one bot at a time.</p>
      </div>
      <div>
        <div class="footer-heading">Quick Links</div>
        <ul class="footer-links">
          <li><a href="#projects" data-page="projects">Projects</a></li>
          <li><a href="#events"   data-page="events">Events</a></li>
          <li><a href="#team"     data-page="team">Team</a></li>
          <li><a href="#gallery"  data-page="gallery">Gallery</a></li>
          <li><a href="#lab"      data-page="lab">Lab</a></li>
          <li><a href="#contact"  data-page="contact">Contact</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-heading">Connect</div>
        <div class="footer-socials">
          <a href="#" class="footer-social-link" title="GitHub">${icons.github}</a>
          <a href="#" class="footer-social-link" title="LinkedIn">${icons.linkedin}</a>
          <a href="#" class="footer-social-link" title="Instagram">${icons.instagram}</a>
          <a href="#" class="footer-social-link" title="Twitter">${icons.twitter}</a>
        </div>
        <a href="mailto:info@roboticsclub.edu" class="footer-email">
          ${icons.mail}&nbsp; info@roboticsclub.edu
        </a>
      </div>
    </div>
    <div class="container-custom footer-bottom">
      <span class="footer-bottom-text">&copy; ${new Date().getFullYear()} Robotics Club @ PW IOI Pune Campus. All rights reserved. <a href="#" id="open-admin-login" style="opacity:0.2;">Admin</a></span>
      <span class="footer-bottom-badge">
        <span class="footer-bottom-dot"></span>
        Systems Online
      </span>
    </div>
  </footer>`;
}

// ── Render: Home ──────────────────────────
function renderHome() {
  const highlights = [
    { icon: icons.bot, color: 'var(--primary)', title: 'Autonomous Robotics', desc: 'Design and build rovers, drones and walkers from scratch using cutting-edge mechanical design.' },
    { icon: icons.cpu, color: 'var(--secondary)', title: 'Embedded Systems', desc: 'Master microcontrollers, FPGAs, sensors and real-time processing on custom hardware.' },
    { icon: icons.zap, color: 'var(--accent-2)', title: 'AI & Machine Vision', desc: 'Implement deep learning models for object detection, SLAM and autonomous decision-making.' },
    { icon: icons.users, color: '#fff', title: 'Collaborative Labs', desc: 'Work in agile teams with mentorship from industry experts and faculty advisors.' },
    { icon: icons.trophy, color: 'var(--accent)', title: 'Competitions', desc: 'Represent the club at national and international robotics competitions and hackathons.' },
    { icon: icons.globe, color: 'var(--primary)', title: 'Open Source', desc: 'All our builds and firmware are open-sourced, contributing back to the robot community.' },
  ];

  const featureCards = highlights.map(h => `
    <div class="card card-hover feature-card reveal">
      <div class="feature-icon-wrap">
        <div class="feature-icon" style="color:${h.color}">${h.icon}</div>
      </div>
      <h3 class="feature-title">${h.title}</h3>
      <p class="feature-desc">${h.desc}</p>
      <div class="feature-more">Explore ${icons.arrowRight}</div>
    </div>`
  ).join('');

  return `
  <div id="home-page" class="page">
    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-bg-glow-1"></div>
      <div class="hero-bg-glow-2"></div>
      <div class="hero-bg-glow-3"></div>
      <div class="container-custom hero-grid">
        <div class="hero-content animate-slide-up">
          <div class="hero-badge">
            <span class="hero-badge-dot animate-pulse"></span>
            Recruiting for Spring 2026
          </div>
          <h1 class="hero-title">
            Building the<br>
            <span class="hero-title-gradient">Machines of Tomorrow</span>
          </h1>
          <p class="hero-desc">
            A collective of engineers, designers and innovators at PW IOI Pune Campus.
            We design autonomous systems that push the boundaries of what's possible.
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" data-nav="contact">
              Join the Team ${icons.chevronRight}
            </button>
            <button class="btn btn-outline btn-lg" data-nav="projects">
              View Projects
            </button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat-item">
              <div class="hero-stat-num" data-target="6">0</div>
              <div class="hero-stat-label">Projects</div>
            </div>
            <div class="hero-stat-item">
              <div class="hero-stat-num" data-target="6">0</div>
              <div class="hero-stat-label">Members</div>
            </div>
            <div class="hero-stat-item">
              <div class="hero-stat-num" data-target="3">0</div>
              <div class="hero-stat-label">Awards</div>
            </div>
          </div>
        </div>
        <div class="hero-visual animate-float">
          <div class="robot-wrapper">
            <div class="robot-outer-ring"></div>
            <div class="robot-mid-ring"></div>
            <div class="robot-inner-circle">
              <svg class="robot-svg mecha-svg" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <!-- Glowing Aura/Background -->
                <circle cx="60" cy="60" r="45" fill="rgba(0,245,212,0.03)" stroke="none"/>
                
                <!-- Main Head Structure -->
                <path d="M40 35 L80 35 L90 55 L90 75 L75 90 L45 90 L30 75 L30 55 Z" fill="rgba(10,22,40,0.8)" stroke="currentColor" stroke-width="2"/>
                <path d="M45 35 L75 35 L82 55 L82 72 L70 85 L50 85 L38 72 L38 55 Z" fill="rgba(0,245,212,0.05)" stroke="currentColor" stroke-width="1"/>
                
                <!-- Forehead/Crown Plate -->
                <path d="M50 35 L70 35 L65 45 L55 45 Z" fill="rgba(0,245,212,0.1)"/>
                <line x1="60" y1="25" x2="60" y2="35" stroke="currentColor" stroke-width="2"/>
                <circle cx="60" cy="23" r="2" fill="var(--primary)" class="mecha-blink"/>
                
                <!-- Visor / Eyes -->
                <rect x="42" y="52" width="36" height="12" rx="4" fill="rgba(2,4,8,0.9)" stroke="currentColor"/>
                <!-- Glowing Eyes -->
                <g class="mecha-eyes">
                  <path d="M46 55 L54 55 L52 61 L44 61 Z" fill="var(--primary)"/>
                  <path d="M74 55 L66 55 L68 61 L76 61 Z" fill="var(--primary)"/>
                </g>
                <!-- Scanner Line -->
                <line x1="44" y1="58" x2="76" y2="58" stroke="var(--accent)" stroke-width="1" class="mecha-scan"/>

                <!-- Cheek Plates -->
                <path d="M30 65 L40 65 L40 75 L35 80 Z" fill="rgba(0,153,255,0.1)"/>
                <path d="M90 65 L80 65 L80 75 L85 80 Z" fill="rgba(0,153,255,0.1)"/>

                <!-- Mouth/Vent Area -->
                <path d="M50 72 L70 72 L65 85 L55 85 Z" fill="rgba(0,0,0,0.5)" stroke="currentColor"/>
                <line x1="53" y1="76" x2="67" y2="76"/>
                <line x1="54" y1="80" x2="66" y2="80"/>

                <!-- Side Antennas / Ears -->
                <path d="M30 45 L22 40 L22 65 L30 60 Z" fill="rgba(0,245,212,0.05)" stroke="currentColor"/>
                <path d="M90 45 L98 40 L98 65 L90 60 Z" fill="rgba(0,245,212,0.05)" stroke="currentColor"/>
                <circle cx="20" cy="52" r="2" fill="var(--secondary)" class="mecha-pulse-slow"/>
                <circle cx="100" cy="52" r="2" fill="var(--secondary)" class="mecha-pulse-slow"/>

                <!-- Neck Joints -->
                <rect x="52" y="90" width="16" height="15" fill="rgba(0,0,0,0.6)" stroke="currentColor"/>
                <line x1="52" y1="95" x2="68" y2="95"/>
                <line x1="52" y1="100" x2="68" y2="100"/>
                
                <!-- Collar/Shoulder Base -->
                <path d="M35 105 L85 105 L95 120 L25 120 Z" fill="rgba(10,22,40,0.9)" stroke="currentColor" stroke-width="2"/>
                <path d="M45 105 L75 105 L80 120 L40 120 Z" fill="rgba(0,245,212,0.1)"/>
                <circle cx="60" cy="112" r="4" fill="var(--primary)" class="mecha-core"/>
              </svg>
            </div>
            <div class="robot-orbit-dot robot-orbit-dot-1"></div>
            <div class="robot-orbit-dot robot-orbit-dot-2"></div>
            <div class="robot-orbit-dot robot-orbit-dot-3"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="container-custom stats-grid">
        <div class="stat-card reveal">
          <span class="stat-icon">🤖</span>
          <div class="stat-num" data-count="6">0</div>
          <div class="stat-label">Active Projects</div>
        </div>
        <div class="stat-card reveal">
          <span class="stat-icon">🏆</span>
          <div class="stat-num" data-count="3">0</div>
          <div class="stat-label">Awards Won</div>
        </div>
        <div class="stat-card reveal">
          <span class="stat-icon">👥</span>
          <div class="stat-num" data-count="6">0</div>
          <div class="stat-label">Club Members</div>
        </div>
        <div class="stat-card reveal">
          <span class="stat-icon">⚡</span>
          <div class="stat-num" data-count="12">0</div>
          <div class="stat-label">Events This Year</div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="featured-section">
      <div class="container-custom">
        <div style="text-align:center;max-width:46rem;margin:0 auto 4rem">
          <div class="section-label">What We Do</div>
          <h2 class="featured-title">Innovation at Scale</h2>
          <p class="featured-desc">
            From competition-grade battlebots to research-focused autonomous systems,
            we tackle challenges spanning the entire engineering spectrum.
          </p>
        </div>
        <div class="featured-grid">${featureCards}</div>
      </div>
    </section>
  </div>`;
}

// ── Render: Projects ─────────────────────
function renderProjects() {
  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const filterBtns = categories.map((c, i) =>
    `<button class="filter-btn${i === 0 ? ' active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  const cards = projects.map(p => `
    <div class="card card-hover project-card reveal" data-category="${p.category}">
      <div class="project-img-wrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <div class="project-overlay"></div>
        <div class="project-badge">${p.category}</div>
      </div>
      <div class="project-body">
        <div class="project-header">
          <h3 class="project-title">${p.title}</h3>
          <span class="project-arrow">${icons.arrowUpRight}</span>
        </div>
        <p class="project-desc">${p.description}</p>
        <div class="project-meta">
          <span class="project-year">${p.year}</span>
          <span class="project-status ${p.status}">${p.status === 'active' ? '● Active' : '✓ Completed'}</span>
        </div>
      </div>
    </div>`
  ).join('');

  return `
  <div id="projects-page" class="page">
    <div class="container-custom">
      <div class="page-heading animate-fade-in">
        <div class="page-label">Our Work</div>
        <h1>Projects</h1>
        <p>Exploring the frontiers of robotics through hands-on engineering. A showcase of our builds and research.</p>
      </div>
      <div class="projects-filter" id="proj-filter">${filterBtns}</div>
      <div class="projects-grid" id="projects-grid">${cards}</div>
    </div>
  </div>`;
}

// ── Render: Events ────────────────────────
function renderEvents() {
  const monthSections = scheduleData.map(monthData => {
    const rows = monthData.items.map(item => `
      <tr>
        <td style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.72rem">${item.week}</td>
        <td style="font-weight:600;color:#fff">${item.topic}</td>
        <td>${item.subtopic}</td>
        <td>${item.activity}</td>
        <td style="color:var(--primary);font-family:var(--font-mono);font-size:0.78rem">${item.lead}</td>
      </tr>`).join('');
    return `
    <div style="margin-bottom:2.5rem">
      <div class="schedule-month-label">
        <span class="schedule-month-chip">${monthData.month}</span>
        <span style="font-size:1rem;font-weight:700;color:#fff;font-family:var(--font-display);letter-spacing:0.04em">Curriculum</span>
      </div>
      <div class="schedule-table-wrap">
        <table class="schedule-table">
          <thead><tr>
            <th>Week</th><th>Topic</th><th>Subtopic</th><th>Activity</th><th>Lead</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }).join('');

  return `
  <div id="events-page" class="page">
    <div class="container-custom">
      <div class="page-heading animate-fade-in">
        <div class="page-label">Schedule</div>
        <h1>Events</h1>
        <p>Workshops, competitions and learning sessions. Stay synced with what's happening at the lab.</p>
      </div>
      <div class="events-two-col animate-slide-up">
        <!-- Calendar column -->
        <div>
          <div class="card calendar-card" style="margin-bottom:1.5rem">
            <div class="mini-calendar" id="mini-cal"></div>
          </div>
          <div class="events-list" id="events-list"></div>
        </div>
        <!-- Terminal column -->
        <div>
          <div class="terminal-block reveal" style="margin-bottom:2rem">
            <span class="terminal-line-green">$ system.status --verbose</span><br>
            <span class="terminal-line-blue">> Club Status:   <span style="color:#fff">ACTIVE</span></span><br>
            <span class="terminal-line-blue">> Season:        <span style="color:#fff">Spring 2026</span></span><br>
            <span class="terminal-line-blue">> Members:       <span style="color:#fff">6 Engineers</span></span><br>
            <span class="terminal-line-blue">> Projects:      <span style="color:#fff">6 Running</span></span><br>
            <span class="terminal-line-green">> Upcoming:      <span style="color:#fff">Arduino Workshop</span></span><br>
            <span style="color:var(--text-dim)">_<span class="terminal-cursor"></span></span>
          </div>
          <div class="schedule-section">
            <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:#fff;margin-bottom:2rem;letter-spacing:0.04em">
              Course Schedule
            </h2>
            ${monthSections}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Render: Team ──────────────────────────
function renderTeam() {
  const socialLinks = (socials) => {
    let html = '';
    if (socials?.linkedin && socials.linkedin !== '#')
      html += `<a href="${socials.linkedin}" class="member-social-link" target="_blank" rel="noopener">${icons.linkedin}</a>`;
    else if (socials?.linkedin)
      html += `<a href="#" class="member-social-link">${icons.linkedin}</a>`;
    if (socials?.github)
      html += `<a href="${socials.github}" class="member-social-link" target="_blank" rel="noopener">${icons.github}</a>`;
    if (socials?.portfolio)
      html += `<a href="${socials.portfolio}" class="member-social-link" target="_blank" rel="noopener">${icons.globe}</a>`;
    return html;
  };

  const coreCards = teamMembers.map(m => `
    <div class="card card-hover member-card reveal">
      <div class="member-avatar-wrap default">
        <img src="${m.image}" alt="${m.name}" loading="lazy">
      </div>
      <h3 class="member-name default">${m.name}</h3>
      <div class="member-role default">${m.role}</div>
      <p class="member-bio">${m.bio}</p>
      <div class="member-socials">${socialLinks(m.socials)}</div>
    </div>`
  ).join('');

  return `
  <div id="team-page" class="page">
    <div class="container-custom">
      <div class="page-heading animate-fade-in">
        <div class="page-label">The Crew</div>
        <h1>Meet the Team</h1>
        <p>The minds behind the machines. A diverse team of engineers, dreamers and builders.</p>
      </div>
      <div class="team-grid animate-slide-up">${coreCards}</div>
    </div>
  </div>`;
}

// ── Render: Gallery ───────────────────────
function renderGallery() {
  const items = galleryItems.map(g => `
    <div class="gallery-item reveal">
      <img src="${g.image}" alt="${g.caption}" loading="lazy">
      <div class="gallery-overlay">
        <span class="gallery-caption">${icons.camera} ${g.caption}</span>
      </div>
    </div>`
  ).join('');

  return `
  <div id="gallery-page" class="page">
    <div class="container-custom">
      <div class="page-heading animate-fade-in">
        <div class="page-label">Visual Log</div>
        <h1>Gallery</h1>
        <p>Behind the scenes at the lab — builds, competitions and team moments.</p>
      </div>
      <div class="gallery-grid animate-slide-up">${items}</div>
    </div>
  </div>`;
}

// ── Render: Lab / Equipment ───────────────
function renderLab() {
  const categories = ['All', ...new Set(equipment.map(e => e.category))];
  const filterBtns = categories.map((c, i) =>
    `<button class="filter-btn${i === 0 ? ' active' : ''}" data-ecat="${c}">${c}</button>`
  ).join('');

  const cards = equipment.map(item => {
    const statusClass = item.status === 'available' ? 'eq-status-available' : 'eq-status-inuse';
    const statusLabel = item.status === 'available' ? '● Available' : '⚙ In Use';
    const specsList = item.specs.map(s => `<li class="eq-spec-item">${s}</li>`).join('');
    return `
    <div class="card card-hover eq-card reveal" data-ecat="${item.category}">
      <div class="eq-img-wrap">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <div class="eq-overlay"></div>
        <div class="eq-cat-badge">${item.category}</div>
        <div class="eq-qty-badge">×${item.qty}</div>
      </div>
      <div class="eq-body">
        <div class="eq-header">
          <h3 class="eq-name">${item.name}</h3>
          <span class="eq-status ${statusClass}">${statusLabel}</span>
        </div>
        <p class="eq-desc">${item.description}</p>
        <div class="eq-specs">
          <div class="eq-specs-label">Specifications</div>
          <ul class="eq-spec-list">${specsList}</ul>
        </div>
      </div>
    </div>`;
  }).join('');

  // Summary counts
  const total = equipment.length;
  const totalQty = equipment.reduce((s, e) => s + e.qty, 0);
  const availableCount = equipment.filter(e => e.status === 'available').length;
  const inUseCount = equipment.filter(e => e.status === 'in-use').length;

  return `
  <div id="lab-page" class="page">
    <div class="container-custom">
      <div class="page-heading animate-fade-in">
        <div class="page-label">Lab Arsenal</div>
        <h1>Equipment & Inventory</h1>
        <p>Everything the club has in its arsenal — sensors, controllers, actuators, tools and more. Browse by category.</p>
      </div>

      <!-- Summary strip -->
      <div class="eq-summary-strip animate-fade-in">
        <div class="eq-summary-item">
          <span class="eq-summary-num">${total}</span>
          <span class="eq-summary-label">Item Types</span>
        </div>
        <div class="eq-summary-item">
          <span class="eq-summary-num">${totalQty}</span>
          <span class="eq-summary-label">Total Units</span>
        </div>
        <div class="eq-summary-item">
          <span class="eq-summary-num" style="color:var(--primary)">${availableCount}</span>
          <span class="eq-summary-label">Available Types</span>
        </div>
        <div class="eq-summary-item">
          <span class="eq-summary-num" style="color:var(--accent)">${inUseCount}</span>
          <span class="eq-summary-label">In Use</span>
        </div>
      </div>

      <!-- Filter -->
      <div class="projects-filter" id="eq-filter">${filterBtns}</div>

      <!-- Grid -->
      <div class="eq-grid" id="eq-grid">${cards}</div>
    </div>
  </div>`;
}

// ── Render: Contact ───────────────────────
function renderContact() {
  return `
  <div id="contact-page" class="page">
    <div class="container-custom">
      <div class="page-heading animate-fade-in">
        <div class="page-label">Get In Touch</div>
        <h1>Contact Us</h1>
        <p>Interested in joining, sponsoring or collaborating? Reach out — we'd love to hear from you.</p>
      </div>
      <div class="contact-grid animate-slide-up">
        <!-- Info -->
        <div>
          <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem">
            <div class="card contact-info-card">
              <span class="contact-info-icon">${icons.mail}</span>
              <div>
                <div class="contact-info-title">Email</div>
                <div class="contact-info-value">contact@roboticsclub.edu</div>
              </div>
            </div>
            <div class="card contact-info-card">
              <span class="contact-info-icon">${icons.phone}</span>
              <div>
                <div class="contact-info-title">Phone</div>
                <div class="contact-info-value">+91 98765 43210</div>
              </div>
            </div>
            <div class="card contact-info-card">
              <span class="contact-info-icon">${icons.mapPin}</span>
              <div>
                <div class="contact-info-title">Lab Location — Pune Campus</div>
                <div class="contact-info-value">Survey No. 32, Amar Manor, 4th Floor, Unit No. 302, Hadapsar, Pune, Maharashtra 411013</div>
              </div>
            </div>
          </div>
          <!-- Terminal widget -->
          <div class="terminal-block">
            <span class="terminal-line-green">$ ./join-club --apply</span><br>
            <span class="terminal-line-blue">> Fill the form →</span><br>
            <span class="terminal-line-purple">> Await confirmation</span><br>
            <span class="terminal-line-green">> Welcome aboard! 🤖</span><br>
            <span style="color:var(--text-dim)">_<span class="terminal-cursor"></span></span>
          </div>
        </div>
        <!-- Form -->
        <div class="card contact-form-card">
          <form id="contact-form">
            <div class="form-row">
              <div>
                <label class="form-label">Name</label>
                <input type="text" class="form-input" id="f-name" placeholder="Ankit Bhalke" required>
              </div>
              <div>
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="f-email" placeholder="you@example.com" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Reason for Joining</label>
              <select class="form-input form-select" id="f-reason">
                <option value="">Select an option</option>
                <option>Join as a Member</option>
                <option>Sponsorship / Partnership</option>
                <option>Research Collaboration</option>
                <option>General Inquiry</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea class="form-textarea" id="f-message" rows="5" placeholder="Tell us about your skills and what excites you about robotics..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg form-submit">
              Send Message ${icons.arrowRight}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Calendar ──────────────────────────────
let calMonth, calYear;
function initCalendar() {
  const now = new Date();
  calMonth = now.getMonth();
  calYear = now.getFullYear();
  renderCalendar();
  renderEventsList();
}

function renderCalendar() {
  const cal = document.getElementById('mini-cal');
  if (!cal) return;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const eventDays = new Set(
    calEvents.filter(e => e.date.getMonth() === calMonth && e.date.getFullYear() === calYear)
      .map(e => e.date.getDate())
  );
  let cells = '';
  dayNames.forEach(d => { cells += `<div class="cal-day-name">${d}</div>`; });
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    const hasEvent = eventDays.has(d);
    let cls = 'cal-cell';
    if (isToday) cls += ' today';
    else if (hasEvent) cls += ' has-event';
    cells += `<div class="${cls}">${d}</div>`;
  }
  cal.innerHTML = `
    <div class="cal-header">
      <button class="cal-nav" id="cal-prev">&#8249;</button>
      <div class="cal-header-title">${monthNames[calMonth]} ${calYear}</div>
      <button class="cal-nav" id="cal-next">&#8250;</button>
    </div>
    <div class="cal-grid">${cells}</div>`;
  document.getElementById('cal-prev').addEventListener('click', () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });
}

function renderEventsList() {
  const list = document.getElementById('events-list');
  if (!list) return;
  const upcoming = calEvents.sort((a, b) => a.date - b.date);
  list.innerHTML = upcoming.map(e => {
    const timeStr = e.date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    return `
      <div class="event-item">
        <div class="event-dot" style="background:${e.color};box-shadow:0 0 6px ${e.color}"></div>
        <div>
          <div class="event-name">${e.title}</div>
          <div class="event-time">${timeStr}</div>
        </div>
      </div>`;
  }).join('');
}

// ── Generic Filter ────────────────────────
function initFilter(filterId, gridId, cardClass, dataAttr) {
  const filterEl = document.getElementById(filterId);
  const grid = document.getElementById(gridId);
  if (!filterEl || !grid) return;
  filterEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset[dataAttr];
    grid.querySelectorAll(cardClass).forEach(card => {
      const show = cat === 'All' || card.dataset[dataAttr] === cat;
      card.style.display = show ? '' : 'none';
    });
  });
}

// ── Project & Lab Filters (using logic above) 
function initProjectFilter() {
  initFilter('proj-filter', 'projects-grid', '.project-card', 'category');
}

function initLabFilter() {
  initFilter('eq-filter', 'eq-grid', '.eq-card', 'ecat');
}

// ── Scroll Reveal ─────────────────────────
function initReveal() {
  const items = document.querySelectorAll('.reveal:not(.visible)');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}

// ── Counter Animation ─────────────────────
// Keep references to active intervals to cleanly cancel them if navigating away
let counterIntervals = [];

function clearCounters() {
  counterIntervals.forEach(clearInterval);
  counterIntervals = [];
}

function animateCounters() {
  clearCounters(); // Reset before animating to avoid stacking
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + (target > 10 ? '' : '');
      if (current >= target) clearInterval(timer);
    }, 40);
    counterIntervals.push(timer);
  });
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 20));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + '+';
      if (current >= target) clearInterval(timer);
    }, 60);
    counterIntervals.push(timer);
  });
}

// ── Contact Form ──────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    try {
      await addDoc(collection(db, 'requests'), {
        name: document.getElementById('f-name').value,
        email: document.getElementById('f-email').value,
        reason: document.getElementById('f-reason').value,
        message: document.getElementById('f-message').value,
        timestamp: new Date()
      });
      showToast('✅ Request sent successfully! We\'ll be in touch soon.');
      form.reset();
    } catch (err) {
      console.error(err);
      showToast('❌ Error sending request. Please try again.');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('animate-fade-in'), 10);
  setTimeout(() => toast.remove(), 4000);
}

// ── Bootstrap ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML =
    renderNavbar() +
    '<main id="main">' +
    renderHome() +
    renderProjects() +
    renderEvents() +
    renderTeam() +
    renderGallery() +
    renderLab() +
    renderContact() +
    '</main>' +
    renderFooter();

  // Admin Modals Logic
  const loginModal = document.getElementById('admin-login-modal');
  const dashModal = document.getElementById('admin-dashboard-modal');
  const closeLogin = document.getElementById('close-login');
  const closeDash = document.getElementById('close-dashboard');
  const openLogin = document.getElementById('open-admin-login');
  const loginError = document.getElementById('admin-login-error');

  if (openLogin) openLogin.addEventListener('click', e => { e.preventDefault(); loginModal.style.display = 'flex'; });
  if (closeLogin) closeLogin.addEventListener('click', () => loginModal.style.display = 'none');
  if (closeDash) closeDash.addEventListener('click', () => dashModal.style.display = 'none');

  document.getElementById('admin-login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    loginError.style.display = 'none';
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      loginModal.style.display = 'none';
      showToast('✅ Logged in as Admin');
    } catch (err) {
      console.error("Firebase Login Error:", err);
      loginError.textContent = err.code === 'auth/invalid-api-key'
        ? 'Invalid API Key. Please check firebase-config.js'
        : 'Invalid credentials or connection error';
      loginError.style.display = 'block';
    }
  });

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    signOut(auth);
    dashModal.style.display = 'none';
    showToast('Logged out');
  });

  function refreshPageUI(pageId, contentHTML, initHook) {
    const oldPage = document.getElementById(pageId);
    if (!oldPage) return;
    oldPage.outerHTML = contentHTML;
    if (currentPage === pageId.replace('-page', '')) {
      const newPage = document.getElementById(pageId);
      if (newPage) newPage.classList.add('active', 'animate-fade-in');
      if (initHook) initHook();
      initReveal();
      init3DCardTilt();
    }
  }

  function reRenderCMSPages() {
    refreshPageUI('projects-page', renderProjects(), initProjectFilter);
    refreshPageUI('team-page', renderTeam(), null);
    refreshPageUI('lab-page', renderLab(), initLabFilter);
  }

  onAuthStateChanged(auth, user => {
    isAdmin = !!user;
    const navAdminBtn = document.getElementById('nav-admin-btn');
    if (navAdminBtn) navAdminBtn.style.display = isAdmin ? 'var(--display-inline-flex, inline-flex)' : 'none';

    if (isAdmin) {
      loadAdminRequests();
    }
    reRenderCMSPages();
  });

  let cmsLoaded = false;
  async function loadCMSData() {
    if (cmsLoaded) return;
    cmsLoaded = true;
    // Real-time listeners for dynamic content
    onSnapshot(collection(db, 'projects'), (snapshot) => {
      projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      refreshPageUI('projects-page', renderProjects(), initProjectFilter);
    });

    onSnapshot(collection(db, 'team'), (snapshot) => {
      teamMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      refreshPageUI('team-page', renderTeam(), null);
    });

    onSnapshot(collection(db, 'inventory'), (snapshot) => {
      equipment = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      refreshPageUI('lab-page', renderLab(), initLabFilter);
    });
  }
  loadCMSData();

  async function loadAdminRequests() {
    const list = document.getElementById('admin-requests-list');
    if (!list) return;
    try {
      const qs = await getDocs(collection(db, 'requests'));
      if (qs.empty) {
        list.innerHTML = '<p style="color:var(--text-muted)">No requests found.</p>';
        return;
      }
      list.innerHTML = '';
      qs.forEach(docSnap => {
        const d = docSnap.data();
        list.innerHTML += `
          <div class="card" style="padding:1rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
              <strong style="color:var(--primary)">${d.name} (${d.email})</strong>
              <small style="color:var(--text-muted)">${d.timestamp?.toDate().toLocaleDateString()}</small>
            </div>
            <div style="color:var(--secondary);margin-bottom:0.5rem;">Reason: ${d.reason}</div>
            <p style="font-size:0.9rem;">${d.message}</p>
          </div>
        `;
      });
    } catch (err) {
      console.error(err);
      list.innerHTML = '<p style="color:red">Failed to load requests. Verify your Firebase config.</p>';
    }
  }

  // Delegate all nav clicks (including generic navigation buttons)
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-page]');
    if (link) { e.preventDefault(); navigate(link.dataset.page); return; }

    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      e.preventDefault();
      if (navBtn.dataset.nav === 'admin') {
        dashModal.style.display = 'flex';
      } else {
        navigate(navBtn.dataset.nav);
      }
    }
  });

  initNavbar();
  initParticles();

  // Wrap navigate to init page-specific features
  const _nav = navigate;
  window.navigate = function (page) {
    if (currentPage === page && page !== 'home') return; // Prevent double trigger
    if (currentPage !== 'home') clearCounters();         // Clear background intervals

    _nav(page);

    if (page === 'events') setTimeout(() => { initCalendar(); }, 60);
    if (page === 'contact') setTimeout(() => { initContactForm(); }, 60);
    if (page === 'projects') setTimeout(() => { initProjectFilter(); initReveal(); }, 60);
    if (page === 'lab') setTimeout(() => { initLabFilter(); initReveal(); }, 60);
    if (page === 'home') setTimeout(() => { animateCounters(); }, 200);
    setTimeout(() => { initReveal(); init3DCardTilt(); }, 100);
  };

  // Hash routing
  const hash = location.hash.replace('#', '') || 'home';
  window.navigate(hash);
  initUIEffects();

  window.addEventListener('hashchange', () => {
    window.navigate(location.hash.replace('#', '') || 'home');
  });
});

// ── UI/UX Effects: Scroll Progress ──
function initUIEffects() {
  const progress = document.getElementById('scroll-progress');

  // Scroll tracking
  window.addEventListener('scroll', () => {
    if (progress) {
      const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = `${(scrollPx / winHeightPx) * 100}%`;
      progress.style.width = scrolled;
    }
  });
}

// ── UI/UX Effects: 3D Card Tilt ──
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-hover');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.5s ease-out';
    });
  });
}
