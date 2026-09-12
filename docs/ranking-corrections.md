# Koreksi hasil dan generasi ranking

Dokumen ini menetapkan perilaku lokal untuk RANK-002. Koreksi hanya tersedia bagi pengelola setelah periode kompetisi ditutup.

## Aturan data

- Saat percobaan kompetisi dibuat, `scoring_policy` disalin dari cohort ke percobaan. Snapshot ditolak jika ada hasil dalam cohort dengan aturan berbeda.
- Hasil dimulai pada `result_revision = 1`. Koreksi memakai nomor revisi yang sedang dilihat pengelola agar dua koreksi bersamaan tidak saling menimpa.
- Pengelola hanya dapat mengubah nilai subtes. Struktur subtes dan nilai maksimum tetap. Total dihitung ulang dari seluruh subtes.
- Setiap koreksi menyimpan hasil sebelum dan sesudah, alasan, aturan penilaian, pengelola, waktu, serta perpindahan revisi pada `result_corrections`. Aktivitas juga dicatat di audit log.
- Snapshot final bersifat permanen. Penutupan membuat generasi 1; setiap koreksi sah membuat generasi berikutnya. Halaman publik selalu membaca generasi terbaru.
- Generasi baru memakai skor yang sudah dikoreksi, tetapi mempertahankan alias, provinsi, dan pilihan tampil dari snapshot sebelumnya. Perubahan profil setelah penutupan tidak mengubah identitas ranking final.

## Alur pengelola

1. Buka **Paket tryout**, lalu pilih **Audit hasil & generasi ranking** pada paket kompetisi.
2. Buka peserta, ubah nilai subtes yang memang perlu dikoreksi, dan tulis alasan minimal 10 karakter.
3. Simpan. Sistem merekam audit dan membuat generasi ranking baru dalam satu transaksi.
4. Periksa nomor generasi terbaru dari tautan **Lihat ranking**.

Koreksi tidak menghapus generasi sebelumnya. Pemulihan dilakukan dengan koreksi baru yang juga diaudit, bukan dengan mengedit riwayat.
