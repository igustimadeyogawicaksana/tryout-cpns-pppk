# Backlog

Terakhir diperbarui: 2026-09-10. P0 = sebelum implementasi; P1 = MVP; P2 = lanjutan. Semua penanggung jawab belum ditetapkan. Status Done berarti keluaran sudah ada dan diperiksa, bukan sekadar direncanakan.

| ID | Prioritas | Pekerjaan | Status | Dependensi | Kriteria selesai |
|---|---|---|---|---|---|
| PLAN-001 | P0 | Baca rancangan dan catat opsi database/payment | Done | — | Kajian bersumber tersedia; stack tetap terbuka |
| PLAN-002 | P0 | Dev log, backlog, daftar keputusan | Done | PLAN-001 | Berkas saling tertaut; status akurat |
| REPO-001 | P0 | Inisialisasi Git lokal | Done | PLAN-002 | Dokumen awal disimpan pada commit 201042f; dokumen perencanaan pada commit berikutnya |
| REPO-002 | P0 | Buat repo private GitHub dan push | Blocked | REPO-001 | URL repo terverifikasi; remote tersambung; commit lokal/remote sesuai. Menunggu login browser |
| DISC-001 | P0 | Tetapkan target peserta dan pola simpan | Todo | — | Target serentak, sesi harian, frekuensi autosave, toleransi latensi dan anggaran tertulis |
| PAY-001 | P0 | Validasi merchant individu | Todo | — | Bandingkan syarat/approval produk tryout, biaya, settlement, refund, API/webhook pada kandidat penyedia |
| PAY-002 | P0 | Pilih alur manual atau gateway | Todo | PAY-001 | Alur disepakati; bila manual ada jam layanan dan target waktu verifikasi |
| DATA-001 | P0 | Model data logis | Todo | DISC-001 | Order/payment/akses terpisah, uang integer, referensi pembayaran unik, snapshot soal dan jawaban per sesi |
| DATA-002 | P0 | Uji kapasitas kandidat database | Todo | DATA-001 | Simpan/submit/payment bersamaan diuji pada target DISC-001; laporkan latensi/error/biaya/restore |
| DEC-001 | P0 | Review dan pilih stack | Todo | DATA-002, PAY-002 | Keputusan eksplisit beserta alasan; jangan scaffold sebelum keputusan ini |
| PROD-001 | P0 | Rapikan aturan ujian dan scope MVP | Todo | — | Validasi jumlah soal/durasi/skor ke sumber resmi tahun seleksi; selesaikan konflik ranking MVP dan pembahasan trial di rancangan |
| PROD-002 | P0 | Nama, harga, masa akses dan percobaan | Todo | — | Aturan pembelian/ulang/trial/refund tertulis dan dapat diuji |
| UX-001 | P1 | Wireframe alur inti | Todo | PROD-001, PROD-002, PAY-002 | Alur daftar-bayar-ujian-hasil dan admin nyaman di HP/tablet/desktop |
| APP-001 | P1 | Setup aplikasi dan lingkungan | Todo | DEC-001 | Aplikasi minimal bisa dijalankan; rahasia terpisah dari repo |
| AUTH-001 | P1 | Akun, akses admin, trial | Todo | APP-001, PROD-002 | Peserta tidak dapat mengakses admin/data peserta lain; trial sesuai aturan |
| CONTENT-001 | P1 | Bank soal dan paket | Todo | APP-001, PROD-001 | Admin mengelola soal, bobot dan pembahasan; perubahan soal tidak mengubah sesi lama |
| PAY-003 | P1 | Checkout dan verifikasi pembayaran | Todo | AUTH-001, CONTENT-001, PAY-002 | Bayar valid membuka akses sekali; bukti palsu/duplikat/nominal salah tidak membuka akses; ada audit |
| EXAM-001 | P1 | Mesin tryout | Todo | AUTH-001, CONTENT-001 | Timer server, autosave/reconnect, urutan soal tersimpan, submit idempotent, hasil konsisten |
| RESULT-001 | P1 | Hasil dan pembahasan dasar | Todo | EXAM-001, PROD-001 | Skor per subtes benar; pembahasan mengikuti hak akses |
| OPS-001 | P1 | Backup, pemulihan dan pemantauan | Todo | APP-001, DATA-001 | Restore diuji; pantau gagal simpan, pembayaran tertunda dan penggunaan kuota |
| LEGAL-001 | P1 | Ketentuan produk dan legalitas | Todo | PROD-002, PAY-001 | Tinjau NIB/kewajiban usaha, privasi, refund, hak konten dan disclaimer sebelum rilis |
| QA-001 | P1 | Uji alur ujung ke ujung | Todo | PAY-003, EXAM-001, RESULT-001 | Daftar-bayar-ujian-hasil lolos; uji gangguan jaringan, double submit, akses ilegal dan bayar terlambat |
| RELEASE-001 | P1 | Persiapan peluncuran | Todo | QA-001, OPS-001, LEGAL-001 | Checklist rilis dan biaya ditinjau; deployment dikerjakan sebagai tahap berikutnya |
| NEXT-001 | P2 | Ranking, grafik progres, komunitas | Todo | RELEASE-001 | Prioritas berdasarkan umpan balik dan aturan privasi ranking |
| NEXT-002 | P2 | Otomasi pembayaran bila MVP manual | Todo | PAY-003, PAY-001 | Migrasi tidak menghapus riwayat dan hak akses; webhook/reconciliation teruji |

## Aturan update

Gunakan Todo → In progress → Done; Blocked harus menyebut hambatan konkret. Saat menyelesaikan pekerjaan, tambahkan bukti di DEVLOG.md dan referensikan ID pada commit. Backlog Markdown ini adalah sumber pelacakan awal; GitHub Issues/Project belum dibuat.
