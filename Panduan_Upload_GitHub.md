# 🚀 Panduan Upload Proyek ke GitHub

Panduan ini menjelaskan langkah-langkah lengkap untuk mengupload proyek **Sarapan Ceria POS** ke GitHub dari awal hingga selesai.

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda sudah memiliki:

- [ ] Akun [GitHub](https://github.com) (gratis)
- [ ] [Git](https://git-scm.com/downloads) terinstal di komputer
- [ ] Terminal / Command Prompt / PowerShell

### Cek apakah Git sudah terinstal

Buka terminal dan jalankan:

```bash
git --version
```

Jika muncul versi seperti `git version 2.x.x`, berarti Git sudah siap. Jika belum, [download Git di sini](https://git-scm.com/downloads).

---

## 👤 Langkah 1 — Konfigurasi Identitas Git (Sekali Saja)

Jika ini pertama kali menggunakan Git di komputer ini, atur nama dan email Anda:

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"
```

> ⚠️ Gunakan email yang sama dengan akun GitHub Anda.

Verifikasi konfigurasi:

```bash
git config --global --list
```

---

## 🌐 Langkah 2 — Buat Repository Baru di GitHub

1. Buka [github.com](https://github.com) dan **Login**
2. Klik tombol **"+"** di pojok kanan atas → pilih **"New repository"**
3. Isi form berikut:

   | Field | Isi |
   |---|---|
   | **Repository name** | `sarapan-ceria-pos` |
   | **Description** | Aplikasi POS offline-first untuk usaha sarapan pagi |
   | **Visibility** | `Private` *(jika tidak ingin publik)* atau `Public` |
   | **Initialize repository** | ❌ **Jangan dicentang** (kita sudah punya file lokal) |

4. Klik **"Create repository"**

5. Setelah repository dibuat, **salin URL** yang tampil:
   ```
   https://github.com/fajar2607/sarapan-ceria-pos.git
   ```

---

## 💻 Langkah 3 — Persiapkan Proyek Lokal

Buka terminal, lalu masuk ke folder proyek:

```bash
cd "d:\02. Proyek Lain\01. Antigrafity Google\11. Sarapan Ceria POS"
```

### Pastikan `.gitignore` sudah benar

File `.gitignore` di proyek ini sudah dikonfigurasi untuk mengabaikan:
- `node_modules/` — dependency npm (bisa diinstall ulang)
- `dist/` — hasil build (bisa di-generate ulang)
- File editor (`.vscode/`, `.idea/`, dll)

> ✅ Tidak perlu mengubah apapun, `.gitignore` sudah siap.

---

## 🔧 Langkah 4 — Inisialisasi Git & Upload

Jalankan perintah-perintah berikut **secara berurutan** di terminal:

### 4.1 — Inisialisasi repository Git lokal

```bash
git init
```

### 4.2 — Tambahkan semua file ke staging area

```bash
git add .
```

Untuk melihat file apa saja yang akan diupload:

```bash
git status
```

> ✅ Pastikan `node_modules` dan `dist` **tidak muncul** dalam daftar. Jika muncul, periksa kembali `.gitignore`.

### 4.3 — Buat commit pertama

```bash
git commit -m "feat: initial commit - Sarapan Ceria POS v0.1.0"
```

### 4.4 — Ganti nama branch utama menjadi `main`

```bash
git branch -M main
```

### 4.5 — Hubungkan ke repository GitHub

```bash
git remote add origin https://github.com/fajar2607/sarapan-ceria-pos.git
```

### 4.6 — Upload (push) ke GitHub

```bash
git push -u origin main
```

Anda akan diminta login GitHub (jika belum). Ikuti petunjuk di terminal.

---

## ✅ Langkah 5 — Verifikasi

Buka browser dan kunjungi:

```
https://github.com/fajar2607/sarapan-ceria-pos
```

Jika semua file sudah muncul di sana — **selamat, proyek berhasil diupload!** 🎉

---

## 🔄 Langkah 6 — Update Proyek (Untuk Perubahan Selanjutnya)

Setiap kali Anda melakukan perubahan pada kode dan ingin menyinkronkan ke GitHub:

```bash
# 1. Tambahkan semua perubahan
git add .

# 2. Buat commit dengan pesan yang deskriptif
git commit -m "feat: tambah fitur filter laporan"

# 3. Push ke GitHub
git push
```

### Shortcut — Satu Baris

```bash
git add . && git commit -m "pesan commit" && git push
```

---

## 🔑 Autentikasi: Token vs Password

Sejak **Agustus 2021**, GitHub tidak lagi menerima password akun biasa untuk operasi Git via terminal. Sebagai gantinya, gunakan salah satu metode berikut:

### Opsi A — Personal Access Token (PAT) *(Disarankan)*

1. Login ke GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Klik **"Generate new token (classic)"**
3. Beri nama token, centang scope **`repo`**, lalu klik **Generate token**
4. **Salin token** (hanya tampil sekali!)
5. Saat terminal meminta *password*, **tempel token** tersebut (bukan password akun)

### Opsi B — GitHub CLI

Install [GitHub CLI](https://cli.github.com/) lalu autentikasi sekali:

```bash
gh auth login
```

Ikuti petunjuk interaktif yang muncul.

---

## 🌿 Tips: Alur Kerja dengan Branch

Untuk pengembangan yang lebih terstruktur, gunakan branch:

```bash
# Buat dan pindah ke branch baru
git checkout -b feat/nama-fitur

# ... lakukan perubahan ...

# Push branch ke GitHub
git push -u origin feat/nama-fitur
```

Kemudian buat **Pull Request** di GitHub untuk menggabungkan branch ke `main`.

---

## ❓ Troubleshooting

### ❌ Error: `remote origin already exists`

```bash
git remote remove origin
git remote add origin https://github.com/fajar2607/sarapan-ceria-pos.git
```

### ❌ Error: `failed to push — Updates were rejected`

Terjadi jika ada perubahan di GitHub yang belum ada di lokal:

```bash
git pull origin main --rebase
git push
```

### ❌ `node_modules` ikut terupload

Hapus dari tracking Git:

```bash
git rm -r --cached node_modules
git commit -m "chore: remove node_modules from tracking"
git push
```

### ❌ Lupa URL repository

```bash
git remote -v
```

---

## 📁 File yang Akan Terupload

Berikut file-file penting yang akan masuk ke GitHub:

```
✅ README.md
✅ CHANGELOG.md
✅ CONTRIBUTING.md
✅ Panduan_Icon_SplashScreen.md
✅ Panduan_Upload_GitHub.md
✅ .gitignore
✅ package.json
✅ package-lock.json
✅ capacitor.config.json
✅ vite.config.js
✅ eslint.config.js
✅ index.html
✅ src/ (seluruh source code)
✅ public/
✅ assets/ (icon & splash master)
✅ android/ (project Android Capacitor)

❌ node_modules/  → diabaikan (.gitignore)
❌ dist/          → diabaikan (.gitignore)
```

---

<div align="center">

📌 Simpan panduan ini untuk referensi di masa mendatang!

</div>
