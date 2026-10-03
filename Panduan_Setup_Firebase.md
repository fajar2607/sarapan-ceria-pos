# Panduan Setup Backend Firebase (Multi-User Real-Time Sync)

Panduan ini menjelaskan cara mengaktifkan dan menghubungkan backend **Firebase Cloud Firestore** ke aplikasi **Sarapan Ceria POS** agar aplikasi dapat digunakan secara bersamaan oleh banyak pengguna/perangkat (*multi-user*) secara otomatis dan *real-time* tanpa perlu login (*OAuth*).

---

## Daftar Isi
1. [Fitur & Keunggulan Multi-User](#1-fitur--keunggulan-multi-user)
2. [Langkah 1: Membuat Proyek Firebase (Gratis)](#langkah-1-membuat-proyek-firebase-gratis)
3. [Langkah 2: Mengaktifkan Cloud Firestore](#langkah-2-mengaktifkan-cloud-firestore)
4. [Langkah 3: Konfigurasi Aturan Keamanan (Rules) Tanpa OAuth](#langkah-3-konfigurasi-aturan-keamanan-rules-tanpa-oauth)
5. [Langkah 4: Mendapatkan Kunci Konfigurasi Web App](#langkah-4-mendapatkan-kunci-konfigurasi-web-app)
6. [Langkah 5: Memasukkan Konfigurasi ke Aplikasi](#langkah-5-memasukkan-konfigurasi-ke-aplikasi)
7. [Langkah 6: Cara Menguji Sinkronisasi Antar Perangkat](#langkah-6-cara-menguji-sinkronisasi-antar-perangkat)
8. [Tanya Jawab & Pemecahan Masalah (FAQ)](#tanya-jawab--pemecahan-masalah-faq)

---

## 1. Fitur & Keunggulan Multi-User

- **Tanpa Perlu Login (Zero OAuth):** Kasir dan admin tidak perlu repot membuat akun Google atau mengingat email/password. Siapa saja yang membuka aplikasi langsung terhubung ke database toko.
- **Sinkronisasi Real-Time:** Begitu kasir A menginput titipan atau penjualan di HP/tablet, kasir B atau pemilik warung di laptop/HP lain akan langsung melihat perubahannya dalam hitungan detik tanpa perlu *refresh* halaman.
- **Tetap Bisa Dipakai Saat Offline:** Jika sinyal putus, aplikasi tetap berjalan lancar menggunakan penyimpanan lokal (*IndexedDB / localforage*). Saat internet tersambung kembali, data akan otomatis disinkronkan ke Cloud.
- **Gratis (Firebase Spark Plan):** Kuota gratis Firebase menyediakan hingga 50.000 bacaan & 20.000 tulisan per hari, sangat lebih dari cukup untuk operasional harian warung/kedai.

---

## Langkah 1: Membuat Proyek Firebase (Gratis)

1. Buka browser dan kunjungi [Firebase Console](https://console.firebase.google.com/).
2. Masuk menggunakan akun Google Anda.
3. Klik tombol **"Add project"** (atau **"Buat Proyek"**).
4. Masukkan nama proyek Anda, contoh: `sarapan-ceria-pos`, lalu klik **Continue**.
5. Pada pilihan *Google Analytics*, Anda bisa **menonaktifkannya** (pilih *Not recommended / Disable*) agar setup lebih ringkas dan cepat, lalu klik **Create project**.
6. Tunggu beberapa detik sampai proyek selesai dibuat, lalu klik **Continue**.

---

## Langkah 2: Mengaktifkan Cloud Firestore

1. Di menu navigasi sebelah kiri, buka menu **Build** > pilih **Firestore Database**.
2. Klik tombol **"Create database"**.
3. **Database ID:** Biarkan *default* `(default)`.
4. **Location:** Pilih lokasi server terdekat untuk respon tercepat di Indonesia:
   - Disarankan pilih: `asia-southeast2` (Jakarta) atau `asia-southeast1` (Singapura).
5. Klik **Next**.
6. **Security rules:** Pilih opsi **"Start in test mode"** (mode uji coba), lalu klik **Create / Enable**.

---

## Langkah 3: Konfigurasi Aturan Keamanan (Rules) Tanpa OAuth

Agar semua perangkat kasir dapat membaca dan menulis data secara otomatis tanpa autentikasi / login OAuth:

1. Di dalam halaman **Firestore Database**, buka tab **Rules** (Aturan).
2. Ganti seluruh teks aturan yang ada dengan kode berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mengizinkan baca & tulis untuk koleksi data Sarapan Ceria POS
    match /vendors/{vendorId} {
      allow read, write: if true;
    }
    
    match /products/{productId} {
      allow read, write: if true;
    }
    
    match /dailyRecords/{recordDate} {
      allow read, write: if true;
    }
  }
}
```

3. Klik tombol **"Publish"** (Publikasikan).
> [!NOTE]
> Dengan aturan ini, seluruh koleksi `vendors`, `products`, dan `dailyRecords` dapat disinkronkan secara otomatis antar perangkat pengguna tanpa hambatan autentikasi.

---

## Langkah 4: Mendapatkan Kunci Konfigurasi Web App

1. Klik ikon **Roda Gigi (Settings)** di sudut kiri atas di samping menu *Project Overview*, lalu pilih **Project settings**.
2. Di tab **General**, gulir ke bawah ke bagian **"Your apps"**.
3. Klik ikon Web (berlambang **`</>`**).
4. Masukkan nama panggilan aplikasi (App nickname), contoh: `Sarapan Ceria POS Web`.
5. Abaikan centang *Firebase Hosting*, lalu klik **Register app**.
6. Anda akan melihat blok kode konfigurasi seperti berikut:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxx",
  authDomain: "sarapan-ceria-pos.firebaseapp.com",
  projectId: "sarapan-ceria-pos",
  storageBucket: "sarapan-ceria-pos.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

7. **Salin** seluruh kode objek konfigurasi tersebut.

---

## Langkah 5: Memasukkan Konfigurasi ke Aplikasi

Anda memiliki 2 pilihan cara (Metode A sangat direkomendasikan karena paling cepat):

### Metode A: Langsung dari Menu Pengaturan Aplikasi (Paling Mudah)
*Bisa dilakukan langsung dari browser atau HP tanpa perlu edit kode / rebuild aplikasi:*

1. Buka aplikasi **Sarapan Ceria POS**.
2. Klik menu **Pengaturan** di sidebar navigasi.
3. Di kartu **"Pengaturan Backend Firebase"**, pastikan tab **"Tempel Objek JSON"** terpilih.
4. Tempelkan (*paste*) kode konfigurasi yang Anda salin dari Langkah 4 ke dalam kotak teks.
   *(Aplikasi secara cerdas dapat membaca format JSON maupun kode JS `const firebaseConfig = { ... }`).*
5. Klik tombol **"Simpan & Hubungkan Firebase"**.
6. Status di bagian atas akan langsung berubah menjadi hijau: **"● Real-Time Online - Sinkronisasi Multi-User Aktif"**, dan di bilah atas aplikasi akan muncul indikator **Cloud Sync**.
7. **PENTING (Migrasi Data Lama):**
   Jika di perangkat Anda sudah ada data vendor, produk, atau transaksi lokal sebelumnya, klik tombol **"Unggah Data Lokal ke Cloud"**. Semua data lokal akan otomatis disalin ke Firebase sehingga perangkat lain bisa langsung melihatnya.

---

### Metode B: Menggunakan File `.env` (Untuk Developer / Saat Build)
Jika Anda ingin menyertakan konfigurasi secara permanen sebelum membuat berkas APK atau *build production*:

1. Di folder proyek utama, buat file baru bernama `.env` (atau salin dari template `.env.example`).
2. Masukkan nilai konfigurasi Firebase Anda:

```env
VITE_FIREBASE_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=sarapan-ceria-pos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sarapan-ceria-pos
VITE_FIREBASE_STORAGE_BUCKET=sarapan-ceria-pos.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
   Atau untuk Android / APK:
   ```bash
   npm run build
   npx cap sync
   ```

---

## Langkah 6: Cara Menguji Sinkronisasi Antar Perangkat

Untuk membuktikan sinkronisasi multi-user berfungsi secara *real-time*:

1. **Uji Coba di 1 Komputer:**
   - Buka aplikasi di jendela browser biasa (Tab 1).
   - Buka aplikasi di jendela *Incognito / Private Window* atau browser lain (Tab 2).
   - Masukkan konfigurasi Firebase di Tab 2 (jika menggunakan Metode A).
   - Tambah produk baru atau ubah jumlah titipan/terjual di Tab 1.
   - Perhatikan Tab 2: angka dan data akan **otomatis terupdate secara langsung** tanpa reload!

2. **Uji Coba di Perangkat Berbeda (Laptop + HP Android):**
   - Buka aplikasi di HP Android dan di Laptop yang sama-sama terhubung ke internet.
   - Saat kasir di HP memasukkan data setoran titipan vendor, admin di Laptop akan langsung melihat data tersebut secara bersamaan.

---

## Tanya Jawab & Pemecahan Masalah (FAQ)

### 1. Muncul pesan "Missing or insufficient permissions"?
- **Penyebab:** Aturan keamanan (*Security Rules*) di Firebase Firestore belum diatur atau masa berlaku uji coba default 30 hari telah lewat.
- **Solusi:** Buka **Firebase Console > Firestore Database > Rules**, pastikan aturan seperti pada [Langkah 3](#langkah-3-konfigurasi-aturan-keamanan-rules-tanpa-oauth) sudah terpasang dan klik **Publish**.

### 2. Bagaimana jika internet tiba-tiba mati saat kasir sedang input data?
- Aplikasi Sarapan Ceria POS dilengkapi sistem *offline-first*.
- Data yang diinput saat offline akan tetap tersimpan aman di memori perangkat lokal.
- Ketika perangkat terhubung kembali ke internet, data otomatis tersinkronisasi ke Cloud.

### 3. Apakah data saya aman jika tidak memakai OAuth?
- Konfigurasi ini dirancang sesuai kebutuhan warung/toko Anda agar kasir dapat bekerja cepat tanpa repot login akun.
- Selama URL/kunci Firestore hanya dipakai oleh aplikasi Sarapan Ceria Anda, data hanya berputar di antara kasir dan pengelola toko.
- Anda dapat membuat cadangan berkala dengan mencetak PDF atau mengekspor laporan dari menu **Riwayat Data**.

### 4. Ingin memutuskan atau mengganti database Firebase?
- Masuk ke menu **Pengaturan**, lalu klik tombol **"Putuskan Koneksi Firebase"**. Aplikasi akan kembali beroperasi dalam mode penyimpanan lokal mandiri.
