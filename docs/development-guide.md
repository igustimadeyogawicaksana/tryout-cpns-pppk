# Menjalankan versi awal

Status: implementasi pertama bank soal, belum platform tryout siap rilis. Node.js 24 LTS direkomendasikan; minimal 22.13. npm dipakai sebagai package manager dan package-lock.json wajib dipertahankan.

## Pengembangan lokal

```sh
npm ci
npm run dev:setup
npm run dev
```

Buka http://localhost:5173. Setup lokal membuat .env dengan secret acak, menjalankan migrasi, dan membuat satu akun pengelola lokal jika database belum berisi akun. Detail login ada di `.local/akses-lokal.txt`; berkas tersebut, .env, dan data SQLite diabaikan Git. Setup ulang tidak mengganti akun yang sudah ada. Jangan memakai akun/secret lokal untuk produksi.

Database aktif: `data/app.sqlite`, termasuk file WAL/SHM yang dikelola SQLite. Jangan menghapus folder data atau menyalin file database aktif sembarangan. Aplikasi menggunakan WAL, foreign keys, synchronous FULL dan busy timeout 3 detik. Pengujian kapasitas server produksi belum dilakukan.

## Mencoba bank soal

1. Login, pilih Tambah soal, lalu isi kode unik. Draft boleh belum lengkap.
2. Isi pertanyaan, lima opsi A–E, topik, bobot/kunci, pembahasan, sumber dan hak penggunaan.
3. Simpan draft, ajukan review, konfirmasikan pemeriksaan, setujui, lalu terbitkan.
4. Versi terbit tidak dapat diedit lewat aplikasi; gunakan Buat revisi baru. Versi lama tetap tersimpan.
5. Untuk impor: unduh contoh JSON melalui halaman Impor, unggah, periksa preview, lalu konfirmasi. Semua masuk draft. Batch yang sama dapat dikirim ulang tanpa membuat duplikasi.

Contoh sintetis hanya untuk memeriksa alur. Tidak ada soal contoh yang otomatis dimasukkan ke database kerja. Pencarian menampilkan maksimal 100 versi terbaru; pagination lanjutan belum tersedia.

## Batas implementasi ini

- Login email/password khusus pengelola melalui Better Auth sudah aktif; signup email publik sengaja dinonaktifkan. Hak admin berdasarkan tabel admin_users, bukan email kiriman browser. Akun Google baru tidak otomatis menjadi admin.
- Login Google hanya ditampilkan bila GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET diisi. Callback sesuai origin aplikasi `/api/auth/callback/google`. Kredensial Google belum diatur dan OAuth belum diuji langsung.
- Registrasi peserta, reset password lewat email dan free trial belum dibangun. Jangan membuka pendaftaran publik sebelum alur verifikasi/pemulihan akun siap.
- Bank soal pilot menerima lima opsi dan skor integer 0–100. Validasi penuh blueprint per tahun/formasi, daftar topik/formasi terdaftar dan batas bobot resmi belum ada. Status terbit saat ini hanya bank soal internal, belum penerbitan paket ujian.
- Teks dirender sebagai teks ter-escape, tanpa HTML/Markdown aktif. Gambar, rumus dan rich text belum didukung; impor dengan assets ditolak secara eksplisit.
- Versi soal menyimpan payload JSON terstruktur dalam SQLite dengan kolom kategori/status untuk filter. Opsi belum dinormalisasi ke tabel option_id; lakukan evolusi schema tersebut sebelum pengacakan/pengerjaan ujian. Riwayat versi dan ID soal tetap dipertahankan.
- Pembuatan paket, ujian, ranking, pembayaran dan unggahan backup R2 belum diimplementasikan. Tidak ada klaim aplikasi siap menerima pembayaran atau peserta ujian.

## Validasi

```sh
npm run check
npm test
npm run build
npm run test:http
npm audit
```

Unit/integration service tests memakai SQLite memory dengan migrasi asli. HTTP smoke menjalankan build pada 127.0.0.1:5198 dengan database sementara dan kredensial acak; memeriksa login, akses pengelola, persistensi draft, penolakan signup publik dan POST lintas origin. Tidak mengubah database lokal. Port tersebut harus kosong. Pengujian ini bukan benchmark, pengujian OAuth Google, atau verifikasi container Dokploy.

Override cookie untuk SvelteKit dan esbuild untuk dependency pengembangan Drizzle mengatasi advisory dependency transitif pada versi yang diinstal; jalur build, migrasi, auth dan test diperiksa setelah override. Tinjau ulang override saat memperbarui dependency induk.

## Persiapan Dokploy

Dockerfile dan compose.yaml disiapkan untuk satu instance aplikasi Node di port internal 3000, named volume app_data pada /app/data, dan healthcheck. CLI/daemon Docker belum tersedia pada lingkungan kerja saat implementasi ini, sehingga image dan redeploy volume belum diuji. Jangan menandai deployment selesai hanya karena build Node berhasil.

Sebelum deploy: atur ORIGIN ke origin HTTPS publik, BETTER_AUTH_SECRET acak minimal 32 karakter, dan kredensial Google bila diperlukan. Hubungkan domain Dokploy ke service app port 3000. Jangan publish port database atau menggandakan instance SQLite. Compose mensyaratkan origin dan secret; file .env lokal tidak disalin ke image.

Entrypoint menjalankan migrasi lalu server. Buat pengelola produksi dari terminal container tepercaya dengan `npm run admin:create -- email@domain.id "Nama"`; password diminta secara interaktif (input terlihat di terminal tersebut). Alternatif otomatis memakai ADMIN_PASSWORD hanya di environment proses, jangan di command-line argument atau Git. Script menolak email yang sudah ada, tidak melakukan reset atau promosi akun lama secara diam-diam.

Schema migration baru dibuat dengan `npm run db:generate`, ditinjau, lalu diterapkan dengan `npm run db:migrate`. Ambil snapshot konsisten sebelum migrasi produksi. Aplikasi tidak menjalankan migrasi destruktif otomatis dari perubahan model.

Sebelum rilis publik: uji Docker, volume/redeploy, backup R2 dan restore, alur peserta/pembayaran, batas beban serta kebijakan privasi. R2 masih rencana pada tahap ini.
# Mencoba satu soal

Dari bank soal, buka editor soal lalu klik **Coba soal**. Pilih opsi atau kosongkan jawaban, kemudian klik **Periksa jawaban** untuk melihat skor dan pembahasan. **Coba lagi** membuka ulang simulasi tanpa hasil sebelumnya. Simpan perubahan editor sebelum mencoba; halaman mencoba versi terakhir yang sudah tersimpan. Hanya admin yang dapat memakai simulasi ini. Soal belum lengkap harus diperbaiki dahulu. Ini bukan sesi ujian peserta dan tidak memengaruhi ranking.
