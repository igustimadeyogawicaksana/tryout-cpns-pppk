# Web Tryout CPNS & PPPK

**PRD · FSD · TSD · Desain · Development Plan**
Disusun oleh: yogawicaksana · September 2026 · Versi 1.0

---

## 1. Product Requirements Document (PRD)

### 1.1 Latar Belakang

Setiap tahun jutaan pelamar CPNS dan PPPK membutuhkan sarana latihan yang mendekati kondisi tes asli (Computer Assisted Test / CAT). Platform tryout online sudah menjadi kebutuhan standar, terbukti dari banyaknya pemain di pasar ini (AyoCPNS, Viracun, Privat Alfaiz, dan lainnya). Produk ini dibangun untuk masuk ke pasar tersebut dengan diferensiasi pada pengalaman pengguna, harga yang lebih ramah untuk peserta baru, dan gaya pembahasan soal yang lebih personal dan mudah dipahami.

### 1.2 Tujuan Produk

- Menyediakan simulasi tryout CPNS (SKD: TWK, TIU, TKP) dan PPPK (kompetensi teknis, manajerial, sosial kultural) yang mendekati sistem CAT asli.
- Membangun produk berbasis web (bukan aplikasi native) yang bisa diakses lancar dari semua device — HP, tablet, laptop, desktop — cukup lewat browser tanpa perlu install apapun.
- Membangun sumber pendapatan melalui penjualan paket tryout berbayar dengan pembayaran QRIS.
- Memanfaatkan audiens existing di TikTok, X, Threads, dan Instagram sebagai funnel akuisisi pengguna awal.
- Menjadi produk yang bisa berkembang jangka panjang (bukan sekadar proyek coba-coba), dengan fondasi teknis dan legal yang benar sejak awal.

### 1.3 Target Pengguna

| Segmen | Karakteristik | Kebutuhan Utama |
|---|---|---|
| Pelamar CPNS pemula | Baru pertama kali ikut seleksi, belum familiar sistem CAT | Simulasi realistis + pembahasan jelas, harga terjangkau |
| Pelamar berpengalaman | Sudah pernah gagal sebelumnya, cari peningkatan skor | Analisis kelemahan per subtes, drilling soal, ranking pembanding |
| Pelamar PPPK | Fokus pada kompetensi teknis sesuai formasi | Bank soal PPPK per bidang formasi |

### 1.4 Analisis Kompetitor

| Aspek | AyoCPNS | Viracun | Privat Alfaiz |
|---|---|---|---|
| Model harga | Paket besar Rp149rb–299rb, akses 1 tahun | Per-tryout kecil ±Rp15rb, bundling 3x Rp35rb | Diskon besar (52–75%), harga akhir Rp12rb–20rb |
| Fitur andalan | Video pembahasan, drilling soal custom, laporan perkembangan | Simulasi CAT, ranking nasional, grup diskusi | Materi + tryout bundling, sistem part/volume berseri |
| Strategi psikologis | Upsell jelas antar tier (Premium vs Platinum) | Harga murah untuk memancing coba dulu | Strikethrough diskon besar (FOMO) |
| Komunitas | Tidak terlihat menonjol | Grup diskusi CPNS | Tidak terlihat menonjol |

> Insight kunci: fitur ranking nasional/daerah sudah jadi standar minimum, bukan nilai tambah lagi. Grup komunitas (Telegram/WA) terbukti murah dibangun namun efektif menaikkan retensi. Sistem penomoran paket (Vol/Part) memudahkan bundling dan memberi kesan progres berkelanjutan.

### 1.5 Peluang Diferensiasi

- Pembahasan soal dalam format teks bergaya coret-coret/annotasi (seperti catatan tangan yang dicoret-coret di kertas), terasa lebih personal dan mudah dicerna dibanding pembahasan teks polos kompetitor (belum menggunakan video di tahap ini).
- UI/UX yang lebih modern dan mobile-first dibanding kompetitor yang cenderung generik.
- Harga masuk lebih rendah untuk paket pertama, guna mempercepat akuisisi pengguna awal.

### 1.6 Model Bisnis & Monetisasi

