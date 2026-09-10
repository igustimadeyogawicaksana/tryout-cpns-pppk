# Development log

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
