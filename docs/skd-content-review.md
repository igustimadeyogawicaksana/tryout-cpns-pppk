# Edisi perbaikan isi SKD — lokal

Paket: **Latihan SKD CPNS — Edisi Perbaikan Isi (110 Soal)**. Gunakan paket ini dari katalog untuk percobaan baru; sesi paket lama tetap memakai data lamanya. Arsip paket lama dapat ditelusuri pengelola, tetapi hasil trial bermasalah tidak layak dipakai sebagai pembanding.

| Subtes | Isi |
|---|---|
| TWK | 30: nasionalisme, integritas, bela negara, pilar negara, bahasa negara (6 per tema) |
| TIU | 35: numerik 15, verbal/logika 10, figural berbasis simbol 10 |
| TKP | 45: pelayanan publik 8, jejaring kerja 8, sosial budaya 8, TIK 7, profesionalisme 7, anti-radikalisme 7 |

Struktur menggunakan baseline [KepmenPANRB 321/2024 yang dihosting BKN](https://www.bkn.go.id/storage/2024/08/2024kepmenpanrb321-Nilai-Ambang-Batas.pdf). Butir dan penjelasan disusun khusus untuk latihan lokal; bukan kutipan bank soal resmi atau penetapan kisi-kisi 2027. Kesulitan belum dikalibrasi. Semua bobot TKP adalah penilaian latihan yang masih perlu review manusia.

## Pemeliharaan

Jalankan `node scripts/replace-trial-question-content.mjs` untuk validasi tanpa menulis database. Tambahkan `--apply` untuk memasang revisi baru dengan backup dan audit. Script membaca DATABASE_PATH dari environment/.env dan menolak database yang belum ada. Data lokal dan cadangan tidak diunggah ke GitHub.

Jangan mengubah JSON `exam_items` saja: layar dan penilaian menggunakan `exam_options`. Perubahan materi harus membuat edisi baru melalui service agar seluruh pilihan, kunci, dan bobot konsisten. Jangan menimpa paket yang sudah memiliki sesi; instalasi mempertahankan riwayat lama dan tidak memindahkan grant pembayaran atau cohort ranking.

## Pemeriksaan editorial sebelum penggunaan publik

- Tinjau relevansi setiap butir dan alternatif jawaban, bukan hanya bentuk JSON.
- Periksa apakah soal pilihan tunggal memiliki tepat satu jawaban yang dapat dipertahankan.
- Periksa urutan bobot dan alasan setiap opsi TKP; tidak mengklaim bobot resmi.
- Tinjau variasi tingkat kesulitan dan kemiripan substansi. Normalisasi nomor mencegah trik duplikasi lama, tetapi bukan pemeriksa semantik menyeluruh.
- Periksa keterbacaan simbol figural pada perangkat sasaran. Edisi ini memakai simbol teks, belum berupa aset gambar kompleks.

Tes otomatis memeriksa 110 butir/550 opsi dan jalur jawaban sampai hasil. Kelulusan tes aplikasi tidak menggantikan pemeriksaan editorial tersebut.
