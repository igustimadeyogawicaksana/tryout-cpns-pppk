# Development log

## 2026-09-10 — APP-001, AUTH-001, CONTENT-001/002, implementasi pertama

Permintaan lanjut dikerjakan sebagai fondasi aplikasi dan bank soal yang bisa dijalankan. SvelteKit/TypeScript/Node/Drizzle dipakai; satu SQLite lokal dengan WAL, foreign keys, FULL durability, busy timeout dan migrasi terlacak. Better Auth menyediakan login pengelola; tabel admin_users mengontrol akses server dan pendaftaran email publik dimatikan. Google hanya disiapkan melalui environment, belum diaktifkan.

UI: login, daftar/filter/status/statistik soal, draft manual, opsi satu-kunci/bobot, pembahasan teks, sumber, review, approval, terbit, arsip, revisi dan riwayat versi. Impor JSON memiliki preview, batas ukuran/jumlah, validasi, hash batch, unique key dan transaksi atomik. Tidak ada data contoh yang otomatis masuk ke bank kerja.

Perlindungan: stale revision ditolak; versi terbit tidak dapat diedit melalui service; semua endpoint bank soal memeriksa akses pengelola. Form POST lintas origin ditolak. Rahasia dan akun lokal acak hanya tersimpan pada berkas yang diabaikan Git. Dockerfile/Compose named volume disiapkan, tetapi Docker tidak tersedia untuk pengujian image/deploy.

Verifikasi: enam pengujian service SQLite lulus (skor, validasi, deduplikasi, rollback, versi/stale edit, draft tidak lengkap); typecheck tanpa error/warning; build Node berhasil; HTTP smoke login/persistensi/otorisasi/signup-disabled/CSRF berhasil. Dependency audit setelah override transitif melaporkan nol kerentanan. Halaman login lokal dibuka. Ini bukan hasil benchmark peserta serentak atau pengujian OAuth/Dokploy.

Workflow GitHub Actions disiapkan untuk menjalankan pemeriksaan tipe, pengujian SQLite, build dan HTTP smoke pada push main/pull request. Hasil verifikasi di atas berasal dari mesin lokal; hasil workflow remote belum diverifikasi.

Batas: blueprint resmi/katalog kategori, opsi ternormalisasi untuk ujian, assets/rich text, paket, ujian, ranking, payment dan backup R2 belum selesai. Panduan development-guide.md dan status backlog menjelaskan tahapan tersebut; belum ada deployment publik.

## 2026-09-10 — PLAN-004, bank soal dan perankingan SQLite

Pengguna menegaskan SQLite untuk MVP dan meminta dokumentasi input bank soal serta ranking. Ditambahkan spesifikasi cakupan SQLite, input manual/impor JSON/review/versi/paket dan ranking cohort/percobaan pertama/seri/provinsi/privasi. Disediakan dua soal sintetis sebagai contoh format impor, bukan konten siap jual. Ranking dasar dipindah ke rencana MVP; ketergantungan backlog diperbaiki agar pengujian kapasitas dilakukan setelah fitur tersedia dan sebelum rilis. README dan daftar keputusan diselaraskan; rancangan asli tetap utuh.

Verifikasi: dokumentasi SQLite Window Functions dan referensi historis BKN dibaca; aturan tahun terkini tidak diasumsikan. JSON diperiksa struktur, opsi dan skornya; tautan lokal dan whitespace dokumentasi diperiksa sebelum commit. Belum ada importir, UI, schema executable, ranking atau benchmark produksi. Angka kapasitas/latensi adalah target pengujian, bukan hasil.

## 2026-09-10 — OPS-002, konfirmasi Cloudflare R2

Pengguna mengonfirmasi Cloudflare R2 sebagai tujuan backup. README, daftar keputusan dan rencana MVP diselaraskan. OPS-002 selesai; OPS-004 ditambahkan untuk konfigurasi dan uji backup/restore. SQLite aktif tetap di volume persisten server Dokploy; R2 menyimpan salinan backup. Verifikasi: pemeriksaan diff dan konsistensi dokumen. Belum ada bucket, credential, jadwal backup atau deployment yang dibuat.

## 2026-09-10 — PLAN-003, arah MVP self-hosted

Pengguna mengarahkan MVP ke SQLite lokal, Dokploy self-hosted dan Better Auth, dengan opsi migrasi PostgreSQL nanti. README dan daftar keputusan diperbarui; ditambahkan rencana volume persisten, migrasi lintas database, snapshot konsisten dan latihan restore. Backlog dilengkapi. Tujuan backup “r 1” menunggu klarifikasi; belum diasumsikan sebagai R2. Framework/runtime/ORM masih usulan.

Verifikasi: dokumentasi resmi Dokploy Volume Backups, Better Auth database, dan SQLite Backup API dibaca. Perubahan hanya dokumentasi; tidak ada aplikasi, server, akun auth atau backup yang sudah dikonfigurasi. Pemeriksaan diff dilakukan sebelum commit.

## 2026-09-10 — PLAN-001, PLAN-002

Permintaan: evaluasi SQLite/PostgreSQL dan payment/QRIS tanpa menetapkan stack; buat backlog, dev log, serta pelacakan GitHub.

Perubahan:
- Membaca rancangan Markdown awal; berkas asli dan PDF dipertahankan.
- Menambahkan README, backlog, daftar keputusan dan kajian database/payment dengan sumber resmi.
- Memperbaiki asumsi dalam kajian: gateway tidak universal mensyaratkan NIB; Midtrans membedakan individu dan badan usaha.
- Menambahkan aturan pelacakan perubahan serta pengecualian rahasia, database lokal, bukti unggahan dan backup dari Git.

Verifikasi: sumber resmi SQLite, Cloudflare, Midtrans, GoPay dan BI dibaca. Belum ada kode aplikasi atau uji beban; kecukupan kapasitas belum dinyatakan terbukti. Stack, provider dan harga tetap terbuka.

GitHub: konektor mengenali akun igustimadeyogawicaksana tetapi tidak memiliki operasi pembuatan repositori. Browser pembuatan repo meminta login dan CLI GitHub tidak tersedia. Repo remote belum dibuat; menunggu login pengguna di tab yang disiapkan.

## 2026-09-10 — REPO-001

Git lokal diinisialisasi dengan branch main. Commit 201042f menyimpan dua referensi asli. Dokumen kajian, backlog dan dev log disimpan pada commit terpisah agar perubahan mudah dibandingkan. Pemeriksaan whitespace dilakukan sebelum commit dokumentasi. REPO-002 tetap terhambat login; belum ada push atau sinkronisasi otomatis.

## 2026-09-10 — REPO-002, koneksi repositori

Pengguna membuat https://github.com/igustimadeyogawicaksana/tryout-cpns-pppk dengan visibilitas public. Repo kosong telah diperiksa melalui GitHub dan origin lokal diarahkan ke repo tersebut. Push pertama ditolak karena Git memakai akun berbeda. Login Git untuk akun pemilik sedang diminta; login browser sudah berhasil, tetapi belum berarti autentikasi Git lokal selesai. Stack tetap belum diputuskan.

Hasil lanjutan: autentikasi Git berhasil dan push main diterima GitHub. Branch main kini melacak origin/main. Preferensi akun Git disetel khusus repositori ini agar unggahan berikutnya memakai akun pemilik. README menautkan repo dan halaman riwayat commit; REPO-002 selesai. Tidak ada perubahan stack atau implementasi aplikasi, dan push tetap dilakukan per pekerjaan, bukan otomatis setiap penyimpanan berkas.
