# Daftar keputusan

Diperbarui: 2026-09-10. Pengguna memilih arah MVP SQLite lokal, Dokploy self-hosted, dan Better Auth. Detail lain tetap terbuka.

| ID | Pertanyaan | Status | Bukti sebelum diputuskan |
|---|---|---|---|
| DEC-001 | SQLite biasa, D1, atau PostgreSQL? | SQLite lokal dipilih untuk MVP | Kapasitas wajib diuji; PostgreSQL menjadi opsi migrasi, bukan database kedua |
| DEC-002 | QRIS merchant manual atau gateway? | Terbuka | Kelayakan merchant individu, persetujuan produk tryout, biaya, waktu aktivasi, kapasitas admin |
| DEC-003 | Framework, runtime, hosting, ORM, autentikasi? | Sebagian dipilih | Dokploy self-hosted dan Better Auth dipilih; SvelteKit/Node/Drizzle masih rekomendasi |
| DEC-004 | Isi MVP dan aturan paket? | Terbuka | CPNS/PPPK awal, jumlah soal/durasi sesuai sumber resmi, batas percobaan, masa akses, pembahasan gratis/berbayar |
| DEC-005 | Nama produk, domain, harga? | Terbuka | Keputusan pemilik produk dan validasi pengguna |

Gunakan satu database utama SQLite untuk MVP. Lihat [rencana self-hosting](mvp-self-hosting.md). Pengguna mengonfirmasi Cloudflare R2 sebagai tujuan backup di luar server utama. Bucket, akses, jadwal dan pengujian restore belum dikonfigurasi.

Dokumen awal menyebut semua gateway perlu NIB; klaim tersebut terlalu umum. Dokumentasi Midtrans membedakan individu dari badan usaha. Legalitas usaha tetap perlu diperiksa terpisah dari persyaratan onboarding penyedia.
