# Cakupan SQLite untuk MVP

Keputusan pengguna 2026-09-10: satu SQLite lokal mencakup seluruh fitur MVP. PostgreSQL tetap opsi masa depan, tidak ditambahkan sekarang. Dokumen ini menetapkan persyaratan implementasi, bukan klaim aplikasi sudah lulus uji kapasitas.

| Fitur | Rancangan pada SQLite | Batas/verifikasi |
|---|---|---|
| Better Auth dan akun | Tabel adapter auth dan profil dalam database aplikasi | Schema mengikuti versi library; role/ownership dicek backend |
| Bank soal dan paket | Versi immutable, opsi/bobot, impor draft | Lihat question-bank-plan.md; impor dibatasi dan tidak menahan lock lama |
| Ujian dan autosave | Upsert jawaban berubah, revision, deadline server | Satu penulis; antrean dibatasi, retry terukur dan UI status simpan |
| Penilaian | Integer, versi soal tetap, transaksi finalisasi | Double submit/timeout harus idempotent |
| Ranking | Hasil tersimpan, RANK(), snapshot berkala | Tidak menghitung semua jawaban pada tiap kunjungan |
| Pembayaran | Order, payment, event dan entitlement satu database | Signature/status/nominal diperiksa; event dedup dan aktivasi atomik |
| Backup | Snapshot konsisten SQLite ke R2 privat | Uji restore dan integrity check; R2 bukan lokasi SQLite aktif |

## Aturan database

Gunakan UUID dari aplikasi sebagai TEXT NOT NULL PRIMARY KEY, foreign_keys=ON per koneksi, CHECK untuk status/nilai/boolean, dan unique constraint untuk identitas domain. Nilai uang dalam integer rupiah; waktu UTC disimpan konsisten. Foreign key jawaban harus memastikan pilihan terkait soal sesi, bukan sekadar option_id valid di bank soal. Tetapkan mapping tipe sebelum implementasi untuk memudahkan migrasi nanti.

Evaluasi WAL dan synchronous=FULL untuk durabilitas pembayaran; nilai akhir ditetapkan dari pengujian driver/disk. busy_timeout dibatasi, bukan menunggu tanpa akhir. Pembayaran jaringan, upload file, parsing impor dan perhitungan besar tidak dilakukan sambil memegang transaksi tulis. Gunakan satu instance aplikasi pada named volume lokal, tanpa berbagi file melalui jaringan.

Autosave default usulan: debounce sekitar 1 detik setelah perubahan jawaban, kirim hanya perubahan, satu permintaan aktif per sesi dan retry dengan revision yang sama. Saat navigasi tunggu/beri status pengakuan simpan; sebelum submit kirim perubahan tertunda selama deadline masih berlaku. Jangan menulis timer setiap detik. Simpan revision untuk menolak request lama yang datang setelah jawaban baru. Penyimpanan lokal untuk retry boleh dipertimbangkan, tetapi bukan bukti jawaban diterima server dan tidak memuat kunci.

Order/payment memakai ID unik; satu payment event penyedia memiliki identitas deduplikasi yang sesuai kontraknya. Setelah notifikasi diverifikasi di luar transaksi, di dalam transaksi pendek cocokkan order/nominal/mata uang, ubah status dengan transisi yang diizinkan, dan berikan entitlement unik. Callback berulang atau dua admin bersamaan tidak membuat akses ganda. Akses tidak dibuka dari redirect atau unggahan bukti saja. Refund/reversal membutuhkan alur eksplisit dan audit; notifikasi lama tidak boleh menurunkan status lunas tanpa aturan.

## Target uji sebelum peluncuran

Target berikut adalah skenario benchmark sementara, bukan janji kapasitas: 50, 100, 200 peserta bersamaan; naikkan setelah hasil stabil. Jalankan profil perubahan jawaban realistis, burst submit akhir sesi, webhook duplikat, impor draft dan pembacaan ranking. Catat spesifikasi server, versi SQLite/driver, ukuran soal/hasil, frekuensi autosave dan durasi pengujian agar hasil dapat diulang.

Usulan kriteria: nol jawaban yang sudah diakui server hilang; nol aktivasi pembayaran/hasil ganda; p95 autosave <1 detik, p95 submit <3 detik, error server <0,1% pada beban target di lingkungan uji. Target ini harus divalidasi terhadap jaringan/lokasi pengujian dan kebutuhan produk. Ukur lock timeout, antrean, CPU/RAM/disk dan waktu rebuild ranking. Uji backup saat ada penulisan dan restore terpisah.

Jika gagal: periksa query/indeks, kurangi transaksi panjang, sesuaikan antrean/import/rebuild dan ulangi profil gagal. Batasi kapasitas rilis ke beban yang sudah terbukti. Evaluasi PostgreSQL hanya bila kebutuhan nyata tetap melampaui hasil optimasi atau membutuhkan beberapa server. Tidak ada angka kapasitas produksi yang disetujui saat ini.

## Urutan implementasi

1. Lengkapi runtime/framework/ORM; schema akun, bank soal, paket dan transaksi.
2. Bank soal manual, impor draft, review dan penerbitan versi.
3. Ujian, autosave, penilaian dan akses pembahasan.
4. Ranking umum/provinsi berbasis cohort, snapshot dan privasi.
5. Pembayaran, backup R2, uji akses, kapasitas dan restore sebelum rilis berbayar.

Rujukan terkait: [bank soal](question-bank-plan.md), [ranking](ranking-plan.md), [deployment/migrasi/backup](mvp-self-hosting.md), [kajian pembayaran](database-payment-options.md). Rincian tahapan bergantung backlog; dokumentasi selesai tidak berarti fitur sudah dibangun.
