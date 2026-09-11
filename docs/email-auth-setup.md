# Email/password dan Google

Halaman /login memiliki pilihan Google dengan logo, login email/password, serta tautan daftar, lupa password dan kirim ulang verifikasi. Pendaftaran email membutuhkan nama, password 12–128 karakter dan konfirmasi password. Better Auth menyimpan hash password; akun baru tidak otomatis memperoleh sesi atau hak admin.

Peserta boleh login sebelum email terverifikasi untuk melihat dashboard dan meminta tautan lagi. Dashboard menampilkan pengingat, dan service mulai ujian menolak peserta yang emailnya belum terverifikasi. Akun admin lama tetap dapat digunakan. Verifikasi Google mengikuti identitas yang diverifikasi provider; pendaftaran tidak menulis admin_users.

## Lokal

`npm run dev` memakai outbox privat `.local/mail/*.json`. Pesan tidak dikirim ke alamat sungguhan. Buka berkas terbaru, lalu buka nilai `url` di browser untuk mencoba verifikasi atau reset. Tautan ini rahasia: jangan unggah ke Git atau bagikan. Folder .local sudah diabaikan Git. UI memberitahu bahwa ini mode lokal.

## Produksi Dokploy

Atur SMTP_HOST, SMTP_PORT (587 untuk STARTTLS atau 465 TLS), SMTP_USER, SMTP_PASSWORD, MAIL_FROM dan origin HTTPS. Server tidak menyediakan signup password ketika konfigurasi SMTP belum lengkap. Login akun lama/Google tetap tersedia. Kredensial SMTP tidak dikirim ke browser. Pastikan domain pengirim diizinkan layanan email dan uji pengiriman, penolakan, expiry tautan serta pengiriman ulang sebelum rilis. Jangan set AUTH_MAIL_MODE/AUTH_MAIL_TEST_DIR di produksi; keduanya hanya untuk fixture HTTP di loopback.

Reset password memakai token Better Auth dan mencabut sesi lama setelah sukses. Form reset menolak konfirmasi berbeda; backend menegakkan panjang password dan validitas token. Permintaan reset/resend menampilkan pesan generik agar tidak mengungkap keberadaan email. Tidak ada penggabungan akun custom; perilaku penautan mengikuti Better Auth dan tetap perlu uji akun Google dengan email yang sama sebelum rilis.

Sumber API: [Better Auth email/password](https://better-auth.com/docs/authentication/email-password).
## Password dan akun Google

Centang **Tampilkan password** tersedia pada kolom password dan konfirmasi. Setelah pendaftaran diproses, gunakan **Lanjut ke login**. Akun email baru boleh login sebelum verifikasi; memulai ujian tetap membutuhkan email terverifikasi.

Mendaftar ulang dengan email yang sudah digunakan Google tidak membuat password. Masuk dengan Google, buka dashboard lalu isi **Buat password**. Jika sesi sudah terlalu lama, keluar dan login Google kembali. Pengaturan ini memakai Better Auth dan tidak mengganti password yang sudah ada; gunakan pemulihan untuk password yang terlupa.