- Model utama: bayar per paket tryout (mengikuti pola pasar, lebih mudah dikonversi dibanding langganan di tahap awal).
- Opsi bundling beberapa paket dengan harga lebih murah per unit.
- Potensi lanjutan: kelas/bimbingan online, paket tambahan drilling soal.
- Pembayaran via QRIS — tahap awal QRIS statis pribadi, tahap scale-up migrasi ke payment gateway (Midtrans/Xendit/Tripay) yang mensyaratkan legalitas usaha.
- 1 tryout gratis untuk pengguna baru (free trial) — mengurangi friksi awal, membiarkan calon pembeli merasakan kualitas soal & simulasi CAT sebelum memutuskan bayar paket berbayar.

### 1.7 Metrik Keberhasilan (KPI)

| Metrik | Target Tahap MVP |
|---|---|
| Jumlah pengguna terdaftar | 500 pengguna dalam 3 bulan pertama |
| Conversion rate (visitor → pembeli) | Minimal 3–5% |
| Rata-rata paket dibeli per pengguna | 1.5 paket |
| Tingkat penyelesaian tryout (completion rate) | Di atas 70% |
| Repeat purchase | Minimal 20% pengguna beli paket kedua |

---

## 2. Functional Specification Document (FSD)

### 2.1 Ruang Lingkup Fitur

Fitur dikelompokkan menjadi tiga area: Pengguna (peserta tryout), Admin (pengelola konten & transaksi), dan Sistem (proses otomatis seperti penilaian dan payment).

### 2.2 Fitur Pengguna

**2.2.1 Akun & Onboarding**
- Registrasi & login (email / Google).
- Profil pengguna: nama, instansi tujuan, formasi (untuk PPPK).
- Riwayat tryout & skor tersimpan per akun.

**2.2.2 Free Trial**
- Setiap akun baru otomatis mendapat 1x akses tryout gratis (paket mini, jumlah soal lebih sedikit dari paket berbayar) setelah registrasi.
- Free trial mencakup pengalaman inti: simulasi timer, pengerjaan soal, skor otomatis — namun pembahasan detail & ranking nasional dikunci untuk mendorong upgrade ke paket berbayar.
- Free trial hanya berlaku 1 kali per akun (dibatasi berdasarkan email/nomor HP terverifikasi) untuk mencegah penyalahgunaan.

**2.2.3 Tryout & Ujian**
- Pilih paket tryout (CPNS SKD / PPPK) sesuai kepemilikan akses, termasuk paket free trial.
- Timer total per sesi 100 menit untuk 100 soal SKD (mengikuti standar CAT CPNS), dapat disesuaikan admin per paket untuk PPPK.
- Soal & opsi jawaban diacak setiap sesi baru.
- Fitur tandai soal untuk ditinjau ulang sebelum submit.
- Submit otomatis saat waktu habis.

**2.2.4 Hasil & Pembahasan**
- Skor keluar otomatis, dipecah per subtes (TWK/TIU/TKP atau kompetensi PPPK).
- Pembahasan tiap soal dalam format teks bergaya coret-coret/annotasi visual (belum menggunakan video di tahap ini).
- Analisis waktu pengerjaan per soal/subtes.
- Ranking nasional & daerah dibanding peserta lain.
- Grafik perkembangan skor dari beberapa kali tryout.

**2.2.5 Pembayaran**
- Checkout paket dengan pembayaran QRIS.
- Konfirmasi pembayaran otomatis (jika pakai payment gateway) atau manual (jika QRIS statis tahap awal).
- Riwayat transaksi & invoice per pengguna.

**2.2.6 Komunitas (opsional tahap 2)**
- Tautan grup diskusi (Telegram/WhatsApp) per pembelian paket.

### 2.3 Fitur Admin

| Modul | Fungsi |
|---|---|
| Manajemen Soal | Tambah/edit/hapus soal, atur bobot nilai, kategori subtes, kunci jawaban & pembahasan |
| Manajemen Paket | Buat paket tryout, atur harga, atur masa aktif akses, bundling paket |
| Manajemen Pengguna | Lihat daftar pengguna, riwayat aktivitas, blokir akun bermasalah |
| Manajemen Transaksi | Verifikasi pembayaran manual (jika perlu), lihat laporan penjualan |
| Statistik & Laporan | Dashboard ringkasan penjualan, jumlah peserta aktif, soal yang paling sering salah dijawab |

