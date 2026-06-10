// js/db.js
// ============================================================
// FIRESTORE CRUD LAYER — E-Klinik UNESA
// All methods are async with try/catch error handling
// ============================================================
import { 
  db, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp 
} from './firebase-config.js';

// ============================================================
// UTILITY HELPERS
// ============================================================
function todayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function formatDocSnap(snap) {
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

function formatQuerySnap(snapshot) {
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============================================================
// DOCTORS
// ============================================================
export async function getAllDoctors() {
  try {
    const snapshot = await getDocs(collection(db, 'doctors'));
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}

export async function getDoctorById(id) {
  try {
    const ref = doc(db, 'doctors', id);
    const snap = await getDoc(ref);
    return formatDocSnap(snap);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return null;
  }
}

export async function createDoctor(data) {
  try {
    const ref = await addDoc(collection(db, 'doctors'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  } catch (error) {
    console.error('Error creating doctor:', error);
    return null;
  }
}

export async function updateDoctor(id, data) {
  try {
    const ref = doc(db, 'doctors', id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Error updating doctor:', error);
    return false;
  }
}

export async function deleteDoctor(id) {
  try {
    const ref = doc(db, 'doctors', id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return false;
  }
}

// ============================================================
// PATIENTS
// ============================================================
export async function getAllPatients() {
  try {
    const snapshot = await getDocs(collection(db, 'patients'));
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

export async function getPatientById(id) {
  try {
    const ref = doc(db, 'patients', id);
    const snap = await getDoc(ref);
    return formatDocSnap(snap);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
}

export async function getPatientByNim(nim) {
  try {
    const q = query(collection(db, 'patients'), where('nim', '==', nim));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error fetching patient by NIM:', error);
    return null;
  }
}

export async function createPatient(data) {
  try {
    const ref = await addDoc(collection(db, 'patients'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  } catch (error) {
    console.error('Error creating patient:', error);
    return null;
  }
}

export async function updatePatient(id, data) {
  try {
    const ref = doc(db, 'patients', id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Error updating patient:', error);
    return false;
  }
}

export async function deletePatient(id) {
  try {
    const ref = doc(db, 'patients', id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
}

export async function searchPatients(keyword) {
  try {
    const all = await getAllPatients();
    const kw = keyword.toLowerCase();
    return all.filter(p => 
      (p.name && p.name.toLowerCase().includes(kw)) ||
      (p.nim && p.nim.toLowerCase().includes(kw))
    );
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
}

// ============================================================
// USERS (for authentication)
// ============================================================
export async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserByCredentials(nim, password) {
  try {
    const q = query(
      collection(db, 'users'),
      where('nim', '==', nim)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };
    if (userData.password !== password) return null;
    return userData;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

export async function createUser(data) {
  try {
    const ref = await addDoc(collection(db, 'users'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(id, data) {
  try {
    const ref = doc(db, 'users', id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

export async function getUserByEmail(email) {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function createUserFromSSO(ssoData) {
  try {
    const ref = await addDoc(collection(db, 'users'), {
      ...ssoData,
      loginMethod: 'sso',
      ssoVerified: true,
      createdAt: serverTimestamp()
    });
    return ref.id;
  } catch (error) {
    console.error('Error creating SSO user:', error);
    return null;
  }
}

// ============================================================
// VISITS / MEDICAL RECORDS
// ============================================================
export async function getAllVisits() {
  try {
    const q = query(collection(db, 'visits'), orderBy('visitDate', 'desc'));
    const snapshot = await getDocs(q);
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return [];
  }
}

export async function getVisitById(id) {
  try {
    const ref = doc(db, 'visits', id);
    const snap = await getDoc(ref);
    return formatDocSnap(snap);
  } catch (error) {
    console.error('Error fetching visit:', error);
    return null;
  }
}

export async function getVisitsByPatient(patientId) {
  try {
    const q = query(
      collection(db, 'visits'), 
      where('patientId', '==', patientId),
      orderBy('visitDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching patient visits:', error);
    return [];
  }
}

export async function getVisitsByDate(dateStr) {
  try {
    const q = query(
      collection(db, 'visits'), 
      where('visitDate', '==', dateStr)
    );
    const snapshot = await getDocs(q);
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching visits by date:', error);
    return [];
  }
}

export async function createVisit(data) {
  try {
    const ref = await addDoc(collection(db, 'visits'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  } catch (error) {
    console.error('Error creating visit:', error);
    return null;
  }
}

export async function updateVisit(id, data) {
  try {
    const ref = doc(db, 'visits', id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Error updating visit:', error);
    return false;
  }
}

// ============================================================
// QUEUE
// ============================================================
export async function getTodayQueue() {
  try {
    const today = todayDateString();
    const q = query(
      collection(db, 'queue'),
      where('date', '==', today)
    );
    const snapshot = await getDocs(q);
    return formatQuerySnap(snapshot).sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));
  } catch (error) {
    console.error('Error fetching today queue:', error);
    return [];
  }
}

export async function getQueueByDoctor(doctorId) {
  try {
    const today = todayDateString();
    const q = query(
      collection(db, 'queue'),
      where('date', '==', today),
      where('doctorId', '==', doctorId)
    );
    const snapshot = await getDocs(q);
    return formatQuerySnap(snapshot).sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));
  } catch (error) {
    console.error('Error fetching doctor queue:', error);
    return [];
  }
}

export async function addToQueue(data) {
  try {
    const today = todayDateString();
    // Get next queue number for this doctor today
    const existing = await getQueueByDoctor(data.doctorId);
    const nextNumber = existing.length + 1;

    const ref = await addDoc(collection(db, 'queue'), {
      ...data,
      date: today,
      queueNumber: nextNumber,
      status: 'menunggu', // menunggu, dipanggil, selesai, batal
      registrationTime: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return { id: ref.id, queueNumber: nextNumber };
  } catch (error) {
    console.error('Error adding to queue:', error);
    return null;
  }
}

export async function updateQueueStatus(id, status) {
  try {
    const ref = doc(db, 'queue', id);
    const updateData = { status, updatedAt: serverTimestamp() };
    if (status === 'dipanggil') {
      updateData.calledAt = serverTimestamp();
    } else if (status === 'selesai') {
      updateData.completedAt = serverTimestamp();
    }
    await updateDoc(ref, updateData);
    return true;
  } catch (error) {
    console.error('Error updating queue status:', error);
    return false;
  }
}

export async function deleteQueueItem(id) {
  try {
    const ref = doc(db, 'queue', id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Error deleting queue item:', error);
    return false;
  }
}

// ============================================================
// REAL-TIME LISTENERS
// ============================================================
export function onQueueUpdate(callback) {
  try {
    const today = todayDateString();
    const q = query(
      collection(db, 'queue'),
      where('date', '==', today)
    );
    return onSnapshot(q, (snapshot) => {
      const queue = formatQuerySnap(snapshot).sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));
      callback(queue);
    }, (error) => {
      console.error('Queue listener error:', error);
    });
  } catch (error) {
    console.error('Error setting up queue listener:', error);
    return null;
  }
}

export function onDoctorQueueUpdate(doctorId, callback) {
  try {
    const today = todayDateString();
    const q = query(
      collection(db, 'queue'),
      where('date', '==', today),
      where('doctorId', '==', doctorId)
    );
    return onSnapshot(q, (snapshot) => {
      const queue = formatQuerySnap(snapshot).sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));
      callback(queue);
    }, (error) => {
      console.error('Doctor queue listener error:', error);
    });
  } catch (error) {
    console.error('Error setting up doctor queue listener:', error);
    return null;
  }
}

// ============================================================
// DASHBOARD STATS
// ============================================================
export async function getDashboardStats() {
  try {
    const [doctors, patients, visits, todayQueue] = await Promise.all([
      getAllDoctors(),
      getAllPatients(),
      getAllVisits(),
      getTodayQueue()
    ]);

    const today = todayDateString();
    const todayVisits = visits.filter(v => v.visitDate === today);
    const waitingQueue = todayQueue.filter(q => q.status === 'menunggu');
    const completedQueue = todayQueue.filter(q => q.status === 'selesai');

    return {
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalVisits: visits.length,
      todayVisits: todayVisits.length,
      todayQueue: todayQueue.length,
      waitingQueue: waitingQueue.length,
      completedQueue: completedQueue.length,
      doctors,
      patients,
      visits,
      queue: todayQueue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

// ============================================================
// APPOINTMENTS
// ============================================================
export async function createAppointment(data) {
  try {
    const ref = await addDoc(collection(db, 'appointments'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return ref.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    return null;
  }
}

export async function getAppointmentsByPatient(patientId) {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export async function getAllAppointments() {
  try {
    const snapshot = await getDocs(collection(db, 'appointments'));
    return formatQuerySnap(snapshot);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    return [];
  }
}

export async function updateAppointment(id, data) {
  try {
    const ref = doc(db, 'appointments', id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Error updating appointment:', error);
    return false;
  }
}

// ============================================================
// AI AGENT SUPPORT METHODS
// ============================================================
export async function getDoctorsBySpecialty(specialty) {
  try {
    const all = await getAllDoctors();
    if (!specialty) return all;
    const kw = specialty.toLowerCase();
    return all.filter(d =>
      (d.specialty && d.specialty.toLowerCase().includes(kw)) ||
      (d.name && d.name.toLowerCase().includes(kw))
    );
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    return [];
  }
}

export async function generateQueueNumber(doctorId) {
  try {
    const existing = await getQueueByDoctor(doctorId);
    return existing.length + 1;
  } catch (error) {
    console.error('Error generating queue number:', error);
    return 1;
  }
}

export async function getEstimatedWaitTime(doctorId) {
  try {
    const queue = await getQueueByDoctor(doctorId);
    const waiting = queue.filter(q => q.status === 'menunggu');
    // Estimate ~10 minutes per patient
    return waiting.length * 10;
  } catch (error) {
    console.error('Error estimating wait time:', error);
    return 0;
  }
}

export async function getDailyStats(date) {
  try {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const [doctors, patients, todayQueue, visits] = await Promise.all([
      getAllDoctors(),
      getAllPatients(),
      getTodayQueue(),
      getVisitsByDate(dateStr)
    ]);

    const waiting = todayQueue.filter(q => q.status === 'menunggu');
    const completed = todayQueue.filter(q => q.status === 'selesai');
    const called = todayQueue.filter(q => q.status === 'dipanggil');

    return {
      date: dateStr,
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      todayVisits: visits.length,
      queueTotal: todayQueue.length,
      queueWaiting: waiting.length,
      queueCalled: called.length,
      queueCompleted: completed.length,
      doctors,
      patients,
      queue: todayQueue,
      visits
    };
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return null;
  }
}

// ============================================================
// CONSULTATIONS (Online Chat)
// ============================================================
export async function createConsultation(data) {
  try {
    const ref = await addDoc(collection(db, 'consultations'), {
      ...data, status: 'active', createdAt: serverTimestamp()
    });
    return ref.id;
  } catch (e) { console.error('Error creating consultation:', e); return null; }
}

export async function getConsultationsByUser(nim) {
  try {
    const q = query(collection(db, 'consultations'), where('patientNim', '==', nim), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error('Error fetching consultations:', e); return []; }
}

export async function getConsultationsByDoctor(doctorId) {
  try {
    const q = query(collection(db, 'consultations'), where('doctorId', '==', doctorId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error('Error fetching consultations:', e); return []; }
}

export async function sendChatMessage(consultationId, message) {
  try {
    const ref = await addDoc(collection(db, 'consultations', consultationId, 'messages'), {
      ...message, timestamp: serverTimestamp()
    });
    return ref.id;
  } catch (e) { console.error('Error sending message:', e); return null; }
}

export function onChatMessages(consultationId, callback) {
  const q = query(
    collection(db, 'consultations', consultationId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function getQueueByPatient(nim) {
  try {
    const today = todayDateString();
    const q = query(collection(db, 'queue'), where('date', '==', today), where('patientNim', '==', nim));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error('Error fetching patient queue:', e); return []; }
}

export function onPatientQueueUpdate(nim, callback) {
  try {
    const today = todayDateString();
    const q = query(
      collection(db, 'queue'),
      where('date', '==', today),
      where('patientNim', '==', nim)
    );
    return onSnapshot(q, (snapshot) => {
      const queue = formatQuerySnap(snapshot);
      callback(queue);
    }, (error) => {
      console.error('Patient queue listener error:', error);
    });
  } catch (error) {
    console.error('Error setting up patient queue listener:', error);
    return null;
  }
}
