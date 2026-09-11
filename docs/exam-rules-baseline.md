# PROD-001 — Acuan ujian dan batas produk

Pemeriksaan 2026-09-11. Acuan CPNS terbaru yang berhasil diverifikasi dalam kajian ini adalah TA 2024. Ini tidak membuktikan tidak ada pengumuman lain setelahnya. Target belajar 2027 tidak sama dengan aturan resmi 2027; aturan 2027 belum berhasil diverifikasi. Label produk harus menyebut tahun acuan dan status sementara.

## SKD CPNS

Baseline TA 2024: 110 soal, terdiri atas TWK 30, TIU 35 dan TKP 45. Durasi umum 100 menit; ketentuan 130 menit berlaku untuk pelamar penyandang disabilitas sensorik netra pada kebutuhan khusus penyandang disabilitas. TWK/TIU benar 5, salah atau kosong 0; TKP pilihan bernilai 1–5, kosong 0. Maksimum TWK 150, TIU 175, TKP 225, total 550. Ambang umum masing-masing 65, 80 dan 166; jangan memakai ambang umum untuk seluruh kategori khusus. [KepmenPANRB 321/2024, BKN](https://www.bkn.go.id/storage/2024/08/2024kepmenpanrb321-Nilai-Ambang-Batas.pdf).

Dengan demikian 100 menit masih cocok untuk profil umum acuan 2024, tetapi 100 soal bukan jumlah SKD penuh acuan tersebut. Jumlah dan durasi jangan disatukan sebagai satu konstanta untuk semua jenis ujian. Pelaksanaan 110 soal/100 menit juga dikonfirmasi oleh [Sekretariat Negara, SKD 2024 bersama BKN](https://www.setneg.go.id/baca/index/kemensetneg_bersama_bkn_menyelenggarakan_skd_cpns_kemensetneg_tahun_2024).

Materi TWK meliputi nasionalisme, integritas, bela negara, pilar negara dan bahasa negara; TIU verbal, numerik dan figural; TKP pelayanan publik, jejaring kerja, sosial budaya, teknologi informasi dan komunikasi, profesionalisme serta anti-radikalisme. Editor harus menautkan butir ke materi dan sumber per versi, bukan hanya tahun target. Acuan materi mengikuti Kepmen 321/2024 di atas; belum disebut kisi-kisi resmi 2027.

Kategori khusus dan akomodasi perlu preset tersendiri dengan kutipan pasal sebelum publikasi. Lolos ambang pada latihan bukan kelulusan seleksi atau jaminan mengikuti SKB. Pengumuman sekolah kedinasan merupakan jalur berbeda dan tidak boleh menggantikan acuan CPNS hanya karena tahunnya lebih baru.

## SKB CPNS dan PPPK

Peraturan BKN 11/2019 Pasal 9 mengatur SKB CAT 90 menit, dengan 100 soal untuk materi yang tidak dominan berhitung atau 80 soal untuk materi yang dominan berhitung. Pilihan harus mengikuti jabatan/materi resmi, bukan dipilih sembarang oleh paket. [Peraturan BKN 11/2019](https://www.bkn.go.id/wp-content/uploads/2019/07/PERATURAN-BKN-NO.-11-TAHUN-2019-SKB-CAT-BKN.pdf), [katalog JDIH BKN](https://jdih.bkn.go.id/P_bkn/index/130).

Bobot SKB CAT terhadap tes tambahan bergantung instansi/jabatan. Contoh BKN TA 2024 menetapkan CAT 75% dan praktik 25% pada jabatan tertentu, serta CAT 100% pada jabatan lainnya. Ini bukan bobot universal semua instansi. [Pengumuman BKN TA 2024, bagian SKB](https://www.bkn.go.id/wp-content/uploads/2024/11/00.-Pengumuman-Hasil-SKD-dan-Jadwal-SKBT-CPNS-BKN-TA-2024.pdf).

Belum ditetapkan preset skor per butir SKB universal atau akomodasi khusus SKB dari sumber yang diperiksa. Sebelum menerbitkan simulasi SKB, lampirkan sumber jabatan/instansi/tahun, bobot CAT dan tes tambahan, normalisasi dan aturan integrasi hasil. Jangan otomatis menyalin skor/ambang TWK, TIU atau TKP ke SKB. Perhitungan hasil gabungan SKD/SKB belum menjadi kemampuan aplikasi saat ini. PPPK memerlukan blueprint terpisah per seleksi/formasi; angka SKD tidak berlaku otomatis.

## Keputusan scope MVP: trial, latihan, kompetisi

Aturan produk berikut menjadi rujukan pekerjaan berikutnya dan menggantikan konflik pada rancangan awal; bukan aturan ranking BKN.

| Jenis paket | Pembahasan | Ranking |
|---|---|---|
| Trial/latihan pendek | Setelah sesi dinilai; tidak dibuka sebelum submit/timeout | Tidak masuk kompetisi |
| Simulasi penuh latihan mandiri | Setelah selesai, mengikuti hak akses paket | Tidak dicampurkan dengan kompetisi |
| Kompetisi MVP | Ditahan hingga periode berakhir, termasuk bagi yang sudah submit | Satu percobaan per peserta/periode, paket dan blueprint identik |

Ranking dasar umum dan provinsi tetap masuk MVP. Pakai total skor, posisi seri 1/2/2/4, alias dan opt-out; jangan menyebutnya ranking seleksi resmi. Jangan membandingkan paket dengan soal, versi, durasi atau skala skor berbeda. Trial yang pembahasannya sudah tersedia tidak dikonversi menjadi kompetisi; gunakan edisi terpisah dengan konten yang tidak bocor. Snapshot/finalisasi ranking dan koreksi tetap backlog.

## Dampak wajib sebelum implementasi lanjutan

| Item | Kondisi yang diaudit | Perubahan berikutnya |
|---|---|---|
| EXAM-001 | Deadline memakai durationMinutes paket; form admin default 10 menit. Tidak ditemukan timer global 100 menit/100 soal | Gunakan preset 110/100 untuk SKD umum acuan 2024; durasi akomodasi eksplisit. Pertahankan timer server dan sesi lama; uji submit/timeout 110 soal |
| CONTENT-003 | Kuota dan durasi sudah configurable, tetapi belum ada blueprint resmi terstruktur | Tambah jenis trial/latihan/kompetisi, identitas blueprint immutable, tahun acuan terpisah target belajar, sumber, tanggal verifikasi, kuota dan validasi skor sebelum terbit; SKB perlu jabatan/instansi |
| RESULT-001 | Total/subskor tersedia; belum ada evaluasi ambang resmi per kategori | Maksimum 150/175/225, label ambang hanya bila preset tervalidasi; pembahasan sesuai mode; jangan menyebut lulus CPNS atau menghitung integrasi SKB tanpa model resmi |
| RANK-001 | Paket terbit yang belum dikerjakan dapat dijadikan kompetisi | Cegah trial/soal yang sudah terekspos masuk kompetisi; cohort mengikat versi blueprint dan kebijakan penilaian |

Batas 100 pada unggah API adalah ukuran batch, dan batch 100 worker adalah jumlah sesi kedaluwarsa. Keduanya bukan jumlah soal SKD dan tidak perlu diganti menjadi 110 karena aturan ujian. Paket dan sesi yang sudah ada tidak diubah retroaktif; perbaikan memakai blueprint/edisi baru.

Status PROD-001: In progress. Konflik scope dan baseline SKD selesai didokumentasikan; finalisasi SKB per jabatan serta acuan resmi tahun target masih terbuka. Publikasi berlabel aturan resmi 2027 ditahan sampai sumber tahun tersebut tersedia dan diperiksa. Dokumentasi ini belum menerapkan perubahan runtime.
