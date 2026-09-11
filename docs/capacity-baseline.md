# DISC-001 — Usulan kapasitas dan anggaran MVP

Pembaruan setelah DATA-002: lihat [hasil uji kapasitas](capacity-test-results.md). DISC-001 dibuka ulang singkat untuk konfirmasi usulan revisi: batasi rilis awal 50 peserta aktif dan naikkan ke 100 hanya setelah profil HTTP yang sama lulus pada VPS final. Target 300–500 dan 2.000 sesi penuh/12 jam belum didukung hasil uji.

Diperbarui 2026-09-11. DISC-001 ditutup memakai angka berikut sebagai estimasi awal agar DATA-002 dapat berjalan; angka akan dibuka ulang dan direvisi setelah hasil uji nyata tersedia. Ini belum merupakan janji kapasitas produksi. Revisi anggaran terakhir menggantikan usulan Rp200.000–350.000/bulan. Stack tetap SQLite, Dokploy, Better Auth dan backup R2.

## Dasar perencanaan

| Parameter | Dasar DATA-002 |
|---|---|
| Peserta aktif bersamaan | Uji awal 50 lalu 100; uji pertumbuhan 300 dan 500 terpisah |
| Sesi harian | 100–300 biasa; 2.000 pada musim puncak |
| Autosave | Setiap perubahan jawaban; satu request aktif per sesi, revision dan retry; tidak menulis timer setiap detik |
| Latensi | Usulan interpretasi terukur: p95 autosave <500 ms, p95 submit <2 detik; laporkan p99 juga |
| Anggaran VPS | Rp55.000–100.000/bulan, termasuk biaya lokasi/pajak/kurs yang berlaku; belum ada penawaran final |
| Provider | Prioritas kandidat Contabo Singapura; alternatif lokal bila penawaran dan layanan lebih cocok |
| Domain | Opsional, perkiraan pengguna Rp150.000/tahun; bukan harga registrar terverifikasi |
| Backup | R2 Standard; target memakai kuota gratis awal, bukan jaminan gratis selamanya |

SLO diukur dari klien uji regional hingga respons server, dengan jaringan, payload, timeout dan persentil dilaporkan. Jaringan peserta tidak dapat dijamin selalu di bawah 500 ms. Nol jawaban yang sudah diakui server hilang, nol hasil/akses pembayaran ganda, error server termasuk lock timeout <0,1%. Request gagal tetap masuk laporan, bukan dihapus dari statistik. Angka ini menjadi kriteria usulan untuk ditinjau setelah benchmark.

## Implikasi volume

Perhitungan perencanaan, bukan pengukuran: 2.000 sesi × 100 menit / 1.440 menit = sekitar 139 peserta aktif rata-rata bila tersebar 24 jam; dalam 12 jam menjadi sekitar 278. Karena itu target 100 aktif tidak mencakup 2.000 sesi penuh dalam 12 jam. Sesi pendek atau distribusi waktu berbeda mengubah hasil ini.

Asumsikan 110 jawaban awal + 22 perubahan = 132 penyimpanan per sesi. Puncak 2.000 sesi menghasilkan 264.000 request simpan/hari. Rata-rata selama ujian 100 menit sekitar 2,2 request/detik untuk 100 peserta dan 11/detik untuk 500 peserta. Burst satu perubahan tiap dua detik menghasilkan 50/detik dan 250/detik. Sesi harian bukan jumlah pesanan berbayar.

## DATA-002 — matriks pengujian

1. Rekam CPU, RAM, disk, lokasi, versi runtime/SQLite, konfigurasi WAL, ukuran database awal dan pola jaringan. Mulai dari kandidat 2 vCPU/4 GiB RAM; kecukupan dan ketersediaan dalam anggaran belum terbukti. Bangun image di luar jam ujian atau di CI untuk menghindari rebutan RAM.
2. Jalankan 50 dan 100 peserta selama satu ujian penuh 100 menit, serta profil 130 menit yang relevan. Ulangi 300/500 sebagai stress test, bukan kapasitas yang otomatis disetujui.
3. Campurkan simpan normal, burst perubahan, retry, dua tab, putus koneksi, baca hasil/ranking dan impor soal. Uji login bersamaan karena hashing password juga memakan sumber daya.
4. Uji submit 100 peserta dalam lima detik, lalu 500 dalam lima detik; uji timeout massal terpisah. Ukur latensi submit interaktif dan keterlambatan finalisasi latar belakang secara terpisah.
5. Uji backup saat penulisan, disk hampir penuh, restart/redeploy dan restore pada salinan terisolasi. Setelah PAY-003 tersedia, tambahkan webhook berulang/terlambat dan rekonsiliasi; benchmark ujian boleh dimulai sebelum itu, tetapi kelulusan rilis berbayar menunggu profil gabungan.
6. Simpan hasil mentah, persentil, error, CPU/RAM, pertumbuhan WAL, antrean dan integrity check. Kapasitas rilis dibatasi ke skenario yang lulus. Pembatasan jumlah peserta belum diimplementasikan.

