# PAY-001 — QRIS merchant manual versus Midtrans individu

Diperiksa 2026-09-11. Kajian dokumentasi selesai; persetujuan merchant produk tryout belum diperoleh. PAY-002 tetap terbuka. QRIS merchant yang diverifikasi penyedia berbeda dari QR transfer rekening pribadi. Kandidat manual konkret di sini adalah GoPay Merchant; ketentuannya tidak digeneralisasi ke semua penyedia QRIS.

| Aspek | GoPay Merchant, verifikasi order manual | Midtrans individu, gateway |
|---|---|---|
| Dokumen | Halaman syarat menyebut nomor aktif, KTP pemilik, identitas/alamat/jenis usaha dan rekening aktif; NIB tidak tercantum di daftar dasar tersebut | Daftar individu menyebut KTP dan NPWP; dokumen badan usaha berbeda dan mencakup legalitas usaha |
| Persetujuan | Kelayakan usaha tryout digital dan kategori merchant harus diperiksa saat onboarding | Akun individu bukan jaminan semua metode pembayaran atau produk langsung disetujui |
| Biaya transaksi | UMI: 0% untuk transaksi sampai Rp500.000, 0,3% di atasnya; kategori reguler lain umumnya 0,7%, sesuai klasifikasi yang disetujui | Harga QRIS reguler publik 0,7%, belum termasuk pajak yang berlaku; tarif khusus perlu konfirmasi |
| Biaya tetap | Konfirmasi biaya layanan/pencairan pada akun dan bank yang dipilih; waktu admin merupakan biaya operasional | Harga publik menyatakan tanpa biaya setup/langganan/integrasi; dikenai biaya transaksi sukses |
| Pencocokan order | Admin mencocokkan transaksi masuk di aplikasi merchant, nominal dan referensi dengan pesanan | Order/transaksi ditautkan melalui API dan notifikasi server |
| API/webhook | Dukungan otomatis belum terverifikasi sebagai bagian dari layanan merchant dasar yang dikaji; rencanakan manual | Core API/Snap dan HTTP notification tersedia; integrasi dan uji keamanan tetap diperlukan |

