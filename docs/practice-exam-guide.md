# Paket dan latihan peserta

## Cara mencoba

1. Login pengelola, buka **Bank soal**, lengkapi soal dan jalankan review sampai status **Terbit**. Soal draft hasil unggahan API belum muncul di pemilih paket.
2. Buka **Paket tryout**, pilih CPNS atau PPPK, isi judul, tahun target, sumber acuan dan durasi. PPPK memerlukan formasi yang sesuai dengan soal.
3. Isi kuota tiap subtes sesuai jumlah soal yang dipilih. Simpan draft, periksa ringkasan, lalu pilih **Terbitkan latihan gratis**.
4. Peserta membuka `/paket`, memilih paket, kemudian login. Akun email perlu verifikasi sebelum memulai. Jika login dimulai dari detail paket, buka kembali paket dari katalog setelah login.
5. Pilih jawaban; tunggu tanda tersimpan. Nomor soal menunjukkan jawaban terisi. Jika koneksi gagal, gunakan **Coba simpan lagi** atau muat ulang untuk mengambil jawaban server.
6. Konfirmasi selesai untuk melihat skor per subtes dan pembahasan. Dashboard menampilkan nama peserta, sesi yang dapat dilanjutkan, serta hasil latihan.

## Perilaku edisi awal

- Semua paket pada alur ini adalah latihan gratis. Tidak ada checkout atau aktivasi hak akses berbayar; skema payment tetap persiapan terpisah.
- Satu akun mempunyai satu sesi per edisi paket. Membuka kembali paket melanjutkan sesi atau membuka hasil yang sudah selesai. Belum ada retake atau ranking kompetitif.
- Isi, urutan, opsi dan nilai disalin saat draft paket dibuat. Perubahan bank soal tidak mengubah paket/sesi lama. Untuk koreksi paket, buat edisi baru; pengarsipan paket belum tersedia di UI.
- Jumlah soal dan durasi diatur pengelola. Batas teknis saat ini 200 soal dan 240 menit; ini bukan pernyataan jumlah/durasi resmi CPNS atau PPPK. Target 2027 tidak otomatis berarti kurikulumnya telah disahkan atau diverifikasi.
- Server memegang deadline dan skor. Refresh tidak menambah waktu. Jawaban yang baru diterima setelah deadline ditolak. Worker memeriksa maksimum 100 sesi kedaluwarsa setiap 15 detik; membuka sesi juga memeriksa deadline. Saat aplikasi mati, penilaian dilanjutkan setelah server hidup, memakai jawaban tersimpan dan deadline semula.
- Browser tidak menerima kunci, nilai opsi atau pembahasan sebelum sesi selesai. Akses sesi dibatasi pemilik. Penyimpanan memakai nomor revisi untuk mencegah tab lain menimpa jawaban tanpa diketahui.
- UI menggunakan tata letak responsif; pengujian perangkat fisik dan matriks browser belum lengkap. Tidak ada klaim kapasitas pengguna serentak sebelum uji beban.

## Verifikasi pengembangan

`npm test` menguji transaksi SQLite, kuota, salinan soal tetap, pemilik sesi, email terverifikasi, skor benar/kosong, benturan revisi, submit berulang dan deadline dengan waktu terkontrol.

`npm run build` lalu `npm run test:http` menjalankan database sementara: admin membuat/menerbitkan paket, peserta mulai/lanjut, simpan jawaban, hasil dan riwayat; termasuk penolakan akses akun lain, CSRF, payload tidak valid dan kebocoran kunci sebelum selesai. Database operasional tidak diisi paket contoh atau dipublikasikan oleh tes.
