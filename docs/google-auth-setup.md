# Pendaftaran Google melalui Better Auth

Peserta memilih Lanjutkan dengan Google di /login. Pengunjung baru dibuatkan akun peserta dan masuk /dashboard; pengguna lama masuk melalui /account sesuai perannya. Hak admin hanya dari admin_users. Pendaftaran email/password tetap ditutup, sedangkan akun password lama masih dapat login melalui bagian yang dapat dibuka di halaman login.

## Konfigurasi yang masih diperlukan

1. Buat OAuth client bertipe **Web application** di Google Cloud Console / Google Auth Platform. Lengkapi konfigurasi aplikasi dan audience. Saat aplikasi Google masih Testing, tambahkan akun yang akan menguji sebagai test user.
2. Untuk lokal, Authorized JavaScript origin: `http://localhost:5173`. Authorized redirect URI: **`http://localhost:5173/api/auth/callback/google`**. Jangan mencampur localhost dengan 127.0.0.1.
3. Isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di `.env` lokal. BETTER_AUTH_URL dan ORIGIN harus sama dengan origin aplikasi. Restart server setelah mengubah konfigurasi. Client Secret tidak boleh ditempel di chat, masuk browser bundle atau GitHub.
4. Untuk Dokploy, masukkan variabel melalui environment service. Tambahkan callback produksi `https://DOMAIN-ANDA/api/auth/callback/google` pada client Google dan gunakan origin HTTPS yang sama.
5. Uji akun Google baru → dashboard, logout → login ulang akun sama, pembatalan OAuth → pesan gagal, dan penolakan akun peserta saat membuka /admin/questions.

UI menonaktifkan tombol Google ketika credential belum tersedia; tidak membuat akun contoh Google. Secret tidak dikirim ke halaman. Alur OAuth memakai Better Auth; aplikasi tidak membuat implementasi token Google sendiri. Google meminta identitas dasar untuk login, bukan akses Gmail/Drive.

Validasi otomatis memeriksa pembuatan URL otorisasi menggunakan credential fiktif tanpa menghubungi Google. Callback nyata, consent dan akun Google baru harus diuji setelah credential sungguhan tersedia. Browser tertanam dapat dibatasi oleh kebijakan Google; gunakan Chrome/Edge/Safari biasa untuk uji OAuth nyata bila diperlukan.

Sumber konfigurasi: [Better Auth Google](https://better-auth.com/docs/authentication/google).
