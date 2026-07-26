# E-Klinik UNESA

> Sistem Informasi Manajemen Klinik berbasis web untuk civitas akademika Universitas Negeri Surabaya (UNESA)
> Dibangun sebagai proyek Ujian Akhir Semester (UAS) mata kuliah **Sistem Informasi Manajemen (SIM)**.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Platform](https://img.shields.io/badge/platform-Web-blue)
![Made with](https://img.shields.io/badge/made%20with-Firebase-FFCA28?logo=firebase&logoColor=black)


**E-Klinik UNESA** adalah Sistem Informasi Manajemen (SIM) untuk digitalisasi layanan klinik kampus, mencakup pendaftaran pasien, penjadwalan pemeriksaan, manajemen antrian, 
rekam medis, hingga konsultasi online. Sistem ini dirancang untuk tiga peran pengguna utama: **mahasiswa/pasien**, **dokter**, dan **admin**
dengan alur login yang mendukung **SSO UNESA** (`@unesa.ac.id` / `@mhs.unesa.ac.id`) maupun login manual. Proyek ini juga dilengkapi **AI Virtual Assistant** berbasis multi-agent 
yang membantu proses pendaftaran, triase gejala awal, notifikasi antrian, dan analitik statistik klinik secara otomatis.

## ⚠️ Disclaimer

> Mohon dibaca sebelum menilai atau menggunakan proyek ini.

- **Fokus tugas ini adalah menguji kemampuan agentic AI, bukan validitas sistem.** Proyek ini dibuat sebagai bagian dari tugas UAS untuk melihat sejauh mana mahasiswa mampu membangun sebuah Sistem Informasi Manajemen dengan memanfaatkan **agentic AI** — dalam kasus ini menggunakan **Antigravity**. Penilaian utama tugas ini bukan pada kesempurnaan sistem, melainkan pada proses pemanfaatan AI agentic dalam pengembangan software.

-  **Masih banyak bug dan ketidaksesuaian.** Berdasarkan hasil pengujian perangkat lunak (menggunakan **Jam.dev**, **TestLink**, dan metode pengujian lainnya), sistem ini masih memiliki cukup banyak bug, error, serta ketidaksesuaian antara ekspektasi dan hasil aktual. Beberapa fitur mungkin belum berjalan sepenuhnya sesuai skenario pengujian.

-  **Data & konten belum merepresentasikan kondisi nyata.** Data dokter, jadwal, maupun informasi lain yang ditampilkan dalam sistem ini **belum tentu sesuai dengan kondisi nyata di E-Klinik UNESA**. Termasuk foto-foto dokter yang ditampilkan **bukan foto asli**, melainkan diambil dari internet hanya sebagai placeholder/dummy untuk kebutuhan demo aplikasi.

   **Belum mendapat persetujuan resmi dari pihak terkait.** Proyek ini **belum melalui proses persetujuan, validasi, maupun kerja sama resmi dengan pihak E-Klinik UNESA** atau instansi terkait lainnya. Sistem ini murni dibuat untuk keperluan pembelajaran dan tugas akademik, **bukan** merupakan sistem resmi yang digunakan atau disahkan oleh UNESA.

**Kesimpulan:** Proyek ini adalah **prototipe/simulasi untuk keperluan akademik semata**, bukan produk final yang siap pakai atau merepresentasikan sistem resmi milik E-Klinik UNESA.


## ⭐ Fitur Utama

| No | Fitur | Keterangan |
|----|-------|------------|
| 1 | **Autentikasi & SSO UNESA** | Login manual maupun simulasi SSO dengan validasi domain email kampus |
| 2 | **Role-Based Access Control** | Akses berbeda untuk `admin`, `dokter`, dan `mahasiswa` |
| 3 | **Pendaftaran & Penjadwalan Periksa** | Booking jadwal pemeriksaan ke dokter/spesialis |
| 4 | **Manajemen Antrian Real-Time** | Status dan nomor antrian ter-update secara langsung (Firestore `onSnapshot`) |
| 5 | **Rekam Medis Digital** | Pencatatan dan riwayat medis pasien |
| 6 | **Konsultasi Online** | Fitur konsultasi kesehatan jarak jauh |
| 7 | **Manajemen Data Dokter & Pasien** | CRUD data dokter dan pasien untuk admin |
| 8 | **Dashboard Interaktif** | Dashboard khusus admin/dokter dan dashboard khusus mahasiswa |
| 9 | **AI Chat Agent (Multi-Agent System)** | Asisten virtual dengan 4 agent khusus: |
| | ↳ 🩺 Triage Agent | Menangkap keluhan/gejala kesehatan |
| | ↳ 📝 Registration Agent | Bantuan pendaftaran & info dokter |
| | ↳ 🔔 Notification Agent | Status antrian |
| | ↳ 📊 Analytics Agent | Statistik & laporan klinik |
| 10 | **Deploy Ready** | Sudah dikonfigurasi untuk Firebase Hosting |



##  🛠️ Teknologi yang Digunakan

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


## 📂 Struktur Folder
```
eKlinik-System-main/
├──  index.html # Halaman utama/landing page
├──  firebase.json # Konfigurasi Firebase Hosting
├──  .firebaserc # Konfigurasi project Firebase
│
├──  assets/
│ └──  images/ # Aset gambar aplikasi
│
├──  css/
│ ├──  style.css # Style utama aplikasi
│ └──  admin.css # Style khusus dashboard admin
│
├──  js/
│ ├──  app.js # Inisialisasi & logika umum aplikasi
│ ├──  auth.js # Modul autentikasi & session
│ ├──  sso.js # Modul simulasi SSO UNESA
│ ├──  firebase-config.js # Konfigurasi & koneksi Firebase
│ ├──  firebase-seed.js # Seeder data awal Firestore
│ ├──  db.js # Fungsi query/CRUD Firestore
│ ├──  ai-agent.js # Sistem AI multi-agent (chatbot)
│ ├──  queue.js # Logika manajemen antrian
│ ├──  dashboard.js # Logika dashboard
│ └──  sidebar.js # Komponen navigasi sidebar
│
└──  pages/
├──  login.html # Halaman login
├──  register.html # Halaman pendaftaran akun
├──  dashboard.html # Dashboard admin/dokter
├──  student-dashboard.html # Dashboard mahasiswa
├──  doctors.html # Manajemen data dokter
├──  patients.html # Manajemen data pasien
├──  appointment.html # Pendaftaran/jadwal periksa
├──  queue.html # Halaman antrian
├──  consultation.html # Konsultasi online
└──  medical-records.html # Rekam medis pasien
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

> 🌐 **Catatan:** Aplikasi sudah live di Firebase Hosting - [https://eklinik-unesa.web.app/](https://eklinik-unesa.web.app/). Langkah instalasi di atas hanya diperlukan jika ingin menjalankan/mengembangkan secara lokal.
---

## 🖱️ Cara Menggunakan Aplikasi

1. 👉 Buka aplikasi melalui [https://eklinik-unesa.web.app/](https://eklinik-unesa.web.app/) (atau `index.html` jika dijalankan secara lokal), lalu klik **Login** atau **Daftar Akun**.
2. 👉 Login menggunakan email kampus UNESA (SSO) atau akun manual (NIM & password).
3. 👉 Sistem otomatis mengarahkan ke dashboard sesuai peran:
   -  **Mahasiswa** → Dashboard Mahasiswa (daftar periksa, lihat antrian, konsultasi)
   -  **Dokter/Admin** → Dashboard utama (kelola pasien, dokter, rekam medis)
4. 👉 Gunakan menu **Daftar Periksa** untuk membuat jadwal pemeriksaan baru.
5. 👉 Pantau posisi antrian secara real-time melalui halaman **Antrian**.
6. 👉 Manfaatkan **AI Assistant** untuk bertanya seputar pendaftaran, gejala kesehatan, atau status antrian.


## 🖼️ Screenshot
<img width="1366" height="6907" alt="ss lengkap eklinik" src="https://github.com/user-attachments/assets/1df1b7b2-9543-469b-b951-291fdcb40d65" />

---

<div align="center">

**Dibuat sebagai proyek UAS Sistem Informasi Manajemen — UNESA 2025/2026**

</div>
