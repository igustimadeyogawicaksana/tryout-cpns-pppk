# Backlog

Terakhir diperbarui: 2026-09-10. P0 = sebelum implementasi; P1 = MVP; P2 = lanjutan. Semua penanggung jawab belum ditetapkan. Status Done berarti keluaran sudah ada dan diperiksa, bukan sekadar direncanakan.

| ID | Prioritas | Pekerjaan | Status | Dependensi | Kriteria selesai |
|---|---|---|---|---|---|
| PLAN-001 | P0 | Baca rancangan dan catat opsi database/payment | Done | — | Kajian bersumber tersedia; stack tetap terbuka |
| PLAN-002 | P0 | Dev log, backlog, daftar keputusan | Done | PLAN-001 | Berkas saling tertaut; status akurat |
| REPO-001 | P0 | Inisialisasi Git lokal | Done | PLAN-002 | Dokumen awal disimpan pada commit 201042f; dokumen perencanaan pada commit berikutnya |
| REPO-002 | P0 | Hubungkan repo GitHub buatan pengguna dan push | Done | REPO-001 | Repo public terverifikasi, origin tersambung, push main berhasil; main melacak origin/main |
| DISC-001 | P0 | Tetapkan target peserta dan pola simpan | Todo | — | Target serentak, sesi harian, frekuensi autosave, toleransi latensi dan anggaran tertulis |
| PAY-001 | P0 | Validasi merchant individu | Todo | — | Bandingkan syarat/approval produk tryout, biaya, settlement, refund, API/webhook pada kandidat penyedia |
| PAY-002 | P0 | Pilih alur manual atau gateway | Todo | PAY-001 | Alur disepakati; bila manual ada jam layanan dan target waktu verifikasi |
| DATA-001 | P0 | Finalisasi schema dari model logis | In progress | PLAN-004 | Model soal/sesi/ranking/payment terdokumentasi; DDL, mapping tipe dan constraint lintas tabel belum dibangun |
| DATA-002 | P1 | Uji kapasitas SQLite | Todo | APP-001, EXAM-001, PAY-003, RANK-001, DISC-001 | Profil autosave/submit/payment/ranking diuji pada server target; tidak menjadi dependensi pemilihan framework |
| DEC-001 | P0 | Lengkapi keputusan stack MVP | Done | PLAN-004 | Implementasi memakai SvelteKit/TypeScript/Node/Drizzle, SQLite, Better Auth; Dokploy/R2 tetap target hosting/backup |
| PROD-001 | P0 | Rapikan aturan ujian dan scope MVP | Todo | — | Validasi jumlah soal/durasi/skor ke sumber resmi tahun seleksi; selesaikan konflik ranking MVP dan pembahasan trial di rancangan |
| PROD-002 | P0 | Nama, harga, masa akses dan percobaan | Todo | — | Aturan pembelian/ulang/trial/refund tertulis dan dapat diuji |
| UX-001 | P1 | Wireframe alur inti | Todo | PROD-001, PROD-002, PAY-002 | Alur daftar-bayar-ujian-hasil dan admin nyaman di HP/tablet/desktop |
| APP-001 | P1 | Setup aplikasi dan lingkungan | Done | DEC-001 | Setup lokal, migrasi SQLite, typecheck/build dan HTTP smoke lolos; secret/data lokal diabaikan Git |
| USER-001 | P1 | Beranda, katalog dan dashboard peserta | Done | APP-001 | Halaman publik, filter CPNS/PPPK, dashboard terlindungi dan redirect berdasarkan peran; paket/hasil masih kondisi kosong |
| UX-002 | P1 | Validasi lintas perangkat/browser | In progress | USER-001 | Layout responsif dan katalog 320 px diperiksa di browser aplikasi; matriks Chrome/Edge/Firefox/Safari, tablet, landscape dan perangkat fisik masih perlu diuji |
| AUTH-001 | P1 | Akun, akses admin, trial | In progress | APP-001, PROD-002 | Login pengelola dan proteksi admin selesai; registrasi peserta, pemulihan akun, Google live dan trial belum selesai |
| CONTENT-001 | P1 | Form bank soal, review dan versi | In progress | APP-001, PROD-001, DATA-001 | Draft, review, approval, terbit, arsip/revisi dan stale-write guard selesai; blueprint/kategori resmi, assets dan rich text belum |
| CONTENT-002 | P1 | Impor JSON ke draft | In progress | CONTENT-001 | Preview, batch atomik, retry/hash dan batas 100 soal/2 MB selesai; validasi referensi blueprint/topik/formasi masih menunggu katalog |
| CONTENT-003 | P1 | Blueprint dan publikasi paket | Todo | CONTENT-001, PROD-001 | Kuota/durasi/skor diverifikasi, paket membekukan versi soal; tidak mengirim kunci saat ujian |
| CONTENT-004 | P1 | Endpoint API unggah soal | Done | CONTENT-001 | POST satu/batch, bearer token admin, batas 2 MB/100 soal, validasi, retry idempotent, transaksi atomik dan audit; HTTP integration test lulus |
| CONTENT-005 | P1 | Coba soal sebagai pengelola | Done | CONTENT-001 | Tombol dari editor; kunci/pembahasan tidak dikirim pada GET; penilaian server untuk pilihan/kosong, revision guard, coba ulang dan proteksi admin; tidak mencatat hasil ujian/ranking |
| PAY-003 | P1 | Checkout dan verifikasi pembayaran | Todo | AUTH-001, CONTENT-001, PAY-002 | Bayar valid membuka akses sekali; bukti palsu/duplikat/nominal salah tidak membuka akses; ada audit |
| PAY-004 | P1 | Skema payment gateway | Done | DATA-001 | Produk, snapshot pesanan, payment attempt, event, grant dan refund tersedia di migrasi; constraint SQLite diuji; checkout/webhook/aktivasi akses belum diimplementasikan |
| EXAM-001 | P1 | Mesin tryout | Todo | AUTH-001, CONTENT-003 | Timer server, autosave/revision/reconnect, versi dan urutan soal tetap, submit/timeout idempotent |
| RANK-001 | P1 | Ranking dasar umum dan provinsi | Todo | EXAM-001, RESULT-001 | Cohort sama, percobaan kompetitif pertama, seri 1/2/2/4, privasi, posisi saya dan snapshot atomik sesuai ranking-plan.md |
| RANK-002 | P1 | Koreksi penilaian dan finalisasi ranking | Todo | RANK-001 | Revisi diaudit, cohort tidak mencampur aturan, hasil dan generasi ranking konsisten |
| RESULT-001 | P1 | Hasil dan pembahasan dasar | Todo | EXAM-001, PROD-001 | Skor per subtes benar; pembahasan mengikuti hak akses |
| OPS-001 | P1 | Backup, pemulihan dan pemantauan | Todo | APP-001, DATA-001 | Restore diuji; pantau gagal simpan, pembayaran tertunda dan penggunaan kuota |
| LEGAL-001 | P1 | Ketentuan produk dan legalitas | Todo | PROD-002, PAY-001 | Tinjau NIB/kewajiban usaha, privasi, refund, hak konten dan disclaimer sebelum rilis |
| QA-001 | P1 | Uji alur ujung ke ujung | Todo | PAY-003, EXAM-001, RESULT-001, CONTENT-002, RANK-002 | Input-publish-bayar-ujian-ranking lolos; uji seri, retake, opt-out, gangguan jaringan, double submit dan akses ilegal |
| RELEASE-001 | P1 | Persiapan peluncuran | Todo | QA-001, DATA-002, OPS-001, OPS-004, LEGAL-001 | Uji kapasitas dan restore lolos; checklist rilis dan biaya ditinjau |
| NEXT-001 | P2 | Grafik progres dan komunitas | Todo | RELEASE-001 | Prioritas berdasarkan umpan balik; ranking dasar sudah masuk MVP |
| NEXT-002 | P2 | Otomasi pembayaran bila MVP manual | Todo | PAY-003, PAY-001 | Migrasi tidak menghapus riwayat dan hak akses; webhook/reconciliation teruji |