Audit implementasi: jawaban sesi saat ini disimpan sebagai objek JSON yang ditulis ulang saat berubah, bukan satu baris per jawaban. Worker kedaluwarsa berjalan tiap 15 detik dengan batch 100; 500 sesi dapat membutuhkan beberapa siklus, sekitar 75 detik pada kondisi ideal terburuk tanpa memperhitungkan waktu proses. Ranking membaca hasil eligible dan menghitung posisi sebelum pagination. Ukur ketiganya sebelum menjanjikan 500 peserta; jangan menyimpulkan kapasitas dari ukuran file saja.

## OPS-003 — volume dan pemulihan

Satu aplikasi penulis pada volume SSD/NVMe lokal persisten. Database aktif, WAL dan SHM berada pada volume yang sama. R2 menyimpan backup konsisten, bukan database aktif. Jangan menyalin file utama SQLite sendirian saat masih ditulis; gunakan mekanisme snapshot konsisten dan uji restore.

Estimasi sementara 20 KiB/sesi termasuk jawaban, hasil dan indeks harus diganti hasil pengukuran. Pada 2.000 sesi/hari selama 30 hari: sekitar 1,14 GiB/bulan, atau 3,43 GiB selama tiga bulan. Tambahkan bank soal, versi paket, auth, audit dan pembayaran yang diukur terpisah. Contoh anggaran ruang awal: database 5 GiB + dua salinan lokal untuk staging/restore 10 GiB + cadangan WAL 5 GiB + log 4 GiB + ruang kosong 30% → sekitar 35 GiB, dibulatkan menjadi volume 40 GiB. Ini cadangan ruang, bukan prediksi file database langsung 5 GiB. Gambar/media belum termasuk.

Disk host juga menampung OS, Dokploy dan image/build Docker; contoh target total 80 GB harus dicek terhadap paket VPS. Bila anggaran tidak menyediakan ruang itu, ukur ulang horizon/retensi atau batasi kapasitas; jangan menghapus ruang pemulihan tanpa evaluasi. Pantau disk pada 70/85%, umur backup terakhir, kegagalan snapshot dan pertumbuhan WAL. Uji redeploy tanpa kehilangan data dan restore dengan integrity check serta hitungan sesi/pesanan.

Usulan awal backup gratis: snapshot harian, tujuh salinan, RPO hingga 24 jam dan target RTO dua jam setelah insiden diketahui. Ini belum diterima sebagai toleransi kehilangan data produksi, khususnya pembayaran. Sebelum rilis berbayar, putuskan RPO yang lebih ketat (misalnya 15 menit atau satu jam), retensi dan biaya; OPS-004 tidak boleh dianggap selesai hanya karena unggah berhasil.

R2 Standard menyediakan 10 GB-month penyimpanan, 1 juta operasi Class A dan 10 juta Class B per bulan, dengan egress gratis. Kuota ini bukan 10 GB per file; seluruh salinan dan objek lain ikut dihitung. Tujuh snapshot 0,5 GB sekitar 3,5 GB dapat berada dalam kuota; tujuh snapshot 5 GB sekitar 35 GB melewatinya. Jangan memangkas backup penting hanya untuk menjaga biaya nol. [Harga resmi R2](https://developers.cloudflare.com/r2/pricing/).

## Pemilihan server dan keputusan tersisa

Contabo menawarkan lokasi Singapura, tetapi tarif lokasi Asia dapat ditambahkan ke harga dasar. Harga checkout paket yang memenuhi kebutuhan belum terverifikasi; jangan menyatakan kandidat ini pasti masuk Rp100.000. Catat periode tagihan, biaya awal, perpanjangan, lokasi, IPv4, pajak dan kurs sebelum memilih. [Lokasi Singapura](https://contabo.com/en/vps-singapore/), [biaya lokasi](https://help.contabo.com/en/support/solutions/articles/103000269774/).

Provider lokal tidak otomatis mencakup pengelolaan OS, patching, Dokploy, backup dan pemulihan. Minta cakupan managed service tertulis bila itu yang diinginkan. Domain berbayar tetap opsional, tetapi akses produksi memerlukan hostname HTTPS stabil yang sesuai konfigurasi auth dan callback; anggaran SMTP belum ditentukan.

Keputusan pemilik yang masih diperlukan sebelum deployment: penawaran VPS final dalam batas anggaran, cakupan pengelolaan server, RPO/retensi backup produksi, dan apakah puncak harus melayani 300–500 aktif atau dijadwalkan bertahap. Tidak ada server dibeli atau kapasitas dinaikkan dalam pekerjaan dokumentasi ini.
