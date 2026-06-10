// js/ai-agent.js
// ============================================================
// AI CHAT AGENT SYSTEM — E-Klinik UNESA
// All db calls are async/await compatible with Firestore
// ============================================================
import * as db from './db.js';
import { getCurrentUser } from './auth.js';

// ============================================================
// AGENT ORCHESTRATOR — Routes messages to appropriate agents
// ============================================================
class AgentOrchestrator {
  constructor() {
    this.agents = {
      registration: new RegistrationAgent(),
      triage: new TriageAgent(),
      notification: new NotificationAgent(),
      analytics: new AnalyticsAgent()
    };
    this.activeAgent = null;
    this.conversationHistory = [];
  }

  getActiveAgentName() {
    return this.activeAgent || 'assistant';
  }

  async dispatch(message, context) {
    try {
      this.conversationHistory.push({ role: 'user', content: message });
      const intent = this.classifyIntent(message);
      this.activeAgent = intent.agent;
      const agent = this.agents[intent.agent];
      if (!agent) {
        return { message: 'Maaf, saya tidak mengerti. Coba tanyakan tentang pendaftaran, kesehatan, atau antrian.', actions: [] };
      }
      const result = await agent.handle(message, context, intent);
      this.conversationHistory.push({ role: 'assistant', content: result.message });
      let actionResult = null;
      if (result.actions && result.actions.length > 0) {
        actionResult = await agent.executeActions(result.actions, context);
      }
      return { message: result.message, actions: result.actions, actionResult };
    } catch (err) {
      console.error('[Orchestrator] dispatch error:', err);
      return { message: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi.', actions: [] };
    }
  }

  classifyIntent(message) {
    const msg = message.toLowerCase();
    // Registration keywords
    if (/daftar|registrasi|periksa|booking|jadwal|appointment|antri/.test(msg)) {
      return { agent: 'registration', intent: 'register' };
    }
    // Triage keywords
    if (/sakit|gejala|keluhan|demam|pusing|mual|batuk|flu|alergi|nyeri|konsultasi|diagnos/.test(msg)) {
      return { agent: 'triage', intent: 'symptoms' };
    }
    // Analytics keywords
    if (/statistik|laporan|data|berapa|jumlah|total|report|grafik/.test(msg)) {
      return { agent: 'analytics', intent: 'stats' };
    }
    // Notification / queue keywords
    if (/antrian saya|nomor antrian|status antrian|giliran|panggil/.test(msg)) {
      return { agent: 'notification', intent: 'queueStatus' };
    }
    // Doctor keywords
    if (/dokter|spesialis|umum|gigi|mata|psikolog/.test(msg)) {
      return { agent: 'registration', intent: 'doctorInfo' };
    }
    // Default to triage for general health questions
    return { agent: 'triage', intent: 'general' };
  }
}

// ============================================================
// REGISTRATION AGENT — Handles appointments & doctor lookups
// ============================================================
class RegistrationAgent {
  constructor() {
    this.state = { step: null, selectedDoctor: null, specialty: null };
  }

  async handle(message, context, intent) {
    const msg = message.toLowerCase();
    if (intent.intent === 'doctorInfo' || /dokter/.test(msg)) {
      let specialty = null;
      if (/gigi/.test(msg)) specialty = 'gigi';
      else if (/mata/.test(msg)) specialty = 'mata';
      else if (/psikolog|konseling|jiwa/.test(msg)) specialty = 'psikolog';
      else if (/umum/.test(msg)) specialty = 'umum';

      return {
        message: specialty
          ? `Baik, saya carikan dokter ${specialty} yang tersedia...`
          : 'Saya carikan daftar dokter yang tersedia...',
        actions: [{ type: 'checkDoctor', payload: { specialty } }]
      };
    }
    if (intent.intent === 'register' || /daftar|periksa/.test(msg)) {
      this.state.step = 'selectDoctor';
      return {
        message: '📋 Untuk mendaftar periksa, saya perlu tahu:\n\n1. **Dokter mana** yang ingin Anda kunjungi?\n2. Atau sebutkan **keluhan** Anda dan saya bantu pilihkan dokter yang tepat.\n\nKetik nama dokter atau jenis layanan (umum/gigi/mata/konseling).',
        actions: [{ type: 'checkDoctor', payload: { specialty: null } }]
      };
    }
    return {
      message: 'Silakan sebutkan dokter atau layanan yang Anda butuhkan, dan saya bantu proses pendaftarannya.',
      actions: []
    };
  }

