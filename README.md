# 🏥 E-Klinik UNESA

> Sistem Informasi Manajemen Klinik berbasis web untuk civitas akademika Universitas Negeri Surabaya (UNESA)
> Dibangun sebagai proyek Ujian Akhir Semester (UAS) mata kuliah **Sistem Informasi Manajemen (SIM)**.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Platform](https://img.shields.io/badge/platform-Web-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)
![Made with](https://img.shields.io/badge/made%20with-Firebase-FFCA28?logo=firebase&logoColor=black)


**E-Klinik UNESA** adalah Sistem Informasi Manajemen (SIM) untuk digitalisasi layanan klinik kampus, mencakup pendaftaran pasien, penjadwalan pemeriksaan, manajemen antrian, 
rekam medis, hingga konsultasi online. Sistem ini dirancang untuk tiga peran pengguna utama: **mahasiswa/pasien**, **dokter**, dan **admin**
dengan alur login yang mendukung **SSO UNESA** (`@unesa.ac.id` / `@mhs.unesa.ac.id`) maupun login manual. Proyek ini juga dilengkapi **AI Virtual Assistant** berbasis multi-agent 
yang membantu proses pendaftaran, triase gejala awal, notifikasi antrian, dan analitik statistik klinik secara otomatis.


## ⭐ Fitur Utama

- ✅ **Autentikasi & SSO UNESA** — login manual maupun simulasi SSO dengan validasi domain email kampus
- ✅ **Role-Based Access Control** — akses berbeda untuk `admin`, `dokter`, dan `mahasiswa`
- ✅ **Pendaftaran & Penjadwalan Periksa** — booking jadwal pemeriksaan ke dokter/spesialis
- ✅ **Manajemen Antrian Real-Time** — status dan nomor antrian ter-update secara langsung (Firestore `onSnapshot`)
- ✅ **Rekam Medis Digital** — pencatatan dan riwayat medis pasien
- ✅ **Konsultasi Online** — fitur konsultasi kesehatan jarak jauh
- ✅ **Manajemen Data Dokter & Pasien** — CRUD data dokter dan pasien untuk admin
- ✅ **Dashboard Interaktif** — dashboard khusus admin/dokter dan dashboard khusus mahasiswa
- ✅ **AI Chat Agent (Multi-Agent System)** — asisten virtual dengan 4 agent khusus:
  - 🩺 **Triage Agent** — menangkap keluhan/gejala kesehatan
  - 📝 **Registration Agent** — bantuan pendaftaran & info dokter
  - 🔔 **Notification Agent** — status antrian
  - 📊 **Analytics Agent** — statistik & laporan klinik
- ⭐ **Deploy Ready** — sudah dikonfigurasi untuk Firebase Hosting


## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| **HTML5** | Struktur halaman web |
| **CSS3** | Styling & tampilan antarmuka |
| **JavaScript (ES Modules)** | Logika aplikasi sisi client |
| **Firebase Firestore** | Database NoSQL real-time |
| **Firebase Authentication** | Manajemen autentikasi pengguna |
| **Firebase Hosting** | Deployment aplikasi web |
| **AI Agent System** | Chatbot multi-agent untuk pendaftaran, triase, notifikasi, dan analitik |
| **SSO UNESA (Simulasi)** | Integrasi login dengan domain email kampus |

---

## 📂 Struktur Folder
```
eKlinik-System-main/
├── 📄 index.html # Halaman utama/landing page
├── ⚙️ firebase.json # Konfigurasi Firebase Hosting
├── ⚙️ .firebaserc # Konfigurasi project Firebase
│
├── 📁 assets/
│ └── 🖼️ images/ # Aset gambar aplikasi
│
├── 📁 css/
│ ├── 🎨 style.css # Style utama aplikasi
│ └── 🎨 admin.css # Style khusus dashboard admin
│
├── 📁 js/
│ ├── 🔧 app.js # Inisialisasi & logika umum aplikasi
│ ├── 🔐 auth.js # Modul autentikasi & session
│ ├── 🆔 sso.js # Modul simulasi SSO UNESA
│ ├── 🔥 firebase-config.js # Konfigurasi & koneksi Firebase
│ ├── 🌱 firebase-seed.js # Seeder data awal Firestore
│ ├── 🗄️ db.js # Fungsi query/CRUD Firestore
│ ├── 🤖 ai-agent.js # Sistem AI multi-agent (chatbot)
│ ├── 🎫 queue.js # Logika manajemen antrian
│ ├── 📊 dashboard.js # Logika dashboard
│ └── 🧭 sidebar.js # Komponen navigasi sidebar
│
└── 📁 pages/
├── 🔑 login.html # Halaman login
├── 📝 register.html # Halaman pendaftaran akun
├── 📋 dashboard.html # Dashboard admin/dokter
├── 🎓 student-dashboard.html # Dashboard mahasiswa
├── 🩺 doctors.html # Manajemen data dokter
├── 🧑‍🤝‍🧑 patients.html # Manajemen data pasien
├── 📅 appointment.html # Pendaftaran/jadwal periksa
├── 🎫 queue.html # Halaman antrian
├── 💊 consultation.html # Konsultasi online
└── 📁 medical-records.html # Rekam medis pasien
```

## ⚙️ Cara Instalasi & Menjalankan

Proyek ini adalah aplikasi **static web** (HTML/CSS/JS murni) yang terhubung ke **Firebase**, sehingga tidak memerlukan proses build/npm install.

### 1️⃣ Clone repository
```bash
git clone https://github.com/username/eKlinik-System.git
cd eKlinik-System
```

### 2️⃣ Konfigurasi Firebase
Pastikan project Firebase kamu sudah aktif (Firestore & Authentication diaktifkan), lalu sesuaikan kredensial pada: ```js/firebase-config.js ```

### 3️⃣ Jalankan secara lokal
Gunakan live server (disarankan) agar ES Modules (`import/export`) berjalan dengan baik:
```bash
# Menggunakan VS Code Live Server extension, atau
npx serve .
```
Lalu buka browser ke `http://localhost:3000` (atau port yang muncul di terminal).

### 4️⃣ (Opsional) Deploy ke Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

> 🖥️ **Catatan:** Buka file `index.html` langsung dari file explorer **tidak disarankan**, karena browser akan memblokir `import` ES Module pada skema `file://`.

---

## 🖱️ Cara Menggunakan Aplikasi

1. 👉 Buka halaman utama (`index.html`), lalu klik **Login** atau **Daftar Akun**.
2. 👉 Login menggunakan email kampus UNESA (SSO) atau akun manual (NIM & password).
3. 👉 Sistem otomatis mengarahkan ke dashboard sesuai peran:
   - 🎓 **Mahasiswa** → Dashboard Mahasiswa (daftar periksa, lihat antrian, konsultasi)
   - 🩺 **Dokter/Admin** → Dashboard utama (kelola pasien, dokter, rekam medis)
4. 👉 Gunakan menu **Daftar Periksa** untuk membuat jadwal pemeriksaan baru.
5. 👉 Pantau posisi antrian secara real-time melalui halaman **Antrian**.
6. 👉 Manfaatkan **AI Assistant** untuk bertanya seputar pendaftaran, gejala kesehatan, atau status antrian.

---

## 🖼️ Screenshot


| Halaman | Tampilan |
|---|---|
| Landing Page | `![Landing Page](assets/screenshots/landing.png)` |
| Dashboard | `![Dashboard](assets/screenshots/dashboard.png)` |
| Antrian | `![Antrian](assets/screenshots/queue.png)` |

---

## 👥 Anggota Kelompok

| No | Nama | NIM |
|---|---|---|
| 1 | *Nama Anggota 1* | *NIM* 
| 2 | *Nama Anggota 2* | *NIM* 
| 3 | *Nama Anggota 3* | *NIM* 

---

## 📚 Dosen Pengampu

☕ **[Nama Dosen Pengampu]**
Mata Kuliah: Sistem Informasi Manajemen (SIM)
Program Studi D4 Manajemen Informatika — Fakultas Vokasi, Universitas Negeri Surabaya (UNESA)

---

## ⚖️ Lisensi

Proyek ini dibuat untuk keperluan **akademik/tugas UAS** dan dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">

**Dibuat sebagai proyek UAS Sistem Informasi Manajemen — UNESA 2025/2026**

</div>
