# Kajian database dan pembayaran

Tanggal pemeriksaan: 10 September 2026. Status: usulan, bukan penetapan stack.

Catatan terbaru: pengguna kemudian memilih satu SQLite lokal untuk seluruh MVP, Dokploy, Better Auth dan backup R2. Perbandingan di bawah tetap sebagai kajian historis; keputusan aktif ada di [daftar keputusan](decisions.md).

## Apakah PostgreSQL tambahan diperlukan?

Belum ada kebutuhan menambah PostgreSQL khusus pembayaran. Satu database relasional dapat menyimpan akun, soal, sesi, order, pembayaran, dan hak akses. Kebenaran pembayaran bergantung pada verifikasi server, transaksi atomik, pencegahan duplikasi, serta pencocokan transaksi; nama mesin database saja tidak menjaminnya.

| Opsi | Cocok bila | Hal yang harus dibuktikan |
|---|---|---|
| SQLite biasa | Aplikasi satu server dengan disk persisten, volume tulis terkontrol | Antrean penulisan, durasi transaksi, backup konsisten dan pemulihan; bukan file bersama lintas server |
| Cloudflare D1 | Hosting yang mendukung binding/API D1 | Batas layanan, antrean query, biaya operasi, kemampuan batch atomik; tidak dianggap identik dengan SQLite lokal |
| PostgreSQL | Banyak operasi tulis bersamaan, beberapa instance aplikasi, kebutuhan query/operasi lebih kompleks | Koneksi/pooling, biaya, backup dan pemeliharaan |

