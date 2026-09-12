# Development log

## 2026-09-12 — PAY-003, RESULT-001, RANK-001 stabil lokal

Pembayaran manual kini menyimpan bukti terstruktur (pengirim, nominal, waktu, referensi), memvalidasi nominal dan waktu, mengaudit persetujuan/penolakan, mengakhiri order setelah 24 jam, serta mendukung pencabutan grant dengan alasan. Bukti yang ditolak dapat diperbaiki selama order masih berlaku. QRIS asli dan gateway tetap ditunda.

Ringkasan hasil berbayar tetap dapat dilihat setelah sesi selesai, sedangkan nilai pilihan dan pembahasan hanya dikirim ketika grant masih aktif. Grant kedaluwarsa/dicabut juga menolak mulai, simpan, dan submit sesi aktif. Paket yang pernah ditandai berbayar tidak berubah gratis hanya karena produknya dinonaktifkan.

Ranking kompetisi tetap dinamis sampai periode berakhir. Akses pertama setelah penutupan membuat satu snapshot persisten berisi alias, provinsi dan skor; perubahan hasil atau profil sesudahnya tidak mengubah snapshot. Opt-out tetap segera menyembunyikan entri snapshot. Satu peserta tidak dapat membuat sesi kompetisi kedua.

Verifikasi lokal: migrasi SQLite berhasil, 13 tes unit lulus, svelte-check 0 error/0 warning, build produksi berhasil, dan smoke HTTP checkout/auth/bank soal/ujian/ranking lulus.

## 2026-09-12 — Perbaikan akar error POST paket dan checkout

Halaman paket mencampur action default dan action bernama buy, sehingga SvelteKit menolak POST dengan 500. Action mulai diubah menjadi start dan seluruh form/tes start kompetisi disesuaikan. Perubahan redirect/URL sebelumnya tidak mengatasi akar error ini. Hasil smoke sebelumnya memakai build lama sehingga tidak membuktikan source terbaru lulus.

Ditambahkan pengujian HTTP checkout pada database sementara: beli dan retry, akses halaman pembayaran berdasarkan pemilik, kirim referensi, persetujuan admin, penolakan mulai sebelum bayar dan izin mulai setelah grant. Data pengguna lokal tidak diubah. Validasi dilakukan terhadap build yang baru dibuat; kesiapan pembayaran produksi masih memerlukan audit bukti, nominal, kedaluwarsa dan pencabutan akses.

## 2026-09-11 — AUTH-002: timeout koneksi Google setelah perbaikan origin

Log callback terbaru menunjukkan `UND_ERR_CONNECT_TIMEOUT` saat Better Auth menghubungi Google. Pengujian tanpa token/secret ke endpoint Google menemukan GET sertifikat gagal dengan resolusi default dan berhasil (200) menggunakan Node `--dns-result-order=ipv4first`. Perintah dev ditambah preferensi IPv4 dan server lokal dijalankan ulang. Respons GET 404 dari endpoint token berarti endpoint terjangkau tetapi metode GET tidak didukung; bukan bukti token exchange berhasil. Penyelesaian OAuth dengan akun nyata masih harus dicoba pengguna. Browser saat diagnosis masih memiliki sesi admin; itu tidak membuktikan percobaan Google terbaru berhasil.

## 2026-09-11 — AUTH-002: perbaikan origin login Google lokal

Login Google gagal ketika UI dibuka melalui `http://127.0.0.1:5173`, sedangkan `BETTER_AUTH_URL` dan callback Google memakai `http://localhost:5173`. Log menunjukkan POST social sign-in dari 127.0.0.1 mendapat 404; request yang sama pada localhost mendapat 200 dan URL tujuan `accounts.google.com`. Client ID/Secret tersedia tanpa dicetak.

Hook server sekarang mengalihkan antar-host loopback ke origin Better Auth yang dikonfigurasi dengan status 307, mempertahankan path dan query. Ini mencegah OAuth dimulai pada cookie host 127.0.0.1 lalu kembali ke localhost. Perilaku hanya berlaku ketika host asal dan tujuan sama-sama localhost/127.0.0.1; domain produksi tidak diarahkan oleh aturan ini.