## Aturan update

Tambahan dari arah self-hosting:

| ID | Prioritas | Pekerjaan | Status | Dependensi | Kriteria selesai |
|---|---|---|---|---|---|
| PLAN-003 | P0 | Catat arah SQLite, Dokploy dan Better Auth | Done | PLAN-002 | Rencana deployment, migrasi PostgreSQL dan backup tertulis; pilihan vs usulan dibedakan |
| PLAN-004 | P0 | Dokumentasi SQLite, input soal dan ranking | Done | PLAN-003 | Tiga spesifikasi dan contoh JSON tersedia; default produk dipisahkan dari aturan resmi; belum ada implementasi |
| OPS-002 | P0 | Identifikasi tujuan backup | Done | — | Pengguna mengonfirmasi Cloudflare R2; konfigurasi dipisahkan ke OPS-004 |
| OPS-004 | P1 | Konfigurasi backup ke Cloudflare R2 | Todo | OPS-002, OPS-003 | Bucket privat, akses terbatas, kuota/biaya diperiksa, snapshot konsisten terjadwal, retensi, pemantauan dan restore teruji |
| OPS-003 | P1 | Volume SQLite persisten di Dokploy | Todo | APP-001 | Redeploy tidak menghilangkan data; satu instance; snapshot konsisten dan restore teruji |
| DATA-003 | P2 | Latihan migrasi SQLite ke PostgreSQL | Todo | DATA-001, APP-001 | Tipe, ID, auth, jawaban, pembayaran dan akses tervalidasi; prosedur cutover/rollback diuji |

Gunakan Todo → In progress → Done; Blocked harus menyebut hambatan konkret. Saat menyelesaikan pekerjaan, tambahkan bukti di DEVLOG.md dan referensikan ID pada commit. Backlog Markdown ini adalah sumber pelacakan awal; GitHub Issues/Project belum dibuat.
