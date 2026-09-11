# Development log

## 2026-09-11 — RANK-001: halaman ranking

Ranking kini dapat dibuka per 20 peserta dengan tombol sebelumnya/berikutnya dan tautan halaman saya. Posisi dihitung sebelum pembagian halaman, sehingga seri di batas halaman tetap sama. Posisi sendiri tetap tersedia di semua halaman. Parameter halaman tidak valid dibatasi ke rentang yang tersedia. Pengujian ditambah memakai 23 peserta tampil, nilai seri lintas halaman, posisi sendiri dan parameter invalid. Perhitungan masih membaca seluruh hasil eligible; ini perbaikan navigasi, belum optimasi beban melalui snapshot persisten.


## 2026-09-11 — RANK-001: ranking umum per paket

Migrasi 0003 menambahkan periode kompetisi dan anggota unik per pengguna. Admin dapat mengaktifkan satu periode pada paket terbit yang belum pernah dikerjakan, dengan audit. Peserta terverifikasi bergabung memakai alias dan pilihan tampil; pengelola ditolak. Jalur latihan biasa tidak bisa melewati pendaftaran kompetisi. Deadline dibatasi waktu penutupan; pembahasan/nilai opsi disembunyikan server sampai periode tutup, termasuk setelah submit.

Halaman ranking terbatas anggota/admin menampilkan total, seri 1/2/2/4, 100 teratas dan posisi sendiri. Opt-out langsung menghapus baris dari pembacaan berikutnya. Perhitungan memakai transaksi baca konsisten atas hasil tersimpan; generasi snapshot persisten, provinsi, pagination, invalidasi/koreksi dan finalisasi belum dibangun. Paket latihan lama tetap tidak mendapat ranking. Detail batas ini dicatat pada ranking-plan.md.

Migrasi lokal berhasil. Tes ditambahkan untuk isolasi periode, pembatasan akses, rollback anggota tak terverifikasi, penutupan deadline, pembahasan tertunda, seri, nilai nol dan opt-out, serta alur HTTP kompetisi.

Verifikasi: 11 tes unit lulus; svelte-check 0 error/0 warning; build produksi berhasil; HTTP smoke terbaru mencakup aktivasi admin, akses anggota, persetujuan alias, pembahasan tertutup dan opt-out langsung, seluruhnya lulus. Uji beban dan pengujian visual lintas perangkat belum dilakukan pada fitur ranking.

## 2026-09-11 — CONTENT-003: arsip paket

Pengelola dapat mengarsipkan draft/paket terbit dengan alasan wajib yang dicatat dalam audit. Paket hilang dari katalog dan menolak sesi baru; sesi yang sudah dimulai tetap dapat dilanjutkan dari dashboard dan hasil lama tetap dapat dibaca. Arsip berulang tidak menggandakan audit. Paket arsip tidak dapat diterbitkan kembali; buat edisi baru bila diperlukan.

Ditambahkan pengujian transaksi untuk arsip, pelestarian sesi/hasil dan audit serta uji HTTP otorisasi admin dan detail publik. Pengujian login berurutan diberi jeda agar tidak melampaui throttle Better Auth; konfigurasi perlindungan produksi tidak diubah.

Verifikasi gabungan: 10 tes unit lulus; svelte-check 0 error/0 warning; build produksi berhasil. HTTP smoke lulus untuk signup/login sebelum verifikasi, verifikasi/reset, tambah password fixture Google dan login email, proteksi overwrite/CSRF, bank soal API, sesi/hasil dan arsip paket. Tidak mengubah password akun pengguna nyata; pengiriman SMTP nyata dan pengujian lintas perangkat tetap belum lengkap.

## 2026-09-11 — AUTH-003: kejelasan daftar/login dan password akun Google

Ditambahkan centang Tampilkan password pada login, pendaftaran, konfirmasi dan pengaturan password. Notifikasi pendaftaran membawa tombol Lanjut ke login dan digulir ke tampilan setelah respons. Pesan membedakan email baru dari kemungkinan akun lama tanpa mengklaim bahwa pendaftaran ulang mengganti password.

Pemeriksaan akun lokal tanpa mencetak identitas/rahasia menemukan akun Google tanpa credential password. Dashboard sekarang menyediakan pembuatan password melalui Better Auth setPassword untuk pengguna terverifikasi dengan sesi yang memenuhi pemeriksaan keamanan Better Auth. Password yang sudah ada tidak dapat ditimpa melalui action ini. Pengguna menentukan password sendiri; tidak ada password akun nyata diubah oleh agen.

Tes HTTP diperluas untuk login akun email sebelum verifikasi serta fixture akun Google yang menambahkan password, login email, penolakan overwrite, anonim, CSRF dan konfirmasi berbeda. Pengiriman email produksi tetap memerlukan SMTP.