## 2026-09-11 — Koreksi diagnosis DATA-002: stall berasal dari sleep laptop

Kesimpulan sementara “300 tidak selesai” diperiksa ulang. Event System Windows membuktikan laptop sleep pada 20:25:17–20:32:02 saat percobaan 300 pertama. Harness diperbarui untuk menampilkan fixture, pembuatan sesi, setiap blok 10 soal, halaman WAL dan fase submit. Ulangan 300 selesai sekitar 150 detik dengan p95 simpan 5,64 ms, p95 submit 20,45 ms, nol error dan integrity ok.

Percobaan 500 pertama menangkap satu save 531,9 detik; Windows sleep pada 20:51:31–21:00:23. Setelah resume, beban kembali normal. Ulangan dengan sleep ditahan menyelesaikan 55.000 autosave dalam total 252 detik: p95 simpan 5,60 ms, p99 7,57 ms, maksimum 42,61 ms; 500 submit p95 21,03 ms; nol error, integrity ok. Blok save stabil ketika WAL mencapai 1.000 halaman. Tidak ada bukti deadlock, bocor koneksi atau batas serialisasi pada level ini dalam pengujian langsung service lokal.

Catatan DATA-002 dan BACKLOG dikoreksi: 300–500 tidak lagi “ditunda sampai optimasi”. Keduanya menjadi target validasi pertumbuhan melalui HTTP/Dokploy pada VPS; optimasi dilakukan bila profil itu gagal. Batas rilis 50 lalu 100 tetap konservatif karena benchmark ini tidak memasukkan jaringan/auth/reverse proxy dan mesin VPS murah dapat lebih lambat.

DISC-001 tetap dibuka untuk konfirmasi revisi. Peserta aktif bersamaan dipisahkan dari total sesi selesai: 100–300 sesi/hari biasa adalah volume; 2.000 sesi penuh/12 jam memerlukan rata-rata sekitar 278 aktif plus headroom. Angka tersebut tidak disamakan dengan batas concurrency.

## 2026-09-11 — DATA-002 selesai lokal; DISC-001 dibuka ulang untuk revisi

Benchmark repeatable ditambahkan melalui `npm run test:capacity` dan hasilnya dicatat di [docs/capacity-test-results.md](docs/capacity-test-results.md). Paket sintetis berisi 110 soal; setiap peserta menyimpan seluruh 110 jawaban, submit, lalu ranking dibaca. SQLite memakai WAL, `synchronous=FULL` dan satu proses Node sebagaimana implementasi saat ini.

Pada 50 peserta/5.500 autosave: p95 simpan 5,47 ms, p95 submit 21,23 ms, nol error, integrity ok. Pada 100 peserta/11.000 autosave: p95 simpan 5,54 ms, p95 submit 23,17 ms, nol error, integrity ok. Keduanya lulus target lokal p95 500 ms/2 detik. Tes mengecualikan HTTP, auth, TLS, jaringan dan VPS; hasil bukan janji produksi.

Stress 300 masih menulis setelah lebih dari 10 menit dan dihentikan sebelum metrik lengkap; 500 tidak diteruskan karena level lebih rendah belum selesai dalam jendela uji. Keduanya tidak dinyatakan lulus. DATA-002 ditutup sebagai baseline lokal dengan bukti dan batas eksplisit. Validasi pada VPS final tetap menjadi gerbang rilis, tanpa membuat circular dependency baru.

DISC-001 dibuka ulang setelah DATA-002 sesuai alur yang diminta. Usulan revisi berbasis hasil: rilis dengan batas 50 aktif; naik ke 100 setelah tes HTTP/Dokploy lulus pada VPS final. Target 300–500 ditunda sampai optimasi dan benchmark baru. Dengan batas 100, 2.000 sesi penuh berdurasi 100 menit tidak muat dalam 12 jam (kebutuhan rata-rata sekitar 278 aktif); angka musim puncak perlu dijadwalkan lintas hari atau direvisi.

## 2026-09-11 — DISC-001 ditutup sebagai estimasi awal; DATA-002 dimulai

