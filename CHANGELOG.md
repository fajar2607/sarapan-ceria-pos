# 📝 Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] - 2026-10-01

### ✨ Ditambahkan (Added)
- Dashboard kasir untuk input transaksi harian per vendor
- Manajemen vendor (tambah, edit, hapus penitip makanan)
- Manajemen produk/menu dengan harga beli dan harga jual
- Laporan historis penjualan per hari dan per bulan
- Fitur ekspor laporan harian ke format PDF
- Status "Serah Terima" (handover) untuk setiap catatan vendor harian
- Kemampuan tambah item produk custom langsung dari dashboard
- Arsitektur **offline-first** dengan penyimpanan data lokal via `LocalForage` (IndexedDB)
- Integrasi **Capacitor** untuk packaging aplikasi menjadi APK Android
- Konfigurasi Splash Screen dengan animasi fade-out
- Generate icon & splash screen otomatis via `@capacitor/assets`

### 🛠️ Tech Stack Awal
- React 19 + Vite 8
- Zustand 5 (global state management)
- React Router DOM 7 (navigasi)
- LocalForage (persistensi data offline)
- jsPDF + jspdf-autotable (generate PDF)
- Lucide React (ikon)
- date-fns (manipulasi tanggal)
- Capacitor 8 (Android wrapper)

---

> 📌 **Catatan**: Versi ini merupakan rilis perdana (initial release) yang sudah mencakup seluruh fitur inti aplikasi kasir Sarapan Ceria.