## 2026-09-11 — CONTENT-003, EXAM-001, RESULT-001: alur latihan gratis

Admin dapat menyusun draft paket dari soal terbit dengan kuota per subtes, jenis CPNS/PPPK dan formasi; publikasi membuka katalog/detail peserta. Isi paket disalin saat dibuat. Peserta terverifikasi dapat mulai/lanjut satu sesi, menyimpan jawaban dengan revision guard, menyelesaikan ujian dan membaca skor/pembahasan. Dashboard menampilkan nama di atas serta riwayat sebenarnya. Navigasi pengelola membedakan bank soal dan paket.

Deadline ditentukan server; worker memproses sesi kedaluwarsa sekalipun tab ditutup. API simpan memeriksa pemilik, origin, struktur payload, opsi dan revisi. Kunci/penjelasan hanya dikirim setelah selesai. Ditambahkan tes SQLite dan HTTP pada database sementara; panduan `docs/practice-exam-guide.md` menjelaskan batas alur ini.

Ini latihan gratis; ranking, retake, blueprint resmi terverifikasi, checkout/payment grant, backup R2, SMTP nyata dan validasi perangkat lengkap masih tersisa. Tidak ada perubahan status soal lokal menjadi terbit secara otomatis.

Verifikasi: 9 tes unit lulus, svelte-check 0 error/0 warning, build produksi berhasil, seluruh HTTP smoke (auth, question API dan ujian) lulus. Belum melakukan uji beban atau pengujian UI lintas perangkat pada perubahan ini.

## 2026-09-11 — AUTH-003, logo Google dan pendaftaran email

Ditambahkan logo G lokal pada tombol Google serta form login email yang langsung terlihat, daftar nama/email/password/konfirmasi, lupa password, reset dan kirim ulang verifikasi. Better Auth membuka signup bila pengiriman email tersedia; auto-signin signup dimatikan dan reset mencabut sesi lama. Dashboard menandai email belum terverifikasi; service mulai ujian menolak peserta belum terverifikasi. Admin lama tetap dapat login.

Development memakai outbox privat .local/mail tanpa pengiriman eksternal. Produksi memerlukan SMTP dan MAIL_FROM; konfigurasi Compose/example serta panduan ditambahkan. Uji HTTP mencakup signup/verifikasi/reset melalui outbox sementara dan penolakan akses admin. Pengiriman SMTP nyata belum dikonfigurasi/diuji. Pekerjaan paket/ujian/ranking masih perlu penyambungan UI dan pengujian lanjutan.

## 2026-09-11 — AUTH-002, login Google lokal berhasil

Pengguna memasang credential OAuth di environment privat dan menyelesaikan pemilihan akun/persetujuan Google. Pengguna mengonfirmasi nama tampil di dashboard. Pemeriksaan database read-only menemukan akun provider Google dengan nama terisi, email terverifikasi, sesi aktif dan peran peserta tanpa admin_users. Tidak mencatat email, nama, token atau credential ke dokumentasi. Alur daftar/login Google lokal berhasil; callback domain produksi dan pengujian lintas browser tetap belum diverifikasi.

## 2026-09-10 — AUTH-002, pendaftaran Google

Google dijadikan jalur utama daftar/login peserta melalui Better Auth. Akun baru menuju dashboard; akun lama mengikuti peran; email/password lama tetap tersedia dan signup password publik tetap ditutup. Ditambahkan error callback dengan pesan aman, tombol nonaktif ketika credential kosong dan panduan callback lokal/Dokploy. Pendaftaran Google tidak menambahkan admin_users.

Verifikasi: typecheck/build dan HTTP smoke memakai client ID/secret fiktif untuk memeriksa URL otorisasi, callback, state, secret tidak bocor dan penolakan redirect asing. Tidak menghubungi Google. Credential nyata lokal belum tersedia sehingga consent/callback nyata dan pendaftaran akun Google belum diuji; AUTH-002 tetap In progress.

## 2026-09-10 — PAY-004, fondasi paket dan skema gateway

Ditambahkan fondasi schema paket/opsi/sesi dan service ujian awal (belum terhubung UI/endpoint), lalu persiapan payment gateway sesuai arahan pengguna. Migrasi 0001 memuat paket/sesi; 0002 memuat products, product_packages, orders, order_packages, payments, payment_events, access_grants dan refunds. Produk dan snapshot pembelian terpisah; integer rupiah, deduplikasi provider/event dan grant tunggal diberi constraint. Dokumen payment-gateway-schema.md membedakan constraint database dari pemeriksaan lintas tabel/transisi yang wajib dibangun di service.