Circular dependency diputus: DISC-001 ditandai Done memakai angka estimasi awal yang sudah disepakati—50–100 peserta aktif, stress 300/500, 100–300 sesi/hari dan puncak 2.000, autosave setiap perubahan, usulan p95 simpan <500 ms/submit <2 detik, serta VPS Rp55.000–100.000/bulan. Angka ini eksplisit akan direvisi, bukan ditahan sampai benchmark selesai.

DATA-002 dimulai dari baseline tersebut. Setelah hasil uji dicatat, DISC-001 akan dibuka ulang singkat untuk konfirmasi/revisi; status awal tidak dipakai untuk mengklaim kapasitas produksi.

## 2026-09-11 — PROD-001, DISC-001, PAY-001: kajian P0 sebelum implementasi lanjutan

Ditambahkan [acuan ujian](docs/exam-rules-baseline.md), [usulan kapasitas](docs/capacity-baseline.md) dan [perbandingan pembayaran](docs/payment-provider-comparison.md), dengan sumber resmi dan batas verifikasi. Tidak ada perubahan runtime, schema, paket/sesi lama atau transaksi nyata pada pekerjaan ini.

**Dampak PROD-001 dicatat sebelum pekerjaan EXAM-001, CONTENT-003 dan RESULT-001 dilanjutkan:** SKD acuan 2024 adalah 110 soal (30 TWK/35 TIU/45 TKP), 100 menit profil umum, maksimum 550. EXAM-001 perlu uji preset tersebut dan akomodasi terpisah; kode saat ini memakai durasi paket configurable, form admin default 10 menit, bukan timer global 100 soal. CONTENT-003 perlu blueprint immutable beserta sumber/tahun acuan/status verifikasi serta pemisahan trial, latihan dan kompetisi. RESULT-001 perlu evaluasi ambang per kategori yang tervalidasi; skor latihan bukan kelulusan CPNS. Jangan mengubah hasil lama secara retroaktif. SKB CAT 80/100 soal dan 90 menit tidak menetapkan satu scoring universal lintas jabatan. Aturan 2027 belum terverifikasi sehingga PROD-001 tetap In progress.

Konflik rancangan diselesaikan: ranking dasar tetap MVP untuk kompetisi dengan cohort identik; trial/latihan pendek mendapat pembahasan setelah dinilai dan tidak masuk ranking kompetisi; pembahasan kompetisi ditunda sampai penutupan. Pembatasan konversi trial dan blueprint masih harus dibangun; perilaku runtime belum diklaim memenuhi seluruh keputusan baru.

DISC-001 memakai usulan pengguna 50–100 aktif, stress 300–500, 100–300 sesi harian dan 2.000 saat puncak, simpan setiap perubahan serta usulan p95 simpan <500 ms/submit <2 detik. Revisi terakhir anggaran VPS adalah Rp55.000–100.000/bulan, menggantikan Rp200.000–350.000; domain opsional sekitar Rp150.000/tahun. Contabo Singapura kandidat, total checkout dan layanan managed belum diverifikasi. R2 gratis hanya bila seluruh retensi/operasi berada dalam kuota. 2.000 sesi penuh/12 jam berarti rata-rata 278 aktif; tidak tercakup oleh target 100. DATA-002 dan OPS-003 diberi matriks uji serta perhitungan ruang, bukan klaim kapasitas. RPO/retensi produksi dan server final masih perlu ditetapkan.

PAY-001 Done sebatas kajian perbandingan resmi. Midtrans individu tidak memiliki daftar dokumen yang sama dengan badan usaha; approval tryout, tarif akun dan settlement/refund final tetap perlu konfirmasi. Rekomendasi gateway untuk akses otomatis bersifat bersyarat; manual memerlukan verifikasi transaksi merchant dan jam layanan. PAY-002/PAY-003 belum dilanjutkan. Perbedaan dokumentasi pencairan Midtrans umum tiga hari kerja versus QRIS statis dua hari dicatat, tidak disamakan dengan kontrak akun QRIS dinamis.

