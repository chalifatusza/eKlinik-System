// js/queue.js — Real-time Queue Logic
import { requireAuth, logout, renderUserInfo } from './auth.js';
import { getAllDoctors, onQueueUpdate, updateQueueStatus } from './db.js';
import { renderSidebar } from './sidebar.js';

let allDoctors = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth(['admin', 'dokter'])) return;
  renderSidebar();
  renderUserInfo('#userInfoContainer');

  allDoctors = await getAllDoctors();
  setupRealtimeQueue();
});

function setupRealtimeQueue() {
  const board = document.getElementById('queueBoard');
  
  onQueueUpdate((queue) => {
    if (allDoctors.length === 0) {
      board.innerHTML = '<div class="fb-empty-state" style="grid-column:1/-1;"><p>Belum ada data dokter.</p></div>';
      return;
    }

    board.innerHTML = allDoctors.map(doc => {
      const docQueue = queue.filter(q => q.doctorId === doc.id);
      const current = docQueue.find(q => q.status === 'dipanggil');
      const waiting = docQueue.filter(q => q.status === 'menunggu');
      const done = docQueue.filter(q => q.status === 'selesai');

      return `
        <div class="queue-doctor-card">
          <div class="queue-doctor-header">
            <h4>${doc.name}</h4>
            <span>${doc.specialty}</span>
          </div>
          <div class="queue-current">
            <div style="font-size:var(--font-size-sm);color:var(--text-muted);margin-bottom:4px;">Nomor Antrian Saat Ini</div>
            <div class="queue-number-display">${current ? current.queueNumber : '-'}</div>
            <div style="font-size:var(--font-size-sm);">${current ? current.patientName : 'Belum ada'}</div>
          </div>
          <div class="queue-list">
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:var(--font-size-xs);color:var(--text-muted);border-bottom:1px solid var(--gray-200);">
              <span>Menunggu: ${waiting.length}</span>
              <span>Selesai: ${done.length}</span>
            </div>
            ${docQueue.length === 0 ? '<div class="fb-empty-state" style="padding:24px;"><p>Belum ada antrian</p></div>' :
              docQueue.map(q => `
                <div class="queue-item ${q.status === 'menunggu' ? 'waiting' : q.status === 'dipanggil' ? 'called' : 'done'}">
                  <span><strong>${q.queueNumber}</strong> — ${q.patientName || 'N/A'}</span>
                  <div class="queue-item-actions">
                    ${q.status === 'menunggu' ? `<button onclick="window._callQueue('${q.id}')" style="background:var(--info);color:#fff;" title="Panggil"><i class="fas fa-bell"></i></button>` : ''}
                    ${q.status === 'dipanggil' ? `<button onclick="window._completeQueue('${q.id}')" style="background:var(--success);color:#fff;" title="Selesai"><i class="fas fa-check"></i></button>` : ''}
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      `;
    }).join('');
  });
}

// Global handlers for inline onclick
window._callQueue = async (id) => {
  try { await updateQueueStatus(id, 'dipanggil'); } catch (e) { console.error(e); }
};
window._completeQueue = async (id) => {
  try { await updateQueueStatus(id, 'selesai'); } catch (e) { console.error(e); }
};
