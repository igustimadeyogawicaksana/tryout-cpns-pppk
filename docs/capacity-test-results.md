# DATA-002 — Hasil uji kapasitas SQLite

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

Keduanya memenuhi usulan p95 simpan <500 ms, p95 submit <2 detik, error <0,1%, tanpa kegagalan integrity check. RSS proses pada akhir skenario sekitar 232 MB dan 238 MB. Angka ranking hanya satu pembacaan setelah submit dan bukan uji banyak pembaca serentak.

## Stress 300/500

Profil 300 peserta dimulai dengan metode yang sama. Setelah lebih dari 10 menit, proses masih aktif menulis file/WAL dan belum menghasilkan satu set metrik lengkap, lalu dihentikan agar pengujian memiliki batas operasional. Karena hasil parsial tidak menyediakan p95/submit/integrity akhir, 300 tidak dinyatakan lulus maupun gagal SLO. Skenario 500 tidak dijalankan setelah profil 300 tidak selesai dalam jendela tersebut. Ini batas metode dan lingkungan lokal, bukan bukti SQLite pasti gagal pada 300/500 peserta selama ujian 100 menit nyata.

Temuan ini cukup untuk keputusan MVP awal: 50–100 aktif layak dilanjutkan ke validasi VPS; 300–500 belum didukung bukti. Hambatan yang terlihat selaras dengan implementasi saat ini: setiap autosave memuat daftar item untuk validasi dan menulis ulang objek JSON jawaban, sedangkan setiap submit menilai 110 item beserta opsi. Optimasi harus diukur sebelum menaikkan batas.

## Keputusan hasil DATA-002

DATA-002 selesai sebagai baseline implementasi lokal. Batas rilis yang disarankan adalah 50 peserta aktif saat peluncuran, lalu 100 hanya setelah pengujian yang sama lulus pada VPS final melalui jalur HTTP. Jangan membuka 300–500 atau mengiklankan 2.000 sesi penuh dalam 12 jam berdasarkan hasil ini.

Pengujian dapat diulang dengan `npm run test:capacity`; default menjalankan 50 dan 100. Stress eksplisit di PowerShell: `$env:CAPACITY_LEVELS='300,500'; npm run test:capacity`. Database dan JSON mentah berada di `.local/capacity` dan tidak masuk Git. Jika stress dijalankan lagi, tetapkan batas waktu dan keluarkan progres per fase agar kegagalan dapat dilokalisasi.

## Batas yang masih menjadi gerbang rilis

Ulangi pada spesifikasi VPS yang benar-benar dibeli, melalui HTTPS/Dokploy, dengan beberapa klien pembangkit beban. Campurkan login, retry/dua tab, impor, pembaca ranking, worker timeout, backup dan kondisi disk realistis. Profil payment baru dapat ditambahkan setelah PAY-003 ada. Ini validasi deployment dari kapasitas yang sudah diuji lokal, bukan alasan membuat DISC-001 menunggu lagi.
