# Panduan Mengganti Icon dan Splash Screen Android (Capacitor)

Untuk mengganti ikon aplikasi dan layar pemuatan (splash screen) pada aplikasi Android yang dibangun dengan Capacitor, metode paling mudah dan disarankan adalah menggunakan alat otomatis `@capacitor/assets`. Alat ini akan mengenerate semua ukuran gambar yang dibutuhkan oleh platform Android secara otomatis.

Ikuti langkah-langkah di bawah ini:

## Langkah 1: Siapkan File Gambar Master

Anda perlu menyiapkan gambar dasar (master) dengan kriteria berikut, dan letakkan ke dalam folder bernama `assets` di direktori paling utama (root) proyek Anda (sejajar dengan folder `src` dan file `package.json`):

1. **`assets/icon.png`**
   - Format: PNG (tanpa transparansi lebih baik untuk Android)
   - Ukuran Minimal: **1024 x 1024 pixel**
   - Kegunaan: Sebagai ikon aplikasi utama.
2. **`assets/splash.png`**
   - Format: PNG (bebas menggunakan transparansi atau background solid)
   - Ukuran Minimal: **2732 x 2732 pixel**
   - Kegunaan: Sebagai latar loading screen/splash screen.
   - *Tips: Pastikan logo/gambar utama berada di area tengah (sekitar 1200x1200px di tengah) agar tidak terpotong pada layar yang lebih panjang.*

> **Penting**: Pastikan penamaan file sama persis (`icon.png` dan `splash.png`) dan diletakkan di dalam folder `assets`.

## Langkah 2: Instal Capacitor Assets Generator

Buka terminal/command prompt di dalam folder proyek Anda, lalu jalankan perintah berikut untuk menginstal generator aset sebagai *development dependency*:

```bash
npm install -D @capacitor/assets
```

## Langkah 3: Generate Aset Android

Setelah gambar master siap di folder `assets`, jalankan perintah berikut di terminal:

```bash
npx capacitor-assets generate --android
```

Perintah di atas akan secara otomatis mengubah ukuran (resize), memotong (crop), dan menyalin gambar tersebut ke dalam folder native Android Anda (`android/app/src/main/res/...`).

## Langkah 4: Konfigurasi Splash Screen (Opsional tapi disarankan)

Agar splash screen tampil dengan durasi yang optimal dan memudar dengan halus saat aplikasi React Anda siap, Anda memerlukan plugin `@capacitor/splash-screen`.

Instal plugin splash screen:
```bash
npm install @capacitor/splash-screen
npx cap sync android
```

### Konfigurasi Durasi di `capacitor.config.json`
Buka file `capacitor.config.json` di root proyek Anda, dan tambahkan pengaturan plugin splash screen seperti ini:

```json
{
  "appId": "com.contoh.app",
  "appName": "Sarapan Ceria POS",
  "webDir": "dist",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2500,
      "launchAutoHide": true,
      "launchFadeOutDuration": 500,
      "backgroundColor": "#ffffffff",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP"
    }
  }
}
```

*Catatan: Ganti `backgroundColor` dengan warna dominan background splash screen Anda.*

## Langkah 5: Re-build Aplikasi di Android Studio

Setelah aset selesai dibuat dan disinkronkan, Anda tinggal menjalankan build di Android Studio:

1. Buka folder `android` di Android Studio.
2. Lakukan **Build > Clean Project** lalu **Build > Rebuild Project**.
3. Jalankan aplikasi ke Emulator atau Perangkat Asli.

Selamat! Ikon dan Splash Screen aplikasi Anda sudah berhasil diubah.