### 2.4 Alur Pengguna Utama (User Flow)

**2.4.1 Alur Pembelian & Pengerjaan Tryout**
1. Pengguna mendaftar/login.
2. Memilih paket tryout dari katalog.
3. Checkout & bayar via QRIS.
4. Setelah pembayaran terverifikasi, akses tryout terbuka di akun.
5. Pengguna memulai sesi tryout (timer berjalan).
6. Pengguna mengerjakan soal, dapat menandai untuk ditinjau.
7. Submit (manual atau otomatis saat waktu habis).
8. Sistem menghitung skor dan menampilkan hasil + pembahasan.
9. Skor tersimpan di riwayat, muncul di ranking.

### 2.5 Aspek Legal & Kepatuhan

- Terms of Service: aturan penggunaan layanan, hak & kewajiban pengguna.
- Privacy Policy: kebijakan penyimpanan data pribadi (nama, email, nomor HP, riwayat nilai), disiapkan mengacu UU Pelindungan Data Pribadi (UU PDP).
- Refund Policy: kebijakan pengembalian dana untuk produk digital (umumnya tidak ada refund setelah akses tryout dibuka).
- Disclaimer wajib: platform ini adalah simulasi latihan independen, bukan produk resmi BKN/Kemenpan-RB, dan tidak menjamin kelulusan seleksi.
- Soal yang digunakan merupakan hasil karya sendiri atau parafrase, untuk menghindari sengketa hak cipta dengan bank soal berbayar lain.
- Legalitas usaha (NIB) disiapkan pada tahap scale-up, saat migrasi ke payment gateway resmi (Midtrans/Xendit/Tripay).

---

## 3. Technical Specification Document (TSD)

### 3.1 Ringkasan Arsitektur

Arsitektur berbasis web application standar: frontend terpisah dari backend melalui REST/GraphQL API, dengan database relasional untuk data transaksional (soal, user, transaksi) yang membutuhkan konsistensi tinggi. Seluruh layer digabung dalam satu deployment Cloudflare Workers (frontend SvelteKit + backend Hono) agar infra bisa jalan dengan biaya mendekati Rp0 di tahap awal.

### 3.2 Rekomendasi Tech Stack

| Layer | Rekomendasi | Catatan |
|---|---|---|
| Frontend | SvelteKit (dengan Vite), adapter-cloudflare | Bundle ringan, cocok dideploy langsung ke Cloudflare Workers, tetap mobile-first & SEO-friendly |
| Runtime & package manager | Bun | Install & build jauh lebih cepat dari npm/yarn, dukungan native TypeScript |
| Backend | Hono (berjalan di atas Cloudflare Workers) | Framework super ringan, didesain khusus untuk edge runtime seperti Workers |
| ORM & Database | Drizzle ORM + Cloudflare D1 (SQLite) | Query type-safe, migrasi schema rapi, D1 gratis di tier awal |
| Autentikasi | Auth custom ringan (email/password + Google OAuth) di atas Hono + D1 | Hindari layanan auth berbayar pihak ketiga; cukup untuk skala awal |
| Payment | QRIS statis (tahap awal) → Midtrans/Xendit/Tripay (tahap scale-up) | Gateway resmi butuh legalitas usaha (NIB) |
| Hosting/Deploy | Cloudflare Workers (frontend + backend jadi satu deployment) | Infra mendekati Rp0 di tier gratis Cloudflare, tidak perlu server terpisah |
| Penyimpanan file (opsional) | Cloudflare R2 | Untuk aset seperti gambar soal, biaya jauh lebih murah dari layanan storage lain |

### 3.3 Skema Data Utama (Konsep)

| Entitas | Atribut Kunci | Relasi |
|---|---|---|
| User | id, nama, email, formasi_tujuan | 1 user → banyak transaksi, banyak hasil tryout |
| Paket | id, nama_paket, harga, jenis (CPNS/PPPK), masa_aktif | 1 paket → banyak soal (melalui tabel relasi) |
| Soal | id, subtes, pertanyaan, opsi_jawaban, kunci_jawaban, pembahasan, bobot | banyak soal → 1 paket |
| Transaksi | id, user_id, paket_id, status_bayar, metode_bayar, jumlah, waktu | 1 transaksi → 1 user, 1 paket |
| Hasil Tryout | id, user_id, paket_id, skor_total, skor_per_subtes, waktu_pengerjaan | 1 hasil → 1 user, 1 sesi pengerjaan |