Sumber syarat: [GoPay Merchant](https://gopay.co.id/bantuan-merchant/qris-merchant/syarat-mendaftar-qris), [dokumen Midtrans](https://docs.midtrans.com/docs/apa-saja-dokumen-legalitas-yang-diperlukan-untuk-registrasi-akun-midtrans). Tidak adanya NIB pada daftar dasar penyedia bukan keputusan bahwa usaha ini bebas kewajiban legalitas; LEGAL-001 tetap terbuka.

Sumber biaya: [GoPay Merchant MDR](https://gopay.co.id/bantuan-merchant/qris-merchant/berapa-potongan-biaya-qris), [BI QRIS](https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/qris/default.aspx), [harga Midtrans](https://midtrans.com/pricing), [QRIS Midtrans](https://docs.midtrans.com/docs/berapa-biaya-transaksi-untuk-qris-1). Individu tidak otomatis UMI, dan produk tryout tidak otomatis mendapat tarif pendidikan.

Contoh aritmetika sebelum pajak/biaya tambahan: transaksi Rp50.000 pada UMI yang memenuhi syarat memiliki MDR Rp0, sedangkan tarif 0,7% menghasilkan Rp350. Untuk Rp600.000, tarif 0,3% menghasilkan Rp1.800 dan 0,7% Rp4.200. Ini simulasi tarif, bukan penawaran akun pengguna.

## Settlement dan pencairan

GoPay Merchant membedakan tujuan pencairan: GoPay/Tabungan Usaha Jago dapat per jam dengan pengecualian jam tertentu; bank rekanan mengikuti jadwal pada hari yang sama, nonrekanan dapat hari berikutnya/hari kerja berikutnya. Minimum dan jadwal rekening harus dicek; jangan menjanjikan semua bank langsung cair. [Mekanisme pencairan](https://gopay.co.id/bantuan-merchant/pencairan-keuangan/mekanisme-pencairan-saldo-ke-rekening-bank).

Midtrans pusat bantuan umum menyebut dana dapat diminta dicairkan setelah settlement tiga hari kerja. Dokumentasi QRIS statis menyebut dua hari kerja; karena cakupan berbeda, jadwal final QRIS dinamis pada akun harus dikonfirmasi, bukan memilih angka tercepat. Status pembayaran sukses untuk akses peserta berbeda dari dana sudah masuk bank merchant. [Pencairan umum](https://docs.midtrans.com/docs/kapan-saya-menerima-dana-transaksi-dari-midtrans), [QRIS statis](https://docs.midtrans.com/docs/pengenalan-qris-statis).

## Refund

GoPay Merchant mendokumentasikan refund penuh/sebagian lewat aplikasi dalam 96 jam, memerlukan saldo cukup dan pengembalian ke sumber dana asal; proses pelanggan dapat sampai 14 hari kerja. Di luar jendela, penyelesaian langsung dengan pelanggan diperlukan sesuai prosedur penyedia. Biaya refund pada akun terpilih belum dikonfirmasi. [Pengajuan refund](https://gopay.co.id/bantuan-merchant/pembayaran-qris/pengajuan-pengembalian-saldo-pelanggan).

Midtrans mendukung refund API untuk metode yang eligible; status, saldo dan aktivasi fitur harus memenuhi ketentuan. Referensi standard refund membedakan QRIS GoPay ONUS 45 hari dan OFFUS tujuh hari, serta QRIS ShopeePay 365 hari. Batas pengajuan berbeda dari waktu dana kembali. Jangan menyalin kebijakan refund e-wallet GoPay ke semua QRIS atau menganggap biaya transaksi selalu dikembalikan. Biaya, SLA dan acquirer akun harus dikonfirmasi. [Refund API](https://docs.midtrans.com/reference/refund-transaction), [dukungan dan SLA per metode](https://docs.midtrans.com/docs/what-payment-method-that-have-refund-feature).

## Kontrak implementasi PAY-003

Untuk manual: jangan membuka akses dari screenshot pelanggan saja. Verifikasikan transaksi merchant asli; satu referensi pembayaran hanya boleh membayar satu pesanan, nominal cocok, keputusan admin diaudit dan pemberian akses atomik. Tentukan jam layanan, waktu verifikasi, transaksi tanpa identitas cocok, kedaluwarsa pesanan, kelebihan/kekurangan bayar dan refund sebelum checkout dipublikasikan.

Untuk gateway: verifikasi signature notifikasi di server dan gunakan status API ketika diperlukan; cocokkan order, nominal, mata uang dan transaksi. Deduplikasi event, tolak transisi status lama yang tidak valid, berikan akses sekali dalam transaksi SQLite pendek. Redirect browser bukan bukti bayar. Uji duplikasi, urutan terbalik, nominal salah, pending/expire/cancel, timeout, rekonsiliasi dan refund. [Notifikasi Midtrans](https://docs.midtrans.com/docs/https-notification-webhooks), [QRIS API](https://docs.midtrans.com/docs/introduction-qris-payment).

Rekomendasi: prioritaskan Midtrans individu untuk akses otomatis jika produk dan akun disetujui; biaya tetap nol tidak berarti biaya transaksi nol. QRIS merchant manual masuk akal untuk pilot berbayar kecil jika ada petugas dan jam layanan. Angka 2.000 sesi/hari bukan 2.000 pembayaran. Sebagai ilustrasi internal, 100 pesanan × dua menit pemeriksaan = 200 menit kerja/hari; ukur jumlah pesanan sebelum memilih manual.

## Gerbang keputusan

PAY-001: Done untuk kajian perbandingan dokumentasi. PAY-002 belum memilih penyedia/alur. Sebelum PAY-003 produksi: konfirmasi penerimaan tryout digital, dokumen akun, kategori MDR/pajak, jadwal pencairan, biaya/jendela/SLA refund dan akses API produksi. Jika manual dipilih, tetapkan petugas, jam layanan dan target verifikasi. PAY-004 sudah menyediakan schema; tidak ada checkout, webhook produksi, merchant atau transaksi nyata diaktifkan oleh kajian ini.