Verifikasi: audit konfigurasi durasi, batas batch worker/API dan implementasi penyimpanan/ranking; pemeriksaan sumber primer, konsistensi angka dan diff dokumentasi. Tidak menjalankan ulang tes aplikasi karena perubahan hanya dokumentasi. Stack SQLite/Dokploy/Better Auth/R2 tetap.

## 2026-09-11 — USER-002, RANK-001: profil dan ranking provinsi

Menu Profil memungkinkan peserta mengubah nama tampilan dan provinsi opsional. Validasi server membatasi nama dan pilihan provinsi; identitas pemilik diambil dari sesi, bukan dari form. Migrasi 0004 menambahkan profil dan kolom provinsi pada anggota ranking. Saat bergabung, provinsi disalin secara atomik bersama pendaftaran; perubahan profil tidak mengubah sesi lama dan data lama tidak diisi mundur.

Ranking dapat difilter menurut provinsi, dengan peringkat dihitung setelah filter dan sebelum pagination. Tautan pagination/halaman saya mempertahankan wilayah. Persetujuan bergabung menyebut alias, skor dan provinsi; peserta tanpa provinsi tetap masuk ranking umum jika opt-in. Daftar label mengacu wilayah pada tabel BPS; slug aplikasi bukan kode wilayah resmi. Provinsi tetap pernyataan peserta, bukan verifikasi lokasi.

Tes ditambah untuk validasi profil, kegagalan tanpa perubahan parsial, provinsi beku, posisi lokal, wilayah kosong dan invalid, serta jalur HTTP profil dan filter. Migrasi lokal berhasil.

Verifikasi: 11 tes unit lulus, svelte-check 0 error/0 warning, build produksi dan seluruh HTTP smoke lulus termasuk profil dan provinsi beku. Belum ada uji beban atau matriks browser/perangkat lengkap.

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

Verifikasi perubahan pagination: 11 tes unit lulus, svelte-check 0 error/0 warning dan build produksi berhasil. Belum diuji visual di seluruh perangkat.

## 2026-09-11 — EXAM-001, tata letak jawab soal bergaya CAT

Halaman menjawab soal disusun dengan pola yang familiar seperti CAT BKN: header timer dan status penyimpanan, panel pertanyaan, pilihan A–E berbentuk kartu, navigasi nomor soal, penanda soal terjawab, progress, tombol sebelumnya/berikutnya, serta konfirmasi sebelum mengakhiri ujian. Tampilan responsif untuk layar kecil.

Identitas resmi BKN, logo, dan elemen merek tidak disalin; halaman tetap menggunakan identitas tryout sendiri. Logika timer berbasis server, autosave/revision, retry, dan submit tetap dipertahankan. Verifikasi: svelte-check tanpa error/warning, build produksi berhasil, dan 11 tes unit lulus.

## 2026-09-11 — EXAM-002, ulangi latihan dan paket uji 20 soal

Sesi yang sudah selesai kini dapat diulang dari halaman hasil. Setiap pengulangan membuat sesi baru, sementara sesi yang masih berjalan tetap dilanjutkan. Indeks unik satu sesi per pengguna dan paket dihapus melalui migrasi `0005_powerful_namor.sql`; riwayat sesi tetap tersimpan.

Paket lokal `Coba Fitur Jawab Soal — 20 Soal` disiapkan untuk percobaan dengan 10 soal TIU dan 10 soal TKP sintetis. Konten ini hanya data uji, bukan soal resmi. Verifikasi: 11 tes unit lulus, svelte-check 0 error/0 warning, dan build produksi berhasil.

## 2026-09-11 — Pembersihan data uji

Paket percobaan `Coba Fitur Jawab Soal` beserta versi soal sintetis `TRY-UI-*`, item, opsi, dan sesi uji dihapus dari SQLite lokal setelah pengujian selesai. Bank soal lain tidak diubah.

## 2026-09-11 — PAY-002, pembayaran manual MVP

Alur pembayaran manual dipilih untuk MVP: transfer bank atau QRIS diverifikasi pengelola sebelum akses dibuka. Status order, payment, event, grant akses, refund, idempotensi, dan jalur migrasi ke gateway otomatis dicatat di `docs/manual-payment-flow.md`. Skema tabel gateway yang sudah ada tetap menjadi kontrak data; UI checkout dan verifikasi admin menjadi pekerjaan PAY-003.