### 3.4 Integrasi Pembayaran QRIS

1. Tahap MVP: QRIS statis pribadi + form konfirmasi manual (upload bukti bayar), diverifikasi admin di dashboard.
2. Tahap scale-up: integrasi payment gateway (Midtrans Snap / Xendit / Tripay) dengan callback otomatis untuk membuka akses paket tanpa verifikasi manual.
3. Syarat gateway resmi: NIB atau pendaftaran usaha, rekening bisnis/pribadi terverifikasi.

### 3.5 Keamanan

- Enkripsi password (bcrypt/argon2 atau setara yang didukung Cloudflare Workers) untuk sistem autentikasi custom di Hono.
- Rate limiting pada endpoint submit jawaban untuk mencegah manipulasi skor.
- Validasi sisi server untuk waktu pengerjaan (jangan percaya timer dari sisi client saja).
- HTTPS wajib di seluruh domain, terutama halaman pembayaran.
- Backup database berkala (otomatis harian jika pakai managed database).

### 3.6 Skalabilitas

- Tahap MVP: SvelteKit + Hono di atas Cloudflare Workers + D1 cukup untuk ratusan hingga ribuan pengguna dengan biaya mendekati Rp0 (tier gratis Cloudflare cukup luas).
- Saat trafik naik signifikan (musim pendaftaran CPNS/PPPK): pertimbangkan caching soal (KV/Cache API Cloudflare) dan optimasi query D1.
- Pisahkan layanan aset statis besar (gambar, file) ke CDN terpisah (Cloudflare R2) agar tidak membebani server utama.

---

## 4. Spesifikasi Desain

### 4.1 Arah Visual

Mengacu hasil analisis kompetitor: AyoCPNS tampil modern dengan mode gelap/terang, Privat Alfaiz cenderung generik ala e-commerce course. Produk ini mengambil posisi "fresh & modern" namun tetap terasa kredibel/serius agar sesuai konteks seleksi CPNS/PPPK yang formal.

**4.1.1 Palet Warna (usulan awal)**
- Warna primer: biru (kepercayaan, institusional) — selaras dengan tone AyoCPNS yang sudah familiar bagi target pengguna.
- Warna aksen: satu warna kontras (misal oranye/kuning) untuk CTA (tombol Beli, Mulai Tryout).
- Mode terang & gelap (dark mode) sebagai nilai tambah, mengikuti tren yang sudah dipakai AyoCPNS & Privat Alfaiz.

**4.1.2 Tipografi**
- Font sans-serif modern untuk keterbacaan tinggi di layar kecil (mayoritas peserta akses dari HP).
- Hierarki jelas: judul paket besar & tebal, deskripsi fitur ringkas dengan ikon centang (pola yang terbukti efektif di ketiga kompetitor).

### 4.2 Komponen Kunci

| Komponen | Referensi Pola | Catatan Adaptasi |
|---|---|---|
| Kartu Paket (Pricing Card) | AyoCPNS: 2 tier berdampingan dengan badge "Favorit" | Tambahkan badge "Terlaris" otomatis berdasarkan data penjualan |
| Daftar Fitur per Paket | Checklist dengan ikon centang, dikelompokkan | Highlight fitur yang beda antar tier agar upsell jelas |
| Kartu Produk Tryout | Viracun/Alfaiz: gambar banner + harga coret + harga akhir | Gunakan untuk paket satuan/bundling per volume |
| Panduan Pilih Paket | AyoCPNS: banner "Bandingkan Paket" | Bantu pengguna baru yang bingung pilih tier |

### 4.3 Halaman yang Perlu Didesain (Wireframe List)

1. Landing page (hero, value proposition, daftar paket unggulan, testimoni).
2. Halaman katalog paket tryout (list + filter CPNS/PPPK).
3. Halaman detail paket (fitur, harga, tombol beli).
4. Halaman checkout & pembayaran QRIS.
5. Halaman dashboard pengguna (riwayat tryout, paket aktif).
6. Halaman pengerjaan tryout (tampilan soal, timer, navigasi soal).
7. Halaman hasil & pembahasan (skor per subtes, ranking, grafik progres).
8. Halaman admin: manajemen soal, paket, transaksi, statistik.

