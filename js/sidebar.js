// js/sidebar.js — Dynamic Sidebar RBAC
// ============================================================
// Renders sidebar menu based on user role
// ============================================================
import { getCurrentUser, logout } from './auth.js';

const MENU_CONFIG = {
  admin: {
    label: 'Menu Admin',
    items: [
      { href: 'dashboard.html', icon: 'fas fa-th-large', text: 'Dashboard' },
      { href: 'queue.html', icon: 'fas fa-list-ol', text: 'Antrian' },
      { href: 'doctors.html', icon: 'fas fa-user-md', text: 'Dokter' },
      { href: 'patients.html', icon: 'fas fa-users', text: 'Pasien' },
      { href: 'medical-records.html', icon: 'fas fa-file-medical', text: 'Rekam Medis' }
    ]
  },
  dokter: {
    label: 'Menu Dokter',
    items: [
      { href: 'dashboard.html', icon: 'fas fa-th-large', text: 'Dashboard' },
      { href: 'queue.html', icon: 'fas fa-list-ol', text: 'Antrian' },
      { href: 'patients.html', icon: 'fas fa-users', text: 'Pasien' },
      { href: 'medical-records.html', icon: 'fas fa-file-medical', text: 'Rekam Medis' }
    ]
  },
  mahasiswa: {
    label: 'Menu Mahasiswa',
    items: [
      { href: 'student-dashboard.html', icon: 'fas fa-th-large', text: 'Dashboard' },
      { href: 'appointment.html', icon: 'fas fa-calendar-plus', text: 'Daftar Antrian' },
      { href: 'consultation.html', icon: 'fas fa-comments', text: 'Konsultasi Online' }
    ]
  }
};

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const user = getCurrentUser();
  if (!user) return;

  const role = user.role || 'mahasiswa';
  const config = MENU_CONFIG[role] || MENU_CONFIG.mahasiswa;

  // Determine current page
  const currentPage = window.location.pathname.split('/').pop();

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <img src="../assets/images/logo e-klinik.png" alt="E-Klinik">
      <span>E-Klinik</span>
    </div>
    <div class="sidebar-section">${config.label}</div>
    <ul class="sidebar-nav">
      ${config.items.map(item => `
        <li><a href="${item.href}" class="${item.href === currentPage ? 'active' : ''}">
          <i class="${item.icon}"></i> ${item.text}
        </a></li>
      `).join('')}
    </ul>
    <div class="sidebar-section">Lainnya</div>
    <ul class="sidebar-nav">
      <li><a href="../index.html"><i class="fas fa-home"></i> Halaman Utama</a></li>
      <li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Keluar</a></li>
    </ul>
  `;

  // Re-attach logout handler
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // Sidebar toggle for mobile
  document.getElementById('menuToggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}
