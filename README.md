# Rancangan Web Tryout CPNS & PPPK

Status: implementasi awal bank soal tersedia. **SvelteKit + TypeScript + Node.js + Drizzle + SQLite + Better Auth**, dengan rencana self-hosting Dokploy dan backup Cloudflare R2. Paket ujian, ranking, pembayaran dan backup belum diimplementasikan.

## Jalankan aplikasi lokal

```sh
npm ci
npm run dev:setup
npm run dev
```

Buka http://localhost:5173. Detail akun pengelola lokal tersimpan di `.local/akses-lokal.txt` setelah setup; berkas ini tidak masuk Git. Lihat [panduan pengembangan](docs/development-guide.md) untuk batas fitur, pengujian dan persiapan Dokploy. “Ruang Tryout” adalah nama tampilan sementara.

## Mulai membaca

- [Backlog](BACKLOG.md): prioritas, dependensi, dan kriteria selesai.
- [Dev log](DEVLOG.md): perubahan yang benar-benar sudah dikerjakan.
- [Kajian database & pembayaran](docs/database-payment-options.md): opsi dan sumber resmi, diperiksa 10 September 2026.
- [Daftar keputusan](docs/decisions.md): keputusan terbuka dan bukti yang diperlukan.
- [Rencana MVP, migrasi, dan backup](docs/mvp-self-hosting.md): arah terbaru dari pengguna.
- [Cakupan SQLite MVP](docs/sqlite-mvp-coverage.md): persyaratan per fitur dan target uji kapasitas.
- [Input bank soal](docs/question-bank-plan.md): form, impor, review, versi dan penyusunan paket.
- [Perankingan](docs/ranking-plan.md): cohort, percobaan, skor seri, privasi dan snapshot.
- [Contoh JSON bank soal](examples/question-bank-import.json): dua contoh sintetis untuk kontrak impor draft.
- [Rancangan awal](Rancangan_Web_Tryout_CPNS_PPPK%20(1).md): referensi asli, dipertahankan apa adanya.

Rancangan awal adalah referensi historis. Keputusan SQLite, Dokploy, Better Auth dan R2 serta permintaan melanjutkan implementasi menjadi arahan terbaru. Tahapan dan perubahan dicatat di backlog/dev log.

## Pelacakan perubahan

Setiap pekerjaan memakai ID backlog. Setelah selesai, perbarui status, tambahkan dev log berisi perubahan serta verifikasi, lalu commit dengan ID tersebut. Push ke GitHub setelah satu perubahan logis selesai agar tab Commits menampilkan riwayat dan diff. Perubahan lokal tidak otomatis terlihat di GitHub sebelum push.

Repositori: [tryout-cpns-pppk](https://github.com/igustimadeyogawicaksana/tryout-cpns-pppk), dibuat pengguna dengan visibilitas public. [Riwayat perubahan](https://github.com/igustimadeyogawicaksana/tryout-cpns-pppk/commits/main/) tersedia setelah push berhasil. Status koneksi aktual dicatat di DEVLOG.md. Tidak ada otomatisasi push yang berjalan saat ini.
