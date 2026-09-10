# Daftar keputusan

Diperbarui: 2026-09-10. Pengguna memilih arah MVP SQLite lokal, Dokploy self-hosted, dan Better Auth. Detail lain tetap terbuka.

| ID | Pertanyaan | Status | Bukti sebelum diputuskan |
|---|---|---|---|
| DEC-001 | SQLite biasa, D1, atau PostgreSQL? | SQLite lokal dipilih untuk MVP | Kapasitas wajib diuji; PostgreSQL menjadi opsi migrasi, bukan database kedua |
| DEC-002 | QRIS merchant manual atau gateway? | Terbuka | Kelayakan merchant individu, persetujuan produk tryout, biaya, waktu aktivasi, kapasitas admin |
| DEC-003 | Framework, runtime, hosting, ORM, autentikasi? | Dipakai dalam implementasi awal | SvelteKit, TypeScript, Node.js, Drizzle, SQLite, Better Auth; deployment Dokploy dan backup R2 belum dijalankan |
| DEC-004 | Isi MVP dan aturan paket? | Rancangan diperinci | Bank soal manual/impor JSON dan ranking dasar masuk rencana MVP; aturan rinci merupakan default rancangan, konten dan blueprint tahun masih perlu divalidasi |
| DEC-005 | Nama produk, domain, harga? | Terbuka | Keputusan pemilik produk dan validasi pengguna |

Gunakan satu database utama SQLite untuk MVP. Lihat [rencana self-hosting](mvp-self-hosting.md). Pengguna mengonfirmasi Cloudflare R2 sebagai tujuan backup di luar server utama. Bucket, akses, jadwal dan pengujian restore belum dikonfigurasi.

Dokumen awal menyebut semua gateway perlu NIB; klaim tersebut terlalu umum. Dokumentasi Midtrans membedakan individu dari badan usaha. Legalitas usaha tetap perlu diperiksa terpisah dari persyaratan onboarding penyedia.

Pengguna menegaskan SQLite untuk seluruh fitur MVP, bukan hanya soal. [Cakupan SQLite](sqlite-mvp-coverage.md), [bank soal](question-bank-plan.md) dan [ranking](ranking-plan.md) menjadi rujukan perencanaan terbaru. Tidak ada PostgreSQL yang dipasang. Ranking pertama-per-cohort, nilai seri dan privasi adalah default rancangan, bukan aturan resmi BKN atau hasil uji performa.
