// js/sso.js
// ============================================================
// SSO UNESA MODULE — E-Klinik UNESA
// Simulates SSO UNESA (sso.unesa.ac.id) OAuth flow
// In production, replace with real OAuth2/OIDC integration
// ============================================================
import { getUserByEmail, createUserFromSSO } from './db.js';

const SSO_SESSION_KEY = 'eklinik_session';

/**
 * Validate UNESA email domain
 * Supports @unesa.ac.id (staff) and @mhs.unesa.ac.id (students)
 */
export function isValidUnesaEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.endsWith('@mhs.unesa.ac.id') || trimmed.endsWith('@unesa.ac.id');
}

/**
 * Extract NIM/NIP from UNESA email
 * e.g. "24051204001@mhs.unesa.ac.id" → "24051204001"
 */
export function extractIdFromEmail(email) {
  if (!email) return '';
  return email.trim().split('@')[0];
}

/**
 * Determine role from email domain
 */
export function getRoleFromEmail(email) {
  if (!email) return 'mahasiswa';
  const trimmed = email.trim().toLowerCase();
  if (trimmed.endsWith('@mhs.unesa.ac.id')) return 'mahasiswa';
  if (trimmed.endsWith('@unesa.ac.id')) return 'dokter'; // Staff defaults to dokter for klinik context
  return 'mahasiswa';
}

/**
 * Simulate SSO UNESA OAuth flow
 * Returns user data on success, null on failure
 */