## 2026-09-11 — PAY-003, service dan endpoint pembayaran manual

Ditambahkan service pembayaran manual untuk membuat order idempoten, menerima referensi bukti, memproses review admin, mengubah status order/payment/event, dan membuat grant akses setelah disetujui. Endpoint `POST/PUT /api/payments/manual` memakai kontrak tabel gateway yang sama sehingga provider otomatis dapat ditambahkan kemudian. UI checkout/admin dan uji HTTP masih menjadi pekerjaan lanjutan.

Verifikasi: 11 tes unit lulus dan svelte-check 0 error/0 warning.

## 2026-09-11 — PROD-002 dan LEGAL-001, pedoman produk

Pedoman produk dan akses ditulis di `docs/product-and-access-policy.md`, mencakup paket gratis/berbayar/kompetisi, retake, masa akses, pembayaran manual, order kedaluwarsa, refund, serta disclaimer hasil. Checklist legal dan privasi ditulis di `docs/legal-and-privacy-checklist.md`; publikasi halaman legal dan tinjauan hukum masih tersisa.

Kebijakan retake diperjelas: retake gratis tetap aktif untuk pengujian saat pengembangan, tetapi target final sebelum rilis adalah satu percobaan untuk paket gratis dan kuota percobaan eksplisit untuk produk berbayar.

## 2026-09-11 — PAY-003, uji end-to-end lokal

Alur order manual diuji dengan data sementara: membuat produk aktif dan paket terbit, membuat order, mengirim referensi bukti, menyetujui pembayaran sebagai admin, lalu memeriksa grant akses. Hasil: payment `succeeded` dan grant akses terbentuk. Semua data uji dibersihkan kembali setelah pengujian.

## 2026-09-11 — Produk uji SKD CPNS lengkap

Disiapkan produk aktif `Tryout SKD CPNS Lengkap — Uji Coba` dengan paket 110 soal sintetis, komposisi 30 TWK, 35 TIU, 45 TKP, durasi 100 menit, harga uji Rp25.000 dan masa akses 30 hari. Halaman detail paket kini menampilkan produk aktif dan tombol membuat order pembayaran manual. Konten diberi label sintetis dan bukan soal resmi.

Verifikasi: svelte-check 0 error/0 warning dan 11 tes unit lulus.

CI lokal pada source terbaru: `npm run test:http` berhasil penuh setelah perbaikan alur pembelian manual. Run GitHub Actions sebelumnya pada commit `65afa4d` gagal sebelum pemeriksaan ulang ini; commit berikutnya memicu validasi ulang.

## 2026-09-11 — PAY-003, produk berbayar admin

Ditambahkan halaman admin `/admin/products` untuk membuat produk aktif, menetapkan harga dan masa akses, serta menghubungkannya ke paket tryout terbit. Produk ini menjadi sumber order manual dan pemeriksaan grant akses paket.

Verifikasi: 11 tes unit lulus dan svelte-check 0 error/0 warning.

## 2026-09-11 — PAY-003, UI checkout dan verifikasi

Ditambahkan halaman `/pembayaran/[id]` untuk menampilkan nominal/instruksi pembayaran dan mengirim referensi bukti, serta `/admin/payments` untuk menyetujui atau menolak pembayaran manual. Persetujuan membuat grant akses sesuai masa produk; penolakan tidak membuka akses. Konfigurasi rekening/QRIS dibaca dari environment dan tidak masuk Git.

Verifikasi: 11 tes unit lulus dan svelte-check 0 error/0 warning. Uji HTTP dengan produk aktif dan kredensial admin masih perlu dilakukan.

## 2026-09-11 — PAY-003, pembatasan akses paket berbayar

Mesin ujian kini memeriksa `access_grants` yang masih berlaku untuk paket yang terhubung ke produk aktif dengan harga di atas nol. Paket gratis tetap dapat dimulai langsung; paket berbayar tanpa grant ditolak dengan instruksi menyelesaikan pembayaran.

Verifikasi: 11 tes unit lulus dan svelte-check 0 error/0 warning.