  async executeActions(actions, context) {
    const results = [];
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'checkDoctor': {
            const doctors = await db.getDoctorsBySpecialty(action.payload.specialty);
            const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
            const today = days[new Date().getDay()];
            const available = doctors.filter(d => {
              const sched = d.schedule || {};
              return sched[today] && sched[today].length > 0;
            });
            results.push({ type: 'doctorList', data: { all: doctors, available, today } });
            break;
          }
          case 'bookSlot': {
            const { patientId, doctorId, slot } = action.payload;
            const queueResult = await db.addToQueue({
              doctorId, patientId,
              patientName: context.patient?.name || '',
              patientNim: context.patient?.nim || '',
              doctorName: action.payload.doctorName || '',
              complaint: action.payload.complaint || '',
              specialty: action.payload.specialty || ''
            });
            results.push({ type: 'booking', data: queueResult });
            break;
          }
          case 'generateQueue': {
            const num = await db.generateQueueNumber(action.payload.doctorId);
            results.push({ type: 'queueNumber', data: { number: num } });
            break;
          }
          case 'estimateWait': {
            const wait = await db.getEstimatedWaitTime(action.payload.doctorId);
            results.push({ type: 'waitTime', data: { minutes: wait } });
            break;
          }
          default:
            results.push({ type: action.type, data: null });
        }
      } catch (err) {
        console.error('[RegistrationAgent] Action error:', err);
        results.push({ type: action.type, error: err.message });
      }
    }
    return results;
  }
}

// ============================================================
// TRIAGE AGENT — Symptom assessment & health guidance
// ============================================================
class TriageAgent {
  constructor() {
    this.triageState = { symptoms: [], severity: 'ringan', summary: '' };
    this.symptomDB = {
      demam: { severity: 'sedang', specialist: 'umum', advice: 'Istirahat cukup, minum air putih, dan kompres hangat.' },
      pusing: { severity: 'ringan', specialist: 'umum', advice: 'Istirahat, hindari layar gadget, pastikan cukup makan.' },
      batuk: { severity: 'ringan', specialist: 'umum', advice: 'Minum air hangat, hindari makanan berminyak.' },
      mual: { severity: 'ringan', specialist: 'umum', advice: 'Makan sedikit-sedikit, hindari makanan berat.' },
      'sakit gigi': { severity: 'sedang', specialist: 'gigi', advice: 'Hindari makanan manis, kumur air garam hangat.' },
      'sakit mata': { severity: 'sedang', specialist: 'mata', advice: 'Hindari layar, istirahatkan mata, gunakan obat tetes.' },
      nyeri: { severity: 'sedang', specialist: 'umum', advice: 'Jangan memaksakan aktivitas, segera periksa jika berlanjut.' },
      stress: { severity: 'ringan', specialist: 'psikolog', advice: 'Atur pola tidur, olahraga ringan, dan curhat ke orang terpercaya.' },
      cemas: { severity: 'sedang', specialist: 'psikolog', advice: 'Latihan pernapasan dalam, hindari kafein berlebihan.' },
      sesak: { severity: 'berat', specialist: 'umum', advice: '⚠️ Segera ke klinik atau UGD jika sesak napas berat!' },
      pingsan: { severity: 'berat', specialist: 'umum', advice: '⚠️ SEGERA ke UGD! Hubungi 119 untuk darurat.' },
      alergi: { severity: 'sedang', specialist: 'umum', advice: 'Hindari alergen, minum antihistamin jika tersedia.' }
    };
  }

  async handle(message, context, intent) {
    const msg = message.toLowerCase();
    const detected = [];
    let maxSeverity = 'ringan';
    const severityOrder = { ringan: 0, sedang: 1, berat: 2 };

    for (const [symptom, info] of Object.entries(this.symptomDB)) {
      if (msg.includes(symptom)) {
        detected.push({ symptom, ...info });
        if (severityOrder[info.severity] > severityOrder[maxSeverity]) {
          maxSeverity = info.severity;
        }
      }
    }

    this.triageState.symptoms = detected;
    this.triageState.severity = maxSeverity;

    if (detected.length === 0) {
      return {
        message: '🩺 Saya bisa membantu menilai keluhan Anda.\n\nSebutkan gejala yang Anda rasakan, contoh:\n- "Saya demam dan pusing"\n- "Sakit gigi sejak kemarin"\n- "Merasa cemas dan stress"\n\nSaya akan memberikan saran awal dan rekomendasi dokter yang tepat.',
        actions: []
      };
    }

    const severityEmoji = { ringan: '🟢', sedang: '🟡', berat: '🔴' };
    const severityLabel = { ringan: 'Ringan', sedang: 'Sedang', berat: 'Berat — Segera Periksa!' };
    let response = `${severityEmoji[maxSeverity]} **Tingkat: ${severityLabel[maxSeverity]}**\n\n`;
    response += '**Gejala terdeteksi:**\n';
    const specialists = new Set();
    for (const d of detected) {
      response += `• ${d.symptom} — ${d.advice}\n`;
      specialists.add(d.specialist);
    }
    response += `\n**Rekomendasi:** Konsultasi ke dokter **${[...specialists].join(' / ')}**`;

    if (maxSeverity === 'berat') {
      response += '\n\n⚠️ **Kondisi Anda memerlukan penanganan segera. Silakan langsung ke klinik atau hubungi 119.**';
    } else {
      response += '\n\nKetik **"daftar"** untuk langsung mendaftar periksa ke dokter yang direkomendasikan.';
    }

    this.triageState.summary = detected.map(d => d.symptom).join(', ');

    return {
      message: response,
      actions: maxSeverity !== 'berat' ? [{ type: 'checkDoctor', payload: { specialty: [...specialists][0] } }] : []
    };
  }

