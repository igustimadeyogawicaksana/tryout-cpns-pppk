# DATA-002 — Hasil uji kapasitas SQLite dan diagnosis stress

Tanggal uji: 2026-09-11. Status: selesai untuk baseline lokal; kapasitas produksi tetap harus dikonfirmasi pada VPS final karena mesin, disk dan jaringan berbeda.

## Lingkungan dan metode

- Windows, Node v24.13.0, AMD Ryzen 7 3750H, 8 logical CPU, RAM sekitar 8 GB.
- File SQLite terpisah per skenario pada disk lokal, `better-sqlite3`, WAL, `synchronous=FULL`, `busy_timeout=3000`.
- Paket sintetis SKD 110 soal: 30 TWK, 35 TIU, 45 TKP; durasi metadata 100 menit.
- Semua peserta terverifikasi bergabung ke satu cohort. Setiap peserta menyimpan 110 jawaban dalam urutan round-robin, lalu seluruh peserta submit dan ranking dibaca.
- Pengukuran memanggil service aplikasi langsung dalam satu proses Node. Ini mencerminkan writer sinkron yang digunakan sekarang, tetapi tidak memasukkan HTTP, TLS, Better Auth, jaringan peserta, reverse proxy, Dokploy atau gangguan proses lain.
- Skenario dikompresi dan mengirim operasi secepat proses mampu, bukan menunggu 100 menit waktu nyata. Karena satu proses sinkron, istilah peserta aktif tidak berarti 100 thread menulis pada mikrodetik yang sama.

## Hasil baseline

| Aktif | Autosave | p95 mulai | p95 simpan | p99 simpan | p95 submit | p99 submit | Ranking | Error | Integrity | DB akhir |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|
| 50 | 5.500 | 5,78 ms | 5,47 ms | 7,17 ms | 21,23 ms | 21,97 ms | 3,29 ms | 0 | ok | 1.392.640 B |
| 100 | 11.000 | 5,06 ms | 5,54 ms | 7,36 ms | 23,17 ms | 29,63 ms | 1,52 ms | 0 | ok | 2.048.000 B |
| 300 | 33.000 | — | 5,64 ms | — | 20,45 ms | — | — | 0 | ok | — |
| 500 | 55.000 | 5,65 ms | 5,60 ms | 7,57 ms | 21,03 ms | 23,26 ms | 11,49 ms | 0 | ok | 7.188.480 B |

Semua skenario lengkap memenuhi usulan p95 simpan <500 ms, p95 submit <2 detik, error <0,1%, tanpa kegagalan integrity check. RSS proses pada akhir skenario 500 sekitar 231 MB. Angka ranking hanya satu pembacaan setelah submit dan bukan uji banyak pembaca serentak. Kolom `—` pada 300 berarti ringkasan tersebut tidak dipertahankan di JSON setelah proses berikutnya, bukan kegagalan metrik.

## Diagnosis stall percobaan pertama

Kesimpulan awal bahwa 300 “macet” dibatalkan. Log System Windows menunjukkan komputer masuk sleep pada 20:25:17–20:32:02 ketika percobaan 300 pertama berlangsung. Harness lama hanya mencetak setelah satu level selesai sehingga proses yang tertunda sleep tampak seperti hang tanpa progres.

Harness kemudian mencatat progres tiap 10 soal dan checkpoint WAL. Ulangan 150 dan 200 menunjukkan waktu per operasi stabil. Ulangan 300 selesai sekitar 150 detik dengan p95 simpan 5,64 ms dan p95 submit 20,45 ms. Tidak terlihat deadlock atau checkpoint stall.

Pada percobaan 500 pertama, satu panggilan save tercatat 531.924 ms. Log Windows menunjukkan sleep pada 20:51:31–21:00:23, hampir tepat sepanjang outlier tersebut. Setelah resume, blok berikutnya dan submit kembali normal. Ulangan 500 dengan sleep ditahan selesai 252 detik: sebelas blok masing-masing 5.000 simpan stabil sekitar 21,2–23,0 detik walaupun WAL beberapa kali mencapai 1.000 halaman. P95 simpan 5,60 ms, maksimum 42,61 ms, p95 submit 21,03 ms, nol error dan integrity `ok`.

Diagnosis: bukan batas kapasitas SQLite dan bukan deadlock/kebocoran koneksi pada harness. Penyebab “hang total” adalah laptop tidur; kelemahan harness adalah tidak menampilkan progres dan tidak menandai jeda sistem. Progress per fase sekarang tersedia. Implementasi masih memuat daftar item pada tiap save dan menulis ulang JSON jawaban; itu kandidat optimasi, tetapi hasil ini tidak menjadikannya prasyarat sebelum target 300–500 diuji pada deployment.

## Keputusan hasil DATA-002

DATA-002 selesai sebagai baseline implementasi lokal. Batas rilis yang disarankan tetap 50 peserta aktif saat peluncuran, lalu 100 setelah pengujian yang sama lulus pada VPS final melalui jalur HTTP. Angka 300–500 menjadi target validasi pertumbuhan, tanpa keputusan wajib optimasi lebih dahulu. Hasil direct-service lokal tidak cukup untuk membuka kapasitas produksi sebesar itu.

Pengujian dapat diulang dengan `npm run test:capacity`; default menjalankan 50 dan 100. Stress eksplisit di PowerShell: `$env:CAPACITY_LEVELS='300,500'; npm run test:capacity`. Database dan JSON mentah berada di `.local/capacity` dan tidak masuk Git. Cegah sleep selama pengujian, tetapkan batas waktu, dan cocokkan outlier panjang dengan event sistem/disk sebelum menyimpulkan masalah database.

## Batas yang masih menjadi gerbang rilis

Ulangi pada spesifikasi VPS yang benar-benar dibeli, melalui HTTPS/Dokploy, dengan beberapa klien pembangkit beban. Campurkan login, retry/dua tab, impor, pembaca ranking, worker timeout, backup dan kondisi disk realistis. Profil payment baru dapat ditambahkan setelah PAY-003 ada. Ini validasi deployment dari kapasitas yang sudah diuji lokal, bukan alasan membuat DISC-001 menunggu lagi.
