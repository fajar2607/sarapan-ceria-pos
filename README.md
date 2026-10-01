# 🍳 Sarapan Ceria POS

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?style=for-the-badge&logo=capacitor)
![License](https://img.shields.io/badge/license-Private-red?style=for-the-badge)

**Aplikasi Point of Sale (POS) modern berbasis web & Android untuk usaha sarapan pagi.**

[📋 Fitur](#-fitur) • [🚀 Instalasi](#-instalasi) • [💻 Penggunaan](#-penggunaan) • [📱 Build Android](#-build-android-apk) • [🏗️ Arsitektur](#️-arsitektur)

</div>

---

## 📖 Tentang Proyek

**Sarapan Ceria POS** adalah aplikasi kasir (Point of Sale) yang dibangun khusus untuk mengelola penjualan sarapan pagi. Aplikasi ini menggunakan arsitektur **offline-first**, artinya dapat berjalan sepenuhnya tanpa koneksi internet, dengan semua data tersimpan aman di perangkat lokal.

Dibangun menggunakan **React + Vite** sebagai web app, lalu dibungkus menjadi **aplikasi Android native** menggunakan **Capacitor** — sehingga bisa diinstal di HP kasir seperti aplikasi biasa.

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🧾 **Dashboard Kasir** | Catat transaksi harian secara real-time |
| 🏪 **Manajemen Vendor** | Kelola daftar penitip/vendor makanan |
| 🍱 **Manajemen Produk** | Kelola daftar menu beserta harga beli & jual |
| 📊 **Laporan Historis** | Lihat riwayat penjualan per hari/bulan |
| 📄 **Ekspor PDF** | Cetak laporan harian dalam format PDF |
| 📶 **Offline-First** | Berjalan tanpa internet, data tersimpan lokal |
| 📱 **Aplikasi Android** | Bisa diinstal sebagai APK di HP kasir |

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **State Management**: [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Routing**: [React Router DOM 7](https://reactrouter.com/)
- **Storage (Offline)**: [LocalForage](https://localforage.github.io/localForage/)
- **PDF Generator**: [jsPDF](https://artskydj.github.io/jsPDF/) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Utility**: [date-fns](https://date-fns.org/)
- **Mobile Wrapper**: [Capacitor 8](https://capacitorjs.com/)

---

## 📋 Persyaratan Sistem

- **Node.js** ≥ v18 ([Download](https://nodejs.org/))
- **npm** (sudah termasuk dalam Node.js)
- **Android Studio** *(opsional, hanya untuk build APK)* ([Download](https://developer.android.com/studio))

---

## 🚀 Instalasi

### 1. Clone / Download Proyek

```bash
git clone https://github.com/username/sarapan-ceria-pos.git
cd sarapan-ceria-pos
```

### 2. Install Dependencies

```bash
npm install
```

---

## 💻 Penggunaan

### Jalankan Mode Development (Komputer)

```bash
npm run dev
```

Buka browser dan akses: **`http://localhost:5173`**

> Tampilan akan otomatis reload setiap kali ada perubahan pada source code.

### Build untuk Web / Hosting

```bash
npm run build
```

Hasil build akan tersimpan di folder `dist/` — siap di-deploy ke **Vercel**, **Netlify**, **cPanel**, atau hosting manapun.

```bash
# Preview hasil build secara lokal
npm run preview
```

---

## 📱 Build Android (APK)

Aplikasi ini menggunakan **Capacitor** untuk menghasilkan file APK Android.

### Langkah-langkah:

#### 1. Build & Sync ke Project Android

Jalankan dua perintah ini setiap kali ada perubahan kode:

```bash
npm run build
npx cap sync
```

#### 2. Buka di Android Studio

```bash
npx cap open android
```

#### 3. Build APK di Android Studio

1. Tunggu proses **Sync Gradle** di pojok kanan bawah selesai
2. Klik menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Setelah selesai, klik **"locate"** pada notifikasi yang muncul
4. File `app-debug.apk` siap dipindahkan dan diinstal di HP kasir! 🎉

> 📚 Lihat juga: [Panduan Ganti Icon & Splash Screen](./Panduan_Icon_SplashScreen.md)

---

## 🏗️ Arsitektur

```
sarapan-ceria-pos/
├── android/                    # Project Android (Capacitor)
├── assets/                     # Aset master (icon.png, splash.png)
├── public/                     # File statis publik
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Komponen layout utama (sidebar, navbar)
│   │   └── Modal.jsx           # Komponen modal reusable
│   ├── pages/
│   │   ├── Dashboard.jsx       # Halaman kasir / input transaksi harian
│   │   ├── HistoricalData.jsx  # Halaman laporan & riwayat penjualan
│   │   ├── Products.jsx        # Halaman manajemen produk/menu
│   │   ├── Settings.jsx        # Halaman pengaturan aplikasi
│   │   └── Vendors.jsx         # Halaman manajemen vendor/penitip
│   ├── store/
│   │   └── useStore.js         # Global state (Zustand) + persistensi LocalForage
│   ├── utils/                  # Fungsi-fungsi helper
│   ├── App.jsx                 # Root komponen + konfigurasi routing
│   ├── index.css               # Style global
│   └── main.jsx                # Entry point aplikasi
├── capacitor.config.json       # Konfigurasi Capacitor
├── package.json
└── vite.config.js
```

### Alur Data

```
User Interaction → React Component → Zustand Store → LocalForage (IndexedDB)
                                         ↑
                                   App Restart: data di-load kembali
```

---

## 📜 Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production untuk web/APK |
| `npm run preview` | Preview hasil build secara lokal |
| `npm run lint` | Cek kualitas kode dengan ESLint |
| `npm run assets:generate` | Generate icon & splash screen untuk Android |

---

## 🤝 Kontribusi

Proyek ini bersifat privat. Untuk pertanyaan atau saran, silakan hubungi pengembang.

---

<div align="center">

Dibuat dengan ❤️ untuk **Sarapan Ceria**

</div>
