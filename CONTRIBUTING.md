# 🤝 Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada **Sarapan Ceria POS**!

---

## 🚀 Memulai

### 1. Setup Lingkungan

Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) ≥ v18
- [Git](https://git-scm.com/)
- Editor kode (disarankan: [VS Code](https://code.visualstudio.com/))

### 2. Fork & Clone

```bash
# Fork terlebih dahulu via GitHub, lalu clone fork Anda
git clone https://github.com/USERNAME_ANDA/sarapan-ceria-pos.git
cd sarapan-ceria-pos
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Jalankan Development Server

```bash
npm run dev
```

---

## 📁 Struktur Proyek

```
src/
├── components/     → Komponen UI yang bisa dipakai ulang
├── pages/          → Halaman-halaman utama aplikasi
├── store/          → Global state menggunakan Zustand
└── utils/          → Fungsi helper / utility
```

---

## 🌿 Alur Kerja (Workflow)

### Membuat Branch Baru

Gunakan penamaan branch yang deskriptif:

```bash
# Untuk fitur baru
git checkout -b feat/nama-fitur

# Untuk perbaikan bug
git checkout -b fix/nama-bug

# Untuk dokumentasi
git checkout -b docs/nama-perubahan
```

### Commit dengan Pesan yang Jelas

Ikuti format **Conventional Commits**:

```
<type>: <deskripsi singkat>

[isi opsional]
```

**Tipe commit yang valid:**

| Tipe | Keterangan |
|---|---|
| `feat` | Menambahkan fitur baru |
| `fix` | Memperbaiki bug |
| `docs` | Perubahan dokumentasi saja |
| `style` | Perubahan format/style (bukan CSS) |
| `refactor` | Refactoring kode (tidak menambah fitur/fix bug) |
| `perf` | Peningkatan performa |
| `chore` | Update dependency, build script, dll |

**Contoh:**
```bash
git commit -m "feat: tambah fitur filter laporan per vendor"
git commit -m "fix: perbaiki kalkulasi total yang salah di dashboard"
git commit -m "docs: update panduan instalasi di README"
```

---

## ✅ Checklist Sebelum Pull Request

- [ ] Kode sudah diuji secara manual di browser
- [ ] Tidak ada error di console browser
- [ ] Sudah menjalankan `npm run lint` dan tidak ada error
- [ ] Fitur/fix sudah bekerja dalam mode offline
- [ ] Tidak ada file `node_modules` atau `dist` yang ikut di-commit

---

## 📝 Melaporkan Bug

Saat melaporkan bug, sertakan informasi berikut:

1. **Langkah reproduksi** — Apa yang Anda lakukan sebelum bug muncul?
2. **Perilaku yang diharapkan** — Seharusnya terjadi apa?
3. **Perilaku aktual** — Yang sebenarnya terjadi?
4. **Screenshot** *(jika memungkinkan)*
5. **Environment** — Sistem operasi, browser/versi Android, versi Node.js

---

## 💡 Mengusulkan Fitur

Buka **Issue** di GitHub dengan label `enhancement` dan jelaskan:

- Apa masalah yang ingin diselesaikan?
- Bagaimana solusi yang Anda bayangkan?
- Apakah ada alternatif solusi lain?

---

## ❓ Pertanyaan

Hubungi pengembang utama melalui fitur **Discussions** atau **Issues** di repository GitHub ini.