### 4.4 Prinsip Desain Responsif Lintas Device

- Produk berupa website yang harus nyaman diakses dari HP, tablet, laptop, maupun desktop — bukan aplikasi terpisah untuk tiap platform.
- Mayoritas peserta CPNS/PPPK kemungkinan mengakses dari HP, jadi tetap diprioritaskan (tombol besar, jarak antar elemen cukup, teks terbaca tanpa zoom), namun tampilan di layar besar (laptop/desktop) juga harus rapi, bukan sekadar versi HP yang di-stretch.
- Halaman pengerjaan tryout harus tetap terbaca jelas dan nyaman dipakai di semua ukuran layar.
- Desain dibuat responsif penuh dengan breakpoint jelas (mobile, tablet, desktop), bukan sekadar "terlihat oke" di satu ukuran layar saja.

---

## 5. Development Plan

### 5.1 Prinsip: MVP Dulu

Jangan membangun seluruh fitur impian di versi pertama. Fokus pada alur inti: tryout berjalan, pembayaran berjalan, legal dasar aman. Fitur lanjutan (leaderboard, pembahasan versi lebih interaktif, dsb) menyusul setelah ada pengguna nyata dan feedback.

### 5.2 Fase Pengembangan

| Fase | Fokus | Fitur Utama |
|---|---|---|
| Fase 1 — MVP | Validasi produk & transaksi pertama | Login sederhana, 1 tryout gratis untuk akun baru (free trial), katalog paket, pengerjaan tryout dengan timer, skor otomatis, pembayaran QRIS manual, dashboard admin dasar (kelola soal & paket) |
| Fase 2 — Retensi | Membuat pengguna kembali & merekomendasikan | Pembahasan lengkap, ranking nasional/daerah, riwayat & grafik progres, grup komunitas, integrasi payment gateway otomatis |
| Fase 3 — Ekspansi | Diferensiasi & skala | Pembahasan soal versi lebih interaktif (highlight & catatan visual detail), sistem paket berseri (Part/Volume), program afiliasi/referral |

### 5.3 Estimasi Prioritas Kerja untuk Codex

1. Setup project dengan Bun (SvelteKit + Vite, adapter-cloudflare) dan backend Hono, koneksi database Cloudflare D1 via Drizzle ORM.
2. Autentikasi pengguna (email + Google login).
3. Skema database: user, paket, soal, transaksi, hasil tryout (sesuai bagian 3.3).
4. Halaman katalog & detail paket (statis dulu, data dummy).
5. Alur checkout QRIS statis + form konfirmasi manual.
6. Mesin tryout: tampilan soal, timer, simpan jawaban, submit, hitung skor.
7. Halaman hasil & pembahasan dasar.
8. Dashboard admin: CRUD soal & paket, verifikasi transaksi manual.
9. Testing alur end-to-end (daftar → bayar → kerjakan → lihat hasil).
10. Deploy ke domain sendiri, siapkan ToS/Privacy Policy/Disclaimer sebelum publish.

### 5.4 Validasi Sebelum Mulai Coding

- Ngobrol dengan minimal 5–10 calon pengguna (grup Telegram/Facebook CPNS-PPPK) untuk konfirmasi fitur yang benar-benar dibutuhkan.
- Pastikan minimal 1 celah diferensiasi jelas dibanding kompetitor sebelum mulai build (lihat bagian 1.5).
- Siapkan draft ToS, Privacy Policy, dan Disclaimer sebelum produk go-live, bukan sesudahnya.

### 5.5 Checklist Siap Dilempar ke Codex

- Dokumen ini (PRD, FSD, TSD, Desain) sebagai konteks utama.
- Daftar warna & referensi visual (screenshot kompetitor yang disukai).
- Contoh 5–10 soal tryout (format pertanyaan, opsi, kunci jawaban, pembahasan) sebagai data awal.
- Keputusan final: nama produk, domain, dan harga paket pertama.

---

*Dokumen ini adalah rancangan awal (versi 1.0) dan dapat diperbarui seiring validasi pasar dan perkembangan proyek.*
