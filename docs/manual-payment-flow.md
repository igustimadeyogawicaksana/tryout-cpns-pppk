# Alur pembayaran manual MVP

Pembayaran MVP memakai transfer bank atau QRIS merchant/pribadi yang diverifikasi pengelola. Integrasi gateway otomatis belum diaktifkan.

## Alur peserta

1. Peserta memilih produk dan membuat pesanan. Harga, judul produk, masa akses, dan paket yang dibeli disalin ke `orders` dan `order_packages`.
2. Sistem membuat satu `payments` dengan `provider=manual`, `environment=production`, status `pending`, nominal yang sama dengan pesanan, serta kunci idempotensi.
3. Halaman pembayaran menampilkan nomor pesanan, nominal, rekening/QRIS dari konfigurasi publik, batas pembayaran, dan instruksi pengiriman bukti.
4. Peserta mengirim nominal transfer, waktu transfer, nama pengirim, dan referensi transaksi. Data masuk sebagai `payment_events` dengan status `received`; sistem tidak membuka akses otomatis.
5. Peserta dapat mengirim ulang bukti dengan event key berbeda. Event yang sama tidak boleh diproses dua kali.

## Alur pengelola

1. Pengelola memeriksa mutasi rekening atau dashboard QRIS dan mencocokkan nominal, waktu, referensi, serta pemesan.
2. Jika cocok, pengelola memproses event menjadi `verified=true`, mengubah `payments.status` dan `orders.status` menjadi `succeeded`/`paid`, lalu membuat satu `access_grants` untuk setiap `order_packages`.
3. Jika tidak cocok, event diberi status `failed` atau `ignored` dengan alasan audit. Akses tidak diberikan.
4. Refund memakai tabel `refunds`; pencabutan akses menyimpan `revoked_at` dan `revoke_reason`.

## Kontrak yang disiapkan untuk gateway

Adapter otomatis nanti cukup mengisi `provider`, `merchant_account`, `external_id`, `idempotency_key`, dan event terverifikasi pada tabel yang sama. Webhook harus menyimpan payload hash dan event key sebelum memproses status. Dengan begitu migrasi dari manual ke Midtrans atau provider lain tidak mengubah kepemilikan paket, riwayat pesanan, atau tabel akses.

Konfigurasi yang perlu disediakan sebelum UI pembayaran diaktifkan:

- `PAYMENT_MODE=manual`
- `PAYMENT_DISPLAY_NAME`
- `PAYMENT_BANK_NAME`, `PAYMENT_BANK_ACCOUNT`, `PAYMENT_BANK_HOLDER`
- `PAYMENT_QRIS_IMAGE_URL` (opsional)
- `PAYMENT_INSTRUCTION_EXPIRES_MINUTES`

Jangan menyimpan secret gateway, token webhook, atau kredensial rekening di database maupun Git.