  async executeActions(actions, context) {
    const results = [];
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'checkDoctor': {
            const doctors = await db.getDoctorsBySpecialty(action.payload.specialty);
            results.push({ type: 'doctorList', data: doctors });
            break;
          }
          case 'saveConsultation': {
            try {
              const visitId = await db.createVisit({
                patientId: action.payload.patientId,
                consultationType: 'online',
                complaint: action.payload.summary,
                triageLevel: this.triageState.severity,
                visitDate: new Date().toISOString().split('T')[0],
                status: 'selesai'
              });
              results.push({ type: 'consultationSaved', data: { visitId } });
            } catch (err) {
              console.error('[TriageAgent] Failed to save consultation:', err);
              results.push({ type: 'consultationError', data: { error: err.message } });
            }
            break;
          }
          default:
            results.push({ type: action.type, data: null });
        }
      } catch (err) {
        console.error('[TriageAgent] Action error:', err);
        results.push({ type: action.type, error: err.message });
      }
    }
    return results;
  }
}

// ============================================================
// NOTIFICATION AGENT — Queue monitoring & alerts
// ============================================================
class NotificationAgent {
  constructor() {
    this.queueThreshold = 3;
    this.monitorInterval = null;
  }

  async handle(message, context) {
    const user = context.patient;
    if (!user) {
      return { message: 'Silakan login terlebih dahulu untuk melihat status antrian Anda.', actions: [] };
    }
    return {
      message: '🔍 Saya cek status antrian Anda...',
      actions: [{ type: 'checkQueueStatus', payload: { patientNim: user.nim } }]
    };
  }

  async executeActions(actions, context) {
    const results = [];
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'checkQueueStatus': {
            const queue = await db.getTodayQueue();
            const myQueue = queue.filter(q => q.patientNim === action.payload.patientNim);
            if (myQueue.length === 0) {
              results.push({ type: 'noQueue', data: { message: 'Anda belum terdaftar dalam antrian hari ini.' } });
            } else {
              const item = myQueue[myQueue.length - 1];
              const doctorQueue = queue.filter(q => q.doctorId === item.doctorId && q.status === 'menunggu');
              const position = doctorQueue.findIndex(q => q.id === item.id);
              results.push({
                type: 'queueStatus',
                data: {
                  queueNumber: item.queueNumber,
                  status: item.status,
                  doctorName: item.doctorName,
                  position: position + 1,
                  totalWaiting: doctorQueue.length
                }
              });
            }
            break;
          }
          case 'showNotification': {
            if (typeof showToast === 'function') {
              showToast(action.payload.message, action.payload.type);
            } else {
              console.warn('[NotificationAgent] showToast not ready:', action.payload.message);
            }
            results.push({ type: 'notified', data: true });
            break;
          }
          default:
            results.push({ type: action.type, data: null });
        }
      } catch (err) {
        console.error('[NotificationAgent] Action error:', err);
        results.push({ type: action.type, error: err.message });
      }
    }
    return results;
  }

  startQueueMonitor(patientQueueNum, doctorId) {
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    this.monitorInterval = setInterval(async () => {
      try {
        const queue = await db.getTodayQueue();
        const doctorQueue = queue.filter(q => q.doctorId === doctorId && q.status === 'menunggu');
        const position = doctorQueue.findIndex(q => q.queueNumber === patientQueueNum);

        if (position === -1) {
          clearInterval(this.monitorInterval);
          this.monitorInterval = null;
          return;
        }

        if (position <= this.queueThreshold && position > 0) {
          if (typeof showToast === 'function') {
            showToast(`🔔 Nomor antrian Anda ${patientQueueNum} akan segera dipanggil (${position} orang lagi)`, 'info');
          } else {
            console.warn('[NotificationAgent] showToast not ready');
          }
        }

        if (position === 0) {
          if (typeof showToast === 'function') {
            showToast(`🏥 Giliran Anda! Nomor ${patientQueueNum} — silakan masuk`, 'success');
          } else {
            console.warn('[NotificationAgent] showToast not ready');
          }
          clearInterval(this.monitorInterval);
          this.monitorInterval = null;
        }
      } catch (err) {
        console.error('[NotificationAgent] Queue monitor error:', err);
      }
    }, 30000);
    return this.monitorInterval;
  }

  stopMonitor() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

