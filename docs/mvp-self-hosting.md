# Arah MVP: SQLite, Dokploy, Better Auth

Pembaruan DISC-001 2026-09-11: anggaran VPS terbaru Rp55.000–100.000/bulan; Contabo Singapura kandidat dengan total penawaran belum diverifikasi. Profil beban, volume, retensi R2 dan gerbang deployment mengikuti [baseline kapasitas](capacity-baseline.md). R2 gratis bergantung total pemakaian; provider lokal tidak otomatis layanan pengelolaan server.

Tanggal: 2026-09-10. Dokumen ini memperbarui arah teknis; kajian sebelumnya dan rancangan asli tetap menjadi referensi historis.

## Pilihan pengguna dan usulan lanjutan

- Dipilih: SQLite lokal untuk MVP, server sendiri dikelola melalui Dokploy, autentikasi Better Auth.
- Tujuan: memungkinkan migrasi ke PostgreSQL kemudian.
- Implementasi pertama memakai SvelteKit + TypeScript, adapter-node, Node.js LTS dan Drizzle. Lihat [panduan pengembangan](development-guide.md) untuk menjalankan dan batas fitur.
- Dipilih: Cloudflare R2 sebagai tujuan backup di luar server utama, berdasarkan klarifikasi pengguna. Konfigurasi belum dilakukan.
- Pembayaran: belum ada keputusan baru; tetap lihat kajian pembayaran.

SQLite mencakup akun, bank soal, paket, sesi/jawaban, hasil, ranking dan pembayaran dalam satu database. Detail fitur dan persyaratan verifikasi ada di [cakupan SQLite](sqlite-mvp-coverage.md), [input bank soal](question-bank-plan.md) dan [perankingan](ranking-plan.md).

Self-hosting menghilangkan kebutuhan langganan database terpisah, tetapi server tetap memiliki biaya sewa atau listrik/internet bila memakai perangkat sendiri. Dokploy mengelola deployment; tidak menyediakan kapasitas server gratis. Belum ada server yang diakses atau deployment dilakukan.

## Penyimpanan dan deployment

Jalankan satu instance aplikasi pada satu server terlebih dahulu. Letakkan SQLite di Docker named volume yang persisten, misalnya /app/data/app.sqlite; jangan simpan dalam layer image atau folder sementara. File database tidak masuk Git. Pastikan redeploy tetap memakai volume yang sama dan tidak membuat dua penulis aplikasi saat pergantian versi tanpa koordinasi.

Gunakan transaksi singkat, foreign keys, indeks yang diperlukan, busy timeout, dan evaluasi WAL. WAL tidak menghilangkan batas satu penulis SQLite. Uji autosave, submit serentak, aktivasi pembayaran, serta perebutan lock sebelum menetapkan kapasitas. Jangan membagi file SQLite melalui network filesystem ke beberapa server.

Better Auth mendukung SQLite dan PostgreSQL. Pemilihan adapter/driver dan migrasi tabel auth harus mengikuti versi yang digunakan. [Dokumentasi database Better Auth](https://better-auth.com/docs/concepts/database).

## Migrasi ke PostgreSQL

Bisa dilakukan, tetapi bukan sekadar mengganti connection string. ORM membantu pengorganisasian schema, bukan menjamin konversi lintas database otomatis.

1. Sejak awal gunakan ID stabil, nominal uang integer, waktu UTC yang formatnya jelas, foreign key dan unique constraint. Pisahkan akses data dari logika ujian/payment. Hindari ketergantungan SQL khusus SQLite yang tidak diperlukan.
2. Buat schema dan migration PostgreSQL tersendiri; petakan boolean, timestamp, JSON, default value serta indeks secara eksplisit.
3. Latih migrasi pada salinan data: akun, identitas OAuth, hash password bila dipakai, paket, versi soal, sesi/jawaban, order, pembayaran, hak akses dan audit. Pertahankan ID dan relasinya. Jangan mengubah hash password menjadi plaintext. Uji kompatibilitas auth; sesi boleh diakhiri dan pengguna diminta login ulang jika diperlukan.
4. Bandingkan jumlah baris, relasi, nominal transaksi dan hasil penilaian. Uji login, pembayaran berulang dan melanjutkan sesi.
5. Saat pindah, buka jendela maintenance: hentikan penulisan, buat snapshot terakhir, impor, verifikasi, lalu ganti koneksi dan buka aplikasi. Tunda checkout baru dan siapkan retry/rekonsiliasi webhook agar pembayaran selama perpindahan tidak hilang.
6. Simpan SQLite lama sebagai backup. Bila PostgreSQL sudah menerima penulisan baru, rollback perlu rekonsiliasi data; jangan langsung kembali ke salinan lama.

Pemicu evaluasi migrasi: antrean penulisan/lock melanggar target latensi setelah optimasi, kebutuhan beberapa instance/server, atau kebutuhan operasional baru. Jumlah pengguna terdaftar saja bukan pemicu yang cukup.

## Backup konsisten dan pemulihan

Gunakan SQLite Online Backup API atau mekanisme snapshot konsisten yang setara untuk membuat salinan sebelum upload. Menyalin app.sqlite saat database aktif dapat melewatkan data di WAL atau menghasilkan salinan tidak konsisten. [SQLite Backup API](https://www.sqlite.org/backup.html).

Dokploy menyediakan backup named volume ke tujuan S3. Fitur ini tidak berlaku untuk bind mount. Arsip volume bukan bukti otomatis bahwa SQLite aktif dicadangkan konsisten: gunakan snapshot SQLite terlebih dahulu atau hentikan penulisan secara terkontrol. [Dokploy Volume Backups](https://docs.dokploy.com/docs/core/volume-backups).

Usulan kebijakan, belum dikonfigurasi: snapshot setiap jam, retensi 24 snapshot per jam dan 7 snapshot harian, serta salinan sebelum rilis/migrasi. Konsekuensinya sampai satu jam perubahan bisa hilang bila server rusak tepat sebelum backup berikutnya; sesuaikan dengan kebutuhan pembayaran. Pilih pemulihan target dua jam setelah latihan restore membuktikannya.

Gunakan bucket Cloudflare R2 privat, di luar server utama, dengan credential terbatas dan rahasia terpisah dari Git. SQLite aktif tetap berada di volume server; R2 menyimpan hasil backup, bukan file database yang dibuka langsung oleh aplikasi. Simpan juga aset unggahan dan konfigurasi pemulihan yang diperlukan. Pantau keberhasilan, umur backup terakhir, ukuran/checksum dan kegagalan upload. Uji restore ke database terpisah, integrity check, login, hasil ujian dan pencocokan pembayaran. Tidak ada bucket atau backup yang sudah dikonfigurasi pada pekerjaan ini.
