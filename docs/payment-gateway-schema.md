# Persiapan skema pembayaran

Status: schema SQLite dan migrasi tersedia; belum ada checkout, pemanggilan gateway, webhook publik, refund atau aktivasi akses. Provider belum dipilih. Paket latihan gratis pada fondasi ujian terpisah dari produk berbayar; jangan membuka produk berbayar sebelum pemeriksaan hak akses di mesin ujian selesai.

## Relasi

`products → product_packages → exam_packages`

`user → orders → order_packages → access_grants`

`orders → payments → payment_events / refunds`

- **products**: harga integer rupiah, lama akses dan status aktif. Satu produk bisa memberi akses ke beberapa edisi paket.
- **orders**: pemilik, snapshot nama/harga/durasi akses, status, batas bayar dan kunci retry. **order_packages** membekukan daftar edisi yang dibeli. Perubahan produk tidak mengubah pembelian lama.
- **payments**: satu pesanan dapat memiliki beberapa percobaan bayar. Identitas transaksi unik per provider, lingkungan sandbox/production dan merchant. ID transaksi boleh belum tersedia ketika permintaan gateway sedang dibuat.
- **payment_events**: deduplikasi event, hash payload, hasil verifikasi, status pemrosesan dan retry. Tidak menyimpan kartu, CVV, API key atau seluruh body webhook. Event yang belum terverifikasi tidak boleh berstatus processed.
- **access_grants**: satu pemberian akses per item pesanan; pemilik diambil dari pesanan, bukan ID yang dikirim browser. Masa berlaku dan pencabutan terpisah dari status transaksi.
- **refunds**: riwayat refund sebagian/penuh, nominal, alasan, aktor dan kunci retry. Catatan pembayaran tidak dihapus.

## Kontrak layanan yang harus diimplementasikan

1. Checkout menghitung harga dari database server, membekukan paket dan lama akses, serta menyimpan request hash. UNIQUE(user_id, idempotency_key) menahan double checkout; kunci sama dengan isi berbeda ditolak.
2. Buat record payment terlebih dahulu, lalu panggil adapter provider **di luar transaksi SQLite**. Simpan external ID setelah respons. Jika respons tidak pasti, lakukan rekonsiliasi dengan kunci yang sama, bukan membuat pembayaran baru otomatis.
3. Webhook diverifikasi sesuai kontrak provider memakai raw body/signature yang benar. Cocokkan merchant, lingkungan, external ID, pesanan, mata uang dan nominal. Redirect sukses browser dan unggahan bukti tidak boleh mengaktifkan akses.
4. Dalam satu transaksi pendek: deduplikasi event terverifikasi, ubah payment/order menjadi sukses, insert grant per order_package sekali, dan tulis audit. Retry event tidak memperpanjang masa akses atau membuat grant tambahan.
5. Event pending/expired yang terlambat tidak boleh menurunkan pembayaran sukses. Pembayaran masuk setelah expiry/cancel, nominal salah atau dua percobaan yang sama-sama sukses masuk review_required untuk rekonsiliasi; jangan diam-diam menghapus uang masuk atau membuka akses dua kali.
6. Hak ujian diperiksa di server dari grant aktif milik pengguna (tanggal mulai/akhir dan revoked_at), bukan sekadar order.paid. Satukan aturan ini untuk manual dan gateway. Grant dari satu order dicabut tanpa membatalkan grant sah dari order lain.
7. Refund memeriksa total refund succeeded + pending agar tidak melebihi nominal payment. Nominal dan relasi lintas tabel, transisi status, aturan pencabutan akses, serta audit harus diperiksa layanan dalam transaksi; CHECK/UNIQUE schema saja tidak menegakkan seluruh aturan bisnis tersebut.
8. Tambahkan job rekonsiliasi transaksi pending dan retry event gagal. Event body yang tidak disimpan diambil ulang melalui API provider dengan external ID; detail adapter ditentukan setelah provider dipilih.

## Gateway dan manual

Adapter menyediakan createPayment, verifyWebhook, fetchPaymentStatus dan requestRefund. Nama provider berupa kode konfigurasi, tanpa ketergantungan SDK di schema. MerchantAccount hanya identitas konfigurasi, bukan secret. Verifikasi manual kelak memakai provider `manual`, aktor admin, referensi transfer, nominal dan audit; bukti unggahan disimpan privat di object storage dengan kebijakan retensi terpisah.

## Kriteria sebelum transaksi nyata

Uji sandbox: signature palsu, event duplikat/terbalik, nominal salah, pengguna lain, expiry, timeout gateway, double payment, refund sebagian, double refund dan pencabutan akses. Setelah provider dipilih, lengkapi pemetaan status, callback, kredensial server, kebijakan masa akses/refund, jadwal rekonsiliasi serta pengujian ujian berbayar. Pembayaran tetap belum aktif sampai tahap tersebut selesai.