SQLite mengizinkan satu penulis pada satu waktu per file; workload yang banyak menulis bersamaan perlu mempertimbangkan database client/server. [Dokumentasi SQLite](https://www.sqlite.org/whentouse.html).

D1 memproses query satu per satu pada tiap database, dengan antrean yang dapat menjadi overloaded. Sejak 1 September 2026, kuota baca/tulis harian paket gratis diberlakukan: query gagal setelah kuota terlampaui sampai reset. Jadi klaim biaya mendekati nol dalam rancangan awal harus diuji. [Batas D1](https://developers.cloudflare.com/d1/platform/limits/), [perubahan D1](https://developers.cloudflare.com/changelog/product/d1/).

Yang lebih mungkin membebani database tryout adalah autosave jawaban. Ilustrasi, bukan hasil benchmark: 500 peserta menyimpan tiap 10 detik menghasilkan sekitar 50 permintaan simpan/detik; tiap permintaan bisa menulis lebih dari satu baris. Jumlah akun terdaftar tidak cukup untuk menentukan kapasitas.

Sebelum memilih: ukur skenario 50/200/500 peserta serentak (target uji sementara), simpan jawaban, submit serentak, dan pembayaran bersamaan. Catat p95 latensi, error/lock, jawaban hilang, operasi ganda, dan biaya. Pertimbangkan PostgreSQL sebagai database utama jika target gagal dipenuhi setelah optimasi; hindari dua database tanpa kebutuhan jelas.

## Apakah gateway pasti butuh NIB?

Tidak bisa digeneralisasi. Panduan Midtrans saat diperiksa mencantumkan KTP dan NPWP untuk individu domestik; NIB/SIUP/TDP tercantum untuk badan usaha. Ini bukan jaminan akun atau kanal QRIS tertentu disetujui. Konfirmasi kategori usaha tryout digital, dokumen tambahan, rekening pencairan, dan aktivasi QRIS sebelum integrasi. [Dokumen legalitas Midtrans](https://docs.midtrans.com/docs/apa-saja-dokumen-legalitas-yang-diperlukan-untuk-registrasi-akun-midtrans).

## Opsi pembayaran awal

| Opsi | Pengalaman peserta | Operasional | Status |
|---|---|---|---|
| QRIS merchant perorangan statis | Bayar nominal order lalu menunggu admin | Admin cocokkan transaksi di aplikasi/dashboard merchant | Kandidat MVP |
| Gateway untuk merchant individu | QRIS per order, dapat dikonfirmasi otomatis | Onboarding, integrasi server dan rekonsiliasi | Kandidat MVP jika disetujui |
| Transfer bank manual | Transfer lalu menunggu verifikasi | Pencocokan mutasi dan order manual | Alternatif cadangan; cek ketentuan rekening |

Istilah QRIS pribadi perlu diperjelas: untuk penjualan gunakan QRIS merchant atas usaha perorangan yang diterbitkan penyedia, bukan menganggap semua QR transfer personal adalah QRIS merchant. BI menjelaskan pendaftaran melalui PJP berizin dan verifikasi Merchant ID; syarat berbeda antar-PJP. [Panduan BI](https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/Pages/cara-membuat-qris.aspx).

GoPay Merchant mencantumkan nomor HP, KTP pemilik, informasi usaha, dan rekening bank pada daftar syarat QRIS. Ini kandidat untuk ditelusuri, bukan janji pasti tanpa NIB atau pasti tersedia API bagi website. [Syarat GoPay Merchant](https://gopay.co.id/bantuan-merchant/qris-merchant/syarat-mendaftar-qris).

QRIS statis tidak dengan sendirinya memberi webhook ke website. QRIS dinamis dan notifikasi pembayaran tersedia pada produk integrasi Midtrans; persetujuan akun dan kanal tetap perlu diperiksa. [QRIS Midtrans](https://docs.midtrans.com/docs/introduction-qris-payment).

## Alur manual yang diusulkan

1. Server membuat order dengan ID unik, harga yang disalin saat checkout, mata uang IDR, dan batas waktu.
2. Peserta melihat QRIS merchant, nominal, nama merchant, petunjuk bayar dari HP yang sama, dan estimasi verifikasi.
3. Konfirmasi/bukti dari peserta masuk antrean pemeriksaan. Upload tidak berarti sudah lunas.
4. Admin mencocokkan nominal, waktu, serta referensi penerimaan di dashboard/mutasi merchant. Nominal sama saja tidak cukup; kasus ambigu ditahan untuk pemeriksaan.
5. Satu transaksi penerimaan hanya boleh digunakan untuk satu pembayaran. Simpan referensi unik, pemeriksa, waktu dan alasan.
6. Perubahan menjadi paid dan pemberian akses dilakukan atomik dan aman diulang. Dua admin menekan verifikasi bersamaan tidak boleh memberi akses ganda.
7. Bayar terlambat, kurang/lebih, duplikat dan refund masuk proses penanganan dengan jejak audit. Order kedaluwarsa tidak berarti QRIS statis berhenti menerima uang.

Simpan nilai uang sebagai integer, bukan floating point. Simpan bukti di penyimpanan privat; database menyimpan referensinya. Tetapkan batas jenis/ukuran file, akses pemilik/admin, dan masa retensi sebelum peluncuran.

## Fondasi agar bisa berganti penyedia

Konsep data: order, order_items, payments, payment_events, entitlements dan audit_log. Pisahkan status pembayaran dari masa aktif akses. Jangan simpan credential pembayaran dalam Git.

Untuk gateway: validasi signature sesuai penyedia, cocokkan order/nominal/mata uang, konfirmasi status melalui API saat diperlukan, dan deduplikasi event. Redirect browser bukan bukti lunas. Tangani webhook terlambat/berulang/tidak urut dan rekonsiliasi pembayaran yang notifikasinya hilang. Verifikasi manual serta webhook harus memakai aturan aktivasi akses yang sama.

Rekomendasi sementara: telusuri kelayakan gateway individu dahulu; QRIS merchant manual tetap opsi awal jika onboarding atau integrasinya belum siap. Legalitas usaha, NIB dan kewajiban lain perlu ditelaah berdasarkan kegiatan usaha, terpisah dari pilihan database maupun diterimanya akun oleh penyedia.