Verifikasi: migrasi diuji pada SQLite sementara termasuk migrasi ulang, foreign key, uang negatif/pecahan, duplikasi checkout/payment/event/grant dan event belum terverifikasi. Typecheck dan tes diperiksa. Tidak ada gateway, webhook publik, checkout atau akses berbayar diaktifkan. Service ujian masih fondasi yang perlu pengujian dan penyambungan; pekerjaan paket/ujian tetap belum selesai.

## 2026-09-10 — USER-001, UX-002, halaman peserta

Beranda publik menggantikan redirect root ke admin. Ditambahkan katalog /paket dengan filter CPNS/PPPK dan kondisi kosong, dashboard /dashboard untuk akun login, navigasi peserta/logout, serta /account untuk redirect berdasarkan peran. Login peserta yang sudah ada menuju dashboard; admin tetap menuju bank soal. Pendaftaran mandiri/pemulihan akun belum diaktifkan. Tidak ada paket, pembelian, nilai atau testimoni palsu. Respons dengan akun login memakai private/no-store.

Layout memakai grid fleksibel, breakpoint HP, ukuran huruf adaptif, navigasi membungkus, fokus keyboard dan target tombol minimal 44 px. Beranda terlihat di browser aplikasi; katalog diperiksa pada viewport 320×740 dan ukuran browser dikembalikan. Pemeriksaan browser dibatasi ketika pengguna berinteraksi dengan tab. Belum mengklaim lolos Safari/Firefox atau perangkat fisik; matriks lintas browser tetap UX-002 In progress.

Verifikasi: typecheck tanpa error/warning, build dan HTTP smoke meliputi beranda/katalog publik, dashboard anonim ditolak, redirect peserta/admin, no-store, serta regresi bank soal/API/coba soal. Paket, ujian, pembayaran dan backup tetap pekerjaan terpisah.

## 2026-09-10 — CONTENT-005, coba soal

Ditambahkan tombol Coba soal pada editor dan halaman simulasi satu soal untuk admin. GET hanya mengirim pertanyaan dan teks opsi, tanpa kunci, bobot atau pembahasan. POST memeriksa hak admin, kelengkapan, revision dan pilihan sebelum menghitung skor di server. Hasil menampilkan nilai, kunci/pilihan bobot tertinggi dan pembahasan; tersedia opsi jawaban kosong dan coba lagi. Soal yang belum lengkap tidak dapat dinilai. Tidak mengubah isi soal atau menyimpan hasil ke ranking.

Verifikasi: typecheck/build dan HTTP smoke menguji kunci/pembahasan tidak ada pada halaman awal, skor benar/salah/kosong, pilihan ilegal, stale revision dan akses non-admin. Tes memakai database sementara. Sebelumnya tiga soal sintetis TEST-API-TIU-001/002/003 berhasil ditambahkan melalui API lokal dengan retry tanpa duplikasi; ketiganya tetap draft, bukan konten resmi CPNS 2027.

## 2026-09-10 — CONTENT-004, API unggah bank soal

Pengguna memperjelas kebutuhan: endpoint untuk mengirim hasil pembuatan soal dari skrip/backend langsung ke bank soal, bukan integrasi generator AI. Ditambahkan POST /api/admin/questions dan /api/admin/questions/batch. Keduanya memakai bearer token khusus tambah draft, hash token dan aktor admin melalui environment, validasi lengkap, Idempotency-Key persisten, transaksi atomik, tautan hasil ke admin dan audit. Batas: 100 soal/2 MB dan 60 request terautentikasi per menit per instance. Cookie admin saja tidak mengizinkan API. Hak admin diperiksa setiap permintaan.

Script api:token membuat/merotasi token privat; Compose dan .env.example diperbarui. Panduan API memuat contoh pengiriman objek langsung tanpa file. Pekerjaan awal generator AI/CSV dan schema paket yang belum dipakai dibatalkan mengikuti klarifikasi pengguna; tidak ada migrasi database baru. Target tahun 2027 belum menjadi kurikulum resmi terverifikasi, dan API tidak mengklaim memvalidasi kesesuaian materi tahun seleksi.

Verifikasi: typecheck, build, enam tes service SQLite dan HTTP integration test. Pengujian API mencakup token salah/tanpa token/cookie saja, JSON rusak, tipe/ukuran body, data tidak valid, duplikasi, retry bersamaan, batch atomik, status draft, audit dan pencabutan admin. Semua memakai database sementara terpisah dari bank soal kerja. Tidak ada pemanggilan provider AI atau deployment publik.

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
`nVerifikasi perubahan pagination: 11 tes unit lulus, svelte-check 0 error/0 warning dan build produksi berhasil. Belum diuji visual di seluruh perangkat.
