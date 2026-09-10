# Rancangan Web Tryout CPNS & PPPK

Status: perencanaan, belum ada implementasi aplikasi. **Arah MVP: SQLite lokal, self-hosting lewat Dokploy, Better Auth, dan backup di Cloudflare R2.** Framework/runtime/ORM masih usulan; backup belum dikonfigurasi.

## Mulai membaca

- [Backlog](BACKLOG.md): prioritas, dependensi, dan kriteria selesai.
- [Dev log](DEVLOG.md): perubahan yang benar-benar sudah dikerjakan.
- [Kajian database & pembayaran](docs/database-payment-options.md): opsi dan sumber resmi, diperiksa 10 September 2026.
- [Daftar keputusan](docs/decisions.md): keputusan terbuka dan bukti yang diperlukan.
- [Rencana MVP, migrasi, dan backup](docs/mvp-self-hosting.md): arah terbaru dari pengguna.
- [Rancangan awal](Rancangan_Web_Tryout_CPNS_PPPK%20(1).md): referensi asli, dipertahankan apa adanya.

Instruksi implementasi di rancangan awal merupakan konteks, bukan persetujuan memilih stack. Permintaan terbaru pengguna mengutamakan evaluasi opsi dan pencatatan perubahan.

## Pelacakan perubahan

Setiap pekerjaan memakai ID backlog. Setelah selesai, perbarui status, tambahkan dev log berisi perubahan serta verifikasi, lalu commit dengan ID tersebut. Push ke GitHub setelah satu perubahan logis selesai agar tab Commits menampilkan riwayat dan diff. Perubahan lokal tidak otomatis terlihat di GitHub sebelum push.

Repositori: [tryout-cpns-pppk](https://github.com/igustimadeyogawicaksana/tryout-cpns-pppk), dibuat pengguna dengan visibilitas public. [Riwayat perubahan](https://github.com/igustimadeyogawicaksana/tryout-cpns-pppk/commits/main/) tersedia setelah push berhasil. Status koneksi aktual dicatat di DEVLOG.md. Tidak ada otomatisasi push yang berjalan saat ini.