// ============================================================
// ANALYTICS AGENT — Dashboard stats & reports
// ============================================================
class AnalyticsAgent {
  async handle(message, context) {
    const msg = message.toLowerCase();
    if (/dokter/.test(msg)) {
      return { message: '📊 Mengambil data dokter...', actions: [{ type: 'getDoctorStats' }] };
    }
    if (/pasien/.test(msg)) {
      return { message: '📊 Mengambil data pasien...', actions: [{ type: 'getPatientStats' }] };
    }
    if (/antrian|queue/.test(msg)) {
      return { message: '📊 Mengambil data antrian hari ini...', actions: [{ type: 'getQueueStats' }] };
    }
    return { message: '📊 Mengambil statistik keseluruhan...', actions: [{ type: 'getOverallStats' }] };
  }

  async executeActions(actions, context) {
    const results = [];
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'getDoctorStats': {
            const doctors = await db.getAllDoctors();
            results.push({ type: 'doctorStats', data: { total: doctors.length, doctors } });
            break;
          }
          case 'getPatientStats': {
            const patients = await db.getAllPatients();
            results.push({ type: 'patientStats', data: { total: patients.length, patients } });
            break;
          }
          case 'getQueueStats': {
            const queue = await db.getTodayQueue();
            const w = queue.filter(q => q.status === 'menunggu').length;
            const c = queue.filter(q => q.status === 'selesai').length;
            results.push({ type: 'queueStats', data: { total: queue.length, waiting: w, completed: c } });
            break;
          }
          case 'getOverallStats': {
            const stats = await db.getDailyStats(new Date());
            results.push({ type: 'overallStats', data: stats });
            break;
          }
          default:
            results.push({ type: action.type, data: null });
        }
      } catch (err) {
        console.error('[AnalyticsAgent] Action error:', err);
        results.push({ type: action.type, error: err.message });
      }
    }
    return results;
  }
}

// ============================================================
// AI CHAT CONTROLLER — Manages the chat widget UI
// ============================================================
const agentOrchestrator = new AgentOrchestrator();

class AIChatController {
  constructor() {
    this.isOpen = false;
    this.isTyping = false;
  }

  init() {
    this.injectWidget();
    this.bindEvents();
  }

