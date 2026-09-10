# Daftar keputusan

Diperbarui: 2026-09-10. Semua pilihan teknologi masih terbuka.

| ID | Pertanyaan | Status | Bukti sebelum diputuskan |
|---|---|---|---|
| DEC-001 | SQLite biasa, D1, atau PostgreSQL? | Terbuka | Target peserta serentak, frekuensi simpan, hasil uji beban, backup dan biaya |
| DEC-002 | QRIS merchant manual atau gateway? | Terbuka | Kelayakan merchant individu, persetujuan produk tryout, biaya, waktu aktivasi, kapasitas admin |
| DEC-003 | Framework, runtime, hosting, ORM, autentikasi? | Terbuka | Kesesuaian dengan DEC-001, biaya, keamanan dan kemudahan operasi |
| DEC-004 | Isi MVP dan aturan paket? | Terbuka | CPNS/PPPK awal, jumlah soal/durasi sesuai sumber resmi, batas percobaan, masa akses, pembahasan gratis/berbayar |
| DEC-005 | Nama produk, domain, harga? | Terbuka | Keputusan pemilik produk dan validasi pengguna |

Arahan sementara: evaluasi satu database utama; tidak ada kebutuhan terbukti untuk menjalankan SQLite dan PostgreSQL sekaligus. Ini rekomendasi kajian, bukan keputusan stack.

Dokumen awal menyebut semua gateway perlu NIB; klaim tersebut terlalu umum. Dokumentasi Midtrans membedakan individu dari badan usaha. Legalitas usaha tetap perlu diperiksa terpisah dari persyaratan onboarding penyedia.
