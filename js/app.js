// js/app.js — Landing Page Logic
import { seedIfEmpty } from './firebase-seed.js';
import { getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Seed database on first load
  await seedIfEmpty();

  // Update login button if user is logged in
  const user = getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');
  if (user && loginBtn) {
    loginBtn.innerHTML = `<i class="fas fa-th-large"></i> Dashboard`;
    loginBtn.href = user.role === 'mahasiswa' ? 'pages/appointment.html' : 'pages/dashboard.html';
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
});
