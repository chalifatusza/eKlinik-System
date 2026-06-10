// js/auth.js
// ============================================================
// AUTHENTICATION MODULE — E-Klinik UNESA
// ============================================================
import { getUserByCredentials } from './db.js';

const SESSION_KEY = 'eklinik_session';

export async function login(nim, password) {
  try {
    const user = await getUserByCredentials(nim, password);
    if (!user) return null;
    const sessionData = {
      id: user.id, nim: user.nim, name: user.name,
      role: user.role, avatar: user.avatar || null,
      loginMethod: 'manual'
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export function loginWithSSO(sessionData) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    ...sessionData,
    loginMethod: 'sso'
  }));
  return sessionData;
}

export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) { console.error('Error reading session:', error); return null; }
}

export function isLoggedIn() { return getCurrentUser() !== null; }

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = getBasePath() + 'index.html';
}

export function getUserRole() {
  const user = getCurrentUser();
  return user ? user.role : null;
}

export function isAdmin() { return getUserRole() === 'admin'; }
export function isDoctor() { return getUserRole() === 'dokter'; }
export function isStudent() { return getUserRole() === 'mahasiswa'; }

export function hasAccess(allowedRoles) {
  const role = getUserRole();
  return role && allowedRoles.includes(role);
}

function getBasePath() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../' : './';
}

export function requireAuth(allowedRoles = ['admin', 'dokter', 'mahasiswa']) {
  const user = getCurrentUser();
  if (!user) { window.location.href = getBasePath() + 'pages/login.html'; return false; }
  if (!allowedRoles.includes(user.role)) {
    window.location.href = user.role === 'mahasiswa' 
      ? getBasePath() + 'pages/student-dashboard.html' 
      : getBasePath() + 'pages/dashboard.html';
    return false;
  }
  return true;
}

export function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    window.location.href = user.role === 'mahasiswa'
      ? 'student-dashboard.html'
      : 'dashboard.html';
    return true;
  }
  return false;
}

export function renderUserInfo(containerSelector) {
  const user = getCurrentUser();
  if (!user) return;
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = `
    <div class="user-info">
      <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
      <div class="user-details">
        <span class="user-name">${user.name || 'User'}</span>
        <span class="user-role">${user.role || ''}</span>
      </div>
    </div>
  `;
}