export async function authenticateWithSSO(email) {
  if (!isValidUnesaEmail(email)) {
    throw new Error('Email harus menggunakan domain @unesa.ac.id atau @mhs.unesa.ac.id');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const nim = extractIdFromEmail(normalizedEmail);
  const role = getRoleFromEmail(normalizedEmail);

  // Simulate SSO server verification delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Check if user already exists in database
  let user = await getUserByEmail(normalizedEmail);

  if (!user) {
    // Auto-create user from SSO data (first-time SSO login)
    const ssoData = {
      nim: nim,
      email: normalizedEmail,
      name: generateNameFromEmail(normalizedEmail),
      role: role,
      loginMethod: 'sso',
      ssoProvider: 'UNESA SSO',
      ssoVerified: true,
      password: '__SSO_AUTH__' // SSO users don't use password login
    };

    const userId = await createUserFromSSO(ssoData);
    if (!userId) {
      throw new Error('Gagal membuat akun dari SSO. Silakan coba lagi.');
    }

    user = { id: userId, ...ssoData };
  }

  // Create session
  const sessionData = {
    id: user.id,
    nim: user.nim,
    name: user.name,
    email: user.email || normalizedEmail,
    role: user.role,
    avatar: user.avatar || null,
    loginMethod: 'sso',
    ssoVerified: true
  };

  sessionStorage.setItem(SSO_SESSION_KEY, JSON.stringify(sessionData));
  return sessionData;
}

/**
 * Generate a display name from email
 */
function generateNameFromEmail(email) {
  const local = email.split('@')[0];
  // If numeric (NIM), return "Mahasiswa [NIM]"
  if (/^\d+$/.test(local)) {
    return `Mahasiswa ${local}`;
  }
  // Otherwise capitalize and format
  return local
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Create and inject the SSO modal into the page
 */
export function createSSOModal() {
  // Remove existing modal if any
  const existing = document.getElementById('ssoModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'ssoModal';
  modal.className = 'sso-modal-overlay';
  modal.innerHTML = `
    <div class="sso-modal">
      <button class="sso-modal-close" id="ssoModalClose">&times;</button>
      
      <!-- Step 1: Email Input -->
      <div class="sso-step" id="ssoStep1">
        <div class="sso-modal-header">
          <img src="../assets/images/sso.png" alt="SSO UNESA" class="sso-modal-logo">
          <h3>SSO UNESA</h3>
          <p>Single Sign On — Universitas Negeri Surabaya</p>
        </div>
        <div class="sso-modal-body">
          <div class="sso-info-box">
            <i class="fas fa-info-circle"></i>
            <span>Masuk menggunakan email UNESA Anda untuk mengakses layanan E-Klinik</span>
          </div>
          <div class="sso-form-group">
            <label for="ssoEmailInput">
              <i class="fas fa-envelope"></i> Email UNESA
            </label>
            <input type="email" id="ssoEmailInput" class="sso-input" 
                   placeholder="contoh@mhs.unesa.ac.id" autocomplete="email">
            <div class="sso-email-hint">
              Gunakan email <strong>@mhs.unesa.ac.id</strong> (mahasiswa) atau <strong>@unesa.ac.id</strong> (staff)
            </div>
          </div>
          <div class="sso-error" id="ssoError"></div>
          <button class="sso-submit-btn" id="ssoSubmitBtn">
            <i class="fas fa-sign-in-alt"></i> Masuk dengan SSO
          </button>
        </div>
        <div class="sso-modal-footer">
          <div class="sso-footer-logos">
            <span>Didukung oleh</span>
            <strong>DTIK UNESA</strong>
          </div>
        </div>
      </div>

      <!-- Step 2: Verifying -->
      <div class="sso-step" id="ssoStep2" style="display:none;">
        <div class="sso-modal-header">
          <img src="../assets/images/sso.png" alt="SSO UNESA" class="sso-modal-logo">
          <h3>Memverifikasi...</h3>
        </div>
        <div class="sso-modal-body" style="text-align:center; padding: 40px 20px;">
          <div class="sso-loading-spinner"></div>
          <p class="sso-loading-text" id="ssoLoadingText">Menghubungi SSO Server UNESA...</p>
          <div class="sso-loading-steps">
            <div class="sso-load-step active" id="ssoLoadStep1">
              <i class="fas fa-server"></i> Koneksi ke SSO Server
            </div>
            <div class="sso-load-step" id="ssoLoadStep2">
              <i class="fas fa-shield-alt"></i> Verifikasi Identitas
            </div>
            <div class="sso-load-step" id="ssoLoadStep3">
              <i class="fas fa-check-circle"></i> Otorisasi Akses
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div class="sso-step" id="ssoStep3" style="display:none;">
        <div class="sso-modal-body" style="text-align:center; padding: 48px 20px;">
          <div class="sso-success-icon">
            <i class="fas fa-check"></i>
          </div>
          <h3 style="color:var(--success); margin-bottom: 8px;">Login Berhasil!</h3>
          <p id="ssoSuccessMsg" style="color:var(--text-muted);">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

/**
 * Open the SSO Modal and handle the flow
 */
export function openSSOModal(onSuccess, redirectPage) {
  const modal = createSSOModal();
  
  // Show modal with animation
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });

  const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  };

  // Close button
  document.getElementById('ssoModalClose').addEventListener('click', closeModal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  // Submit handler
  const submitBtn = document.getElementById('ssoSubmitBtn');
  const emailInput = document.getElementById('ssoEmailInput');
  const errorEl = document.getElementById('ssoError');

  const handleSubmit = async () => {
    const email = emailInput.value.trim();
    errorEl.style.display = 'none';

    // Validate email
    if (!email) {
      errorEl.textContent = 'Silakan masukkan email UNESA Anda.';
      errorEl.style.display = 'block';
      return;
    }

    if (!isValidUnesaEmail(email)) {
      errorEl.textContent = 'Email harus menggunakan domain @mhs.unesa.ac.id atau @unesa.ac.id';
      errorEl.style.display = 'block';
      return;
    }

    // Show verification step
    document.getElementById('ssoStep1').style.display = 'none';
    document.getElementById('ssoStep2').style.display = 'block';
    document.getElementById('ssoModalClose').style.display = 'none';

    // Animate loading steps
    await animateLoadingSteps();

    try {
      const user = await authenticateWithSSO(email);

      if (user) {
        // Show success
        document.getElementById('ssoStep2').style.display = 'none';
        document.getElementById('ssoStep3').style.display = 'block';
        document.getElementById('ssoSuccessMsg').textContent = 
          `Selamat datang, ${user.name}! Mengalihkan...`;

        // Redirect after brief success display
        setTimeout(() => {
          closeModal();
          if (onSuccess) {
            onSuccess(user);
          } else if (redirectPage) {
            window.location.href = redirectPage + '.html';
          } else {
            window.location.href = user.role === 'mahasiswa' 
              ? 'student-dashboard.html' 
              : 'dashboard.html';
          }
        }, 1500);
      }
    } catch (error) {
      // Show error, go back to step 1
      document.getElementById('ssoStep2').style.display = 'none';
      document.getElementById('ssoStep1').style.display = 'block';
      document.getElementById('ssoModalClose').style.display = 'block';
      errorEl.textContent = error.message || 'SSO gagal. Silakan coba lagi.';
      errorEl.style.display = 'block';
    }
  };

  submitBtn.addEventListener('click', handleSubmit);
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });

  // Focus email input
  setTimeout(() => emailInput.focus(), 300);
}

/**
 * Animate the loading steps for visual feedback
 */
async function animateLoadingSteps() {
  const steps = ['ssoLoadStep1', 'ssoLoadStep2', 'ssoLoadStep3'];
  const texts = [
    'Menghubungi SSO Server UNESA...',
    'Memverifikasi identitas Anda...',
    'Mengotorisasi akses E-Klinik...'
  ];

  for (let i = 0; i < steps.length; i++) {
    document.getElementById('ssoLoadingText').textContent = texts[i];
    document.getElementById(steps[i]).classList.add('active');
    if (i > 0) document.getElementById(steps[i - 1]).classList.add('done');
    await new Promise(r => setTimeout(r, 600));
  }
  document.getElementById(steps[steps.length - 1]).classList.add('done');
}
