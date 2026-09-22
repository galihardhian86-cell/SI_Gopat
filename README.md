# SI GO PAT — Web Belajar Go Dasar

Web pembelajaran bergaya aplikasi latihan modern, terinspirasi pola gamifikasi seperti leaderboard, XP, hearts, progress, dan jalur materi. Desain menggunakan warna logo Si Go Pat (cyan/teal/kuning), bukan hijau Duolingo.

## Struktur
- `student/` — halaman belajar user + login.
- `admin/` — halaman login admin + dashboard untuk pengguna dan bank soal.
- `assets/logo.png` — logo Si Go Pat yang diberikan.
- `shared.css` — desain bersama.
- `app.js` — aplikasi user.
- `admin.js` — aplikasi admin.
- `config.js` — tempat URL Google Apps Script.
- `apps-script/Code.gs` — backend Google Sheets.
- `README.md` — panduan.

## Fitur user
- Sign in dengan nama + password.
- Daftar akun baru (nama + password) langsung dari halaman login.
- Dashboard jalur belajar.
- 4 sub bab:
  1. Variabel & Tipe Data
  2. Looping
  3. Percabangan
  4. Persiapan UTS
- Latihan pilihan ganda.
- XP, hearts, streak, progress.
- Leaderboard.
- Soal diambil dari backend sehingga bisa diubah tanpa mengubah halaman.

## Fitur admin
- Sign in admin.
- Daftar akun admin baru (username + password) langsung dari halaman login admin.
- Dashboard.
- Melihat daftar pengguna.
- Melihat XP/streak/progress.
- Tambah soal.
- Edit soal.
- Hapus soal.
- Memilih sub bab.
- Menentukan jawaban benar + pembahasan.

## Cara menghubungkan Google Sheets
1. Buat Google Sheet baru.
2. Buka `Extensions > Apps Script`.
3. Buka `apps-script/Code.gs` dari paket ini dan tempel seluruh isinya.
4. Klik Save.
5. Jalankan fungsi `setup()` satu kali dari Apps Script dan beri izin.
6. Kembali ke Google Sheet. Akan dibuat sheet `Users`, `Questions`, `Admins`.
7. Data demo soal otomatis dibuat.
8. Untuk membuat user awal, pengguna bisa langsung klik "Daftar di sini" pada halaman
   `student/index.html`, atau (opsional) jalankan `addUser("Budi","123456")` di Apps
   Script, atau isi sheet `Users` secara manual.
9. Deploy:
   `Deploy > New deployment > Web app`
   - Execute as: Me
   - Who has access: Anyone
10. Salin URL yang berakhiran `/exec`.
11. Buka `config.js` dan ganti:
   `const API_URL = "TEMPEL_URL_GOOGLE_APPS_SCRIPT_DI_SINI";`
   dengan URL Web App tersebut.
12. Pakai URL `student/index.html` untuk user dan `admin/index.html` untuk admin.

## Login demo tanpa backend
Jika belum menghubungkan Apps Script, halaman tetap bisa dibuka sebagai mode demo
(data disimpan di localStorage browser, bukan di Google Sheets).
Admin bawaan:
- username: `admin`
- password: `admin123`

User bawaan:
- nama: `Budi`
- password: `123456`

Pada mode demo, halaman "Daftar di sini" (user) dan "Daftar admin" (admin) tetap
berfungsi dan menyimpan akun baru ke localStorage. Untuk penggunaan nyata/produksi,
tetap sambungkan ke backend Google Sheets (`apps-script/Code.gs`) agar data tidak
hilang saat localStorage dibersihkan.

## Catatan keamanan
Versi awal ini sengaja sederhana agar mudah dideploy. Password masih disimpan sebagai teks biasa di Google Sheet. Untuk penggunaan publik/produksi, gunakan autentikasi yang lebih aman dan jangan menyimpan password plaintext.

## Mengganti semua soal
Admin cukup masuk ke:
`admin/index.html` → Bank Soal → Tambah/Edit/Hapus.

Tidak perlu mengubah kode frontend setiap kali soal berubah.
