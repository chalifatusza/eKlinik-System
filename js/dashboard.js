// js/dashboard.js — Dashboard Logic
import { requireAuth, getCurrentUser, logout, renderUserInfo } from './auth.js';
import { getDashboardStats, onQueueUpdate, getAllPatients } from './db.js';
import { renderSidebar } from './sidebar.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth(['admin', 'dokter'])) return;

  renderSidebar();
  renderUserInfo('#userInfoContainer');

  await loadDashboard();
  setupQueueListener();
});

async function loadDashboard() {
  try {
    const stats = await getDashboardStats();
    if (!stats) return;

    document.getElementById('statDoctors').textContent = stats.totalDoctors;
    document.getElementById('statPatients').textContent = stats.totalPatients;
    document.getElementById('statQueue').textContent = stats.todayQueue;
    document.getElementById('statCompleted').textContent = stats.completedQueue;

    // Recent patients
    const patientsEl = document.getElementById('recentPatients');
    const patients = stats.patients.slice(0, 5);
    if (patients.length === 0) {
      patientsEl.innerHTML = '<div class="fb-empty-state"><p>Belum ada data pasien.</p></div>';
    } else {
      patientsEl.innerHTML = patients.map(p => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-200);">
          <div class="user-avatar" style="width:36px;height:36px;font-size:14px;">${p.name ? p.name.charAt(0) : '?'}</div>
          <div>
            <div style="font-weight:var(--font-semibold);font-size:var(--font-size-sm);">${p.name}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${p.nim || ''} — ${p.faculty || ''}</div>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

function setupQueueListener() {
  const queueEl = document.getElementById('recentQueue');
  onQueueUpdate((queue) => {
    if (queue.length === 0) {
      queueEl.innerHTML = '<div class="fb-empty-state"><i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:8px;"></i><p>Belum ada antrian hari ini.</p></div>';
      return;
    }
    const statusMap = { menunggu: 'badge-warning', dipanggil: 'badge-info', selesai: 'badge-success', batal: 'badge-danger' };
    const statusLabel = { menunggu: 'Menunggu', dipanggil: 'Dipanggil', selesai: 'Selesai', batal: 'Batal' };
    queueEl.innerHTML = `<table class="data-table"><thead><tr><th>No</th><th>Pasien</th><th>Dokter</th><th>Status</th></tr></thead><tbody>
      ${queue.slice(0, 10).map(q => `<tr>
        <td><strong>${q.queueNumber || '-'}</strong></td>
        <td>${q.patientName || '-'}</td>
        <td>${q.doctorName || '-'}</td>
        <td><span class="badge ${statusMap[q.status] || 'badge-primary'}">${statusLabel[q.status] || q.status}</span></td>
      </tr>`).join('')}
    </tbody></table>`;
  });
}
