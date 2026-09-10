# Development log

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
