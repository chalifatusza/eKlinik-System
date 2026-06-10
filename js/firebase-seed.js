// js/firebase-seed.js
// ============================================================
// SEED DATA — E-Klinik UNESA (Idempotent)
// ============================================================
import { db, collection, addDoc, getDocs, serverTimestamp } from './firebase-config.js';

const SEED_DOCTORS = [
  {
    name: "dr. Andi Pratama, Sp.U",
    specialty: "Dokter Umum",
    schedule: {
      "Senin": ["08:00","09:00","10:00","11:00"],
      "Selasa": ["08:00","09:00","10:00","11:00"],
      "Rabu": ["08:00","09:00","10:00"],
      "Kamis": ["08:00","09:00","10:00","11:00"],
      "Jumat": ["08:00","09:00","10:00"]
    },
    quota: 20, initials: "AP", phone: "081234567001",
    status: "active"
  },
  {
    name: "drg. Siti Rahayu",
    specialty: "Dokter Gigi",
    schedule: {
      "Senin": ["09:00","10:00","11:00"],
      "Rabu": ["09:00","10:00","11:00"],
      "Jumat": ["09:00","10:00","11:00"]
    },
    quota: 15, initials: "SR", phone: "081234567002",
    status: "active"
  },
  {
    name: "dr. Budi Santoso, Sp.KJ",
    specialty: "Psikologi & Konseling",
    schedule: {
      "Selasa": ["09:00","10:00","11:00"],
      "Kamis": ["09:00","10:00","11:00"]
    },
    quota: 10, initials: "BS", phone: "081234567003",
    status: "active"
  },
  {
    name: "dr. Dewi Lestari, Sp.M",
    specialty: "Dokter Mata",
    schedule: {
      "Senin": ["13:00","14:00","15:00"],
      "Rabu": ["13:00","14:00","15:00"],
      "Jumat": ["13:00","14:00","15:00"]
    },
    quota: 12, initials: "DL", phone: "081234567004",
    status: "active"
  },
  {
    name: "dr. Eko Wijaya, Sp.U",
    specialty: "Dokter Umum",
    schedule: {
      "Selasa": ["13:00","14:00","15:00","16:00"],
      "Kamis": ["13:00","14:00","15:00","16:00"]
    },
    quota: 18, initials: "EW", phone: "081234567005",
    status: "active"
  }
];

const SEED_USERS = [
  { nim: "admin", password: "admin123", name: "Administrator", role: "admin" },
  { nim: "dokter1", password: "dokter123", name: "dr. Andi Pratama", role: "dokter" },
  { nim: "2024001", password: "mhs123", name: "Ahmad Fauzi", role: "mahasiswa" },
  { nim: "2024002", password: "mhs123", name: "Putri Amelia", role: "mahasiswa" }
];

const SEED_PATIENTS = [
  {
    nim: "2024001", name: "Ahmad Fauzi", gender: "Laki-laki",
    dateOfBirth: "2003-05-12", phone: "08123456789",
    faculty: "Fakultas Teknik", program: "Teknik Informatika",
    address: "Surabaya", bloodType: "O",
    allergies: "Tidak ada", emergencyContact: "081234500001"
  },
  {
    nim: "2024002", name: "Putri Amelia", gender: "Perempuan",
    dateOfBirth: "2004-01-22", phone: "08198765432",
    faculty: "Fakultas Ekonomi", program: "Manajemen",
    address: "Surabaya", bloodType: "A",
    allergies: "Penisilin", emergencyContact: "081234500002"
  },
  {
    nim: "2024003", name: "Rizky Maulana", gender: "Laki-laki",
    dateOfBirth: "2003-11-08", phone: "08112233445",
    faculty: "Fakultas Ilmu Pendidikan", program: "Pendidikan Matematika",
    address: "Gresik", bloodType: "B",
    allergies: "Tidak ada", emergencyContact: "081234500003"
  },
  {
    nim: "2024004", name: "Dina Safitri", gender: "Perempuan",
    dateOfBirth: "2004-07-15", phone: "08155667788",
    faculty: "Fakultas Bahasa dan Seni", program: "Sastra Inggris",
    address: "Sidoarjo", bloodType: "AB",
    allergies: "Seafood", emergencyContact: "081234500004"
  },
  {
    nim: "2024005", name: "Bayu Aditya", gender: "Laki-laki",
    dateOfBirth: "2003-03-30", phone: "08199887766",
    faculty: "Fakultas MIPA", program: "Kimia",
    address: "Surabaya", bloodType: "O",
    allergies: "Tidak ada", emergencyContact: "081234500005"
  }
];

async function seedCollection(name, data) {
  const colRef = collection(db, name);
  for (const item of data) {
    await addDoc(colRef, { ...item, createdAt: serverTimestamp() });
  }
  console.log(`  ✓ ${name}: ${data.length} documents seeded`);
}

export async function seedIfEmpty() {
  try {
    const check = await getDocs(collection(db, 'doctors'));
    if (!check.empty) {
      console.log('✓ Database already seeded, skipping.');
      return false;
    }

    console.log('⏳ Seeding Firestore with initial data...');
    await seedCollection('doctors', SEED_DOCTORS);
    await seedCollection('users', SEED_USERS);
    await seedCollection('patients', SEED_PATIENTS);
    console.log('✅ Firestore seeded successfully.');
    return true;
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return false;
  }
}