  injectWidget() {
    if (document.getElementById('ai-chat-widget')) return;
    const widget = document.createElement('div');
    widget.id = 'ai-chat-widget';
    widget.innerHTML = `
      <button class="ai-chat-fab" id="ai-chat-fab" title="Chat AI Assistant">
        <i class="fas fa-comment-medical"></i>
      </button>
      <div class="ai-chat-panel" id="ai-chat-panel">
        <div class="ai-chat-header">
          <div class="ai-chat-header-info">
            <div class="ai-chat-avatar"><i class="fas fa-robot"></i></div>
            <div><strong>MediBot</strong><br><small>Asisten Klinik UNESA</small></div>
          </div>
          <button class="ai-chat-close" id="ai-chat-close">&times;</button>
        </div>
        <div class="ai-chat-messages" id="ai-chat-messages">
          <div class="ai-msg ai">
            <div class="ai-msg-bubble">
              Halo! 👋 Saya <strong>MediBot</strong>, asisten digital E-Klinik UNESA.<br><br>
              Saya bisa membantu:<br>
              • 📋 <strong>Pendaftaran</strong> periksa<br>
              • 🩺 <strong>Konsultasi</strong> gejala awal<br>
              • 📊 <strong>Informasi</strong> dokter & jadwal<br>
              • 🔔 <strong>Status</strong> antrian<br><br>
              Silakan ketik pertanyaan Anda!
            </div>
          </div>
        </div>
        <div class="ai-chat-typing" id="ai-chat-typing" style="display:none;">
          <span></span><span></span><span></span>
        </div>
        <div class="ai-chat-input-area">
          <input type="text" id="ai-chat-input" placeholder="Ketik pesan..." autocomplete="off">
          <button id="ai-chat-send"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
  }

  bindEvents() {
    const fab = document.getElementById('ai-chat-fab');
    const close = document.getElementById('ai-chat-close');
    const input = document.getElementById('ai-chat-input');
    const send = document.getElementById('ai-chat-send');

    fab?.addEventListener('click', () => this.toggle());
    close?.addEventListener('click', () => this.toggle());
    send?.addEventListener('click', () => this.sendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('ai-chat-panel');
    const fab = document.getElementById('ai-chat-fab');
    if (panel) panel.classList.toggle('open', this.isOpen);
    if (fab) fab.classList.toggle('active', this.isOpen);
  }

  appendMessage(role, text, agentName) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `ai-msg ${role}`;
    const label = role === 'ai' && agentName ? `<small class="ai-agent-label">${agentName}</small>` : '';
    div.innerHTML = `${label}<div class="ai-msg-bubble">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  showTyping() {
    const el = document.getElementById('ai-chat-typing');
    if (el) el.style.display = 'flex';
    this.isTyping = true;
  }

  hideTyping() {
    const el = document.getElementById('ai-chat-typing');
    if (el) el.style.display = 'none';
    this.isTyping = false;
  }

  async buildPageContext() {
    const [availableDoctors, currentQueue, stats] = await Promise.all([
      db.getAllDoctors(),
      db.getTodayQueue(),
      db.getDailyStats(new Date())
    ]);
    return {
      currentPage: window.location.pathname,
      patient: getCurrentUser(),
      availableDoctors,
      currentQueue,
      stats
    };
  }

  async sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input?.value.trim();
    if (!message) return;

    input.value = '';
    this.appendMessage('user', message);
    this.showTyping();

    try {
      const context = await this.buildPageContext();
      const result = await agentOrchestrator.dispatch(message, context);
      this.hideTyping();
      this.appendMessage('ai', result.message, agentOrchestrator.getActiveAgentName());
      if (result.actionResult) {
        this.handleActionResults(result.actionResult);
      }
    } catch (err) {
      console.error('[AIChatController] sendMessage error:', err);
      this.hideTyping();
      this.appendMessage('ai', 'Maaf, terjadi gangguan koneksi. Silakan coba lagi.');
    }
  }

  handleActionResults(results) {
    if (!results || !Array.isArray(results)) return;
    for (const r of results) {
      if (r.error) {
        this.appendMessage('ai', `⚠️ Terjadi kesalahan: ${r.error}`);
        continue;
      }
      switch (r.type) {
        case 'doctorList': {
          const docs = r.data?.available || r.data || [];
          if (Array.isArray(docs) && docs.length > 0) {
            let msg = '👨‍⚕️ **Dokter tersedia:**\n\n';
            docs.forEach((d, i) => {
              msg += `${i+1}. **${d.name}** — ${d.specialty}\n`;
            });
            this.appendMessage('ai', msg);
          }
          break;
        }
        case 'booking': {
          if (r.data) {
            this.appendMessage('ai', `✅ Pendaftaran berhasil! Nomor antrian Anda: **${r.data.queueNumber}**`);
          }
          break;
        }
        case 'queueStatus': {
          const q = r.data;
          this.appendMessage('ai', 
            `📋 **Status Antrian Anda:**\n• Nomor: **${q.queueNumber}**\n• Dokter: ${q.doctorName}\n• Status: ${q.status}\n• Posisi: ${q.position} dari ${q.totalWaiting} menunggu`
          );
          break;
        }
        case 'noQueue':
          this.appendMessage('ai', `ℹ️ ${r.data?.message || 'Anda belum memiliki antrian hari ini.'}`);
          break;
        case 'overallStats': {
          const s = r.data;
          if (s) {
            this.appendMessage('ai',
              `📊 **Statistik Hari Ini:**\n• Dokter: ${s.totalDoctors}\n• Pasien: ${s.totalPatients}\n• Antrian: ${s.queueTotal} (menunggu: ${s.queueWaiting}, selesai: ${s.queueCompleted})`
            );
          }
          break;
        }
      }
    }
  }
}

// ============================================================
// AUTO-INIT — Initialize chat widget when DOM is ready
// ============================================================
const chatController = new AIChatController();

document.addEventListener('DOMContentLoaded', () => {
  chatController.init();
});

export { chatController, agentOrchestrator, AIChatController };
