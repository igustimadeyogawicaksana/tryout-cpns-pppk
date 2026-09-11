# Rancangan perankingan MVP

Status: rancangan produk, bukan aturan seleksi BKN. Implementasi awal ranking umum per paket tersedia sejak 2026-09-11; bagian di bawah adalah target lengkap dan belum seluruhnya selesai.

## Implementasi awal yang tersedia

Admin mengaktifkan kompetisi gratis pada paket terbit yang belum memiliki percobaan. Satu paket mempunyai satu periode dan kebijakan total-v1; tidak bisa mengonversi hasil latihan lama menjadi kompetisi. Waktu penutupan ditentukan saat aktivasi dan tidak bisa diubah. Sesi dibatasi deadline paket atau penutupan, mana yang lebih awal.

Peserta terverifikasi memilih alias dan opt-in publikasi, lalu mulai satu sesi. Akun pengelola ditolak. Skor pribadi tersedia setelah submit, tetapi opsi bernilai dan pembahasan baru tersedia setelah penutupan. Ranking hanya bisa dibaca anggota periode atau admin. Ranking umum menggunakan total tertinggi, seri 1/2/2/4, 20 baris per halaman dan posisi saya. Opt-out segera menghilangkan baris dan menghitung ulang posisi; tidak ada cache publik. Tidak ada perubahan persetujuan tanpa tindakan peserta.

Tahap ini menghitung hasil tersimpan dalam satu transaksi baca SQLite pada setiap permintaan. Belum memakai generasi snapshot persisten, pembaruan 60 detik. Karena itu masih untuk skala awal dan belum dinyatakan siap beban besar. Filter provinsi, invalidasi/koreksi hasil, status final dan retake belum tersedia; UI tetap memberi label sementara. Tidak ada gateway atau paket berbayar yang diaktifkan oleh fitur ini.

Cara mencoba: pengelola membuka Paket tryout → Aktifkan ranking kompetitif pada edisi baru → tentukan waktu penutupan lengkap dengan zona waktu. Peserta membuka detail paket → mengisi alias/persetujuan → mengerjakan → membuka ranking dari hasil. Setelah opt-out, nama alias tidak dipublikasikan lagi pada periode tersebut.

## Siapa dibandingkan dengan siapa

Leaderboard memakai satu cohort: exam_version_id + periode kegiatan + ranking_policy_version. Daftar soal, bobot, durasi dan aturan akses pembahasan sama. Paket yang berubah versi mendapat cohort baru. Jangan mencampur CPNS dengan PPPK, formasi PPPK berbeda, mini trial dengan paket penuh, atau set soal berbeda hanya karena skornya dinormalisasi ke persen.

Tampilan MVP: ranking peserta platform dalam satu cohort (label nasional berarti peserta platform lintas daerah, bukan seluruh peserta seleksi nasional) dan filter provinsi domisili. Provinsi merupakan data profil yang dinyatakan peserta, bukan lokasi terverifikasi; dibekukan saat sesi kompetitif dimulai. Profil tanpa provinsi tetap masuk ranking umum, tetapi tidak ranking provinsi. Tidak perlu GPS atau alamat rinci.

## Percobaan yang dihitung

- Satu pengguna memiliki satu percobaan kompetitif per cohort, ditetapkan atomik saat memulai sesi. UNIQUE(cohort_id, user_id) mencegah start ganda.
- Sesi putus jaringan dilanjutkan sebagai sesi yang sama dengan deadline server yang sama. Tidak mendapat waktu tambahan otomatis.
- Sesi yang dimulai dan ditinggalkan tetap diselesaikan saat tenggat; jawaban yang berhasil tersimpan dinilai, termasuk skor nol.
- Percobaan ulang jika paket mengizinkan menjadi latihan pribadi dan tidak menggantikan ranking. Setelah pembahasan terbuka, peserta tidak bisa memakai pengetahuan tersebut untuk memperbaiki ranking kompetitif pada cohort yang sama.
- Akun admin/demo, hasil dibatalkan, sesi belum dinilai, dan paket trial tidak masuk leaderboard kompetitif MVP. Trial menampilkan hasil pribadi.
- Pengguna yang tidak bersedia tampil tidak diterbitkan dalam leaderboard; jumlah peserta dan ranking dihitung hanya dari peserta eligible yang bersedia tampil. Perubahan persetujuan memicu pembaruan snapshot; jelaskan bahwa posisi dapat berubah.
- Insiden sistem dapat diberi penyelesaian admin yang diaudit. Penggantian percobaan tidak otomatis; jangan memberi retake kompetitif jika pembahasan telah terungkap. Insiden luas dapat membatalkan cohort dan membuat cohort baru.

## Aturan urut dan nilai seri

Default MVP memakai skor total tertinggi. Nilai sama mendapat peringkat sama dengan competition ranking: 1, 2, 2, 4. Durasi, waktu submit dan subskor tidak digunakan untuk memecahkan seri. Ini menghindari penalti jaringan dan klaim mengikuti aturan seleksi resmi yang belum diverifikasi.

| Peserta contoh | Total | Durasi | Peringkat |
|---|---:|---:|---:|
| Peserta A | 450 | 95 menit | 1 |
| Peserta B | 430 | 80 menit | 2 |
| Peserta C | 430 | 90 menit | 2 |
| Peserta D | 410 | 75 menit | 4 |

Di dalam kelompok seri, urut tampilan berdasarkan alias lalu ID stabil agar pagination konsisten; urut tampilan tidak mengubah peringkat. Ranking provinsi dihitung ulang di kelompok provinsi, bukan menampilkan nomor ranking umum sebagai ranking daerah.

Lulus ambang latihan adalah indikator terpisah dari ranking, memakai blueprint tahun/kategori yang diverifikasi. Jangan memberi label pasti lulus CPNS/PPPK. Tampilkan subskor, skor maksimal, jumlah peserta eligible, waktu pembaruan dan status sementara/final. Kebijakan masa depan seperti tie-break subskor harus menjadi policy version baru dan dijelaskan sebelum peserta mulai.

## Penilaian dan finalisasi sesi

Server memeriksa pemilik sesi, hak akses, deadline dan versi soal. Jawaban mengacu option_id yang memang milik versi soal dalam sesi. Skor dihitung server dari data immutable; skor/kunci kiriman browser diabaikan.

Sesi: in_progress → submitted → scored, dengan ended_reason manual/deadline; invalidated adalah tindakan admin diaudit. Pending scoring harus dapat diproses ulang. Gunakan revision jawaban dan pemeriksaan status/deadline dalam transaksi agar autosave yang terlambat tidak mengubah hasil setelah submit.

Saat submit/timeout: kunci perubahan sesi secara logis dengan update bersyarat, hitung dari jawaban yang sudah diakui server, simpan result dan subskor, lalu tandai scored. UNIQUE(attempt_id, grading_revision) memastikan retry tidak menggandakan hasil. Transaksi pendek menjamin perubahan terlihat bersama. Job terjadwal menyelesaikan sesi yang melewati deadline; tidak bergantung tab browser tetap terbuka. Jawaban setelah deadline ditolak; UI harus memperlihatkan status simpan dan kegagalan jaringan.

## SQLite dan pembaruan leaderboard

SQLite mendukung RANK() dan PARTITION BY. Contoh konseptual setelah memilih tepat satu hasil eligible terbaru per pengguna:

```sql
SELECT user_id, total_score,
       RANK() OVER (ORDER BY total_score DESC) AS position
FROM eligible_results
WHERE cohort_id = :cohort_id;
```

eligible_results adalah view/CTE yang perlu dibangun, bukan tabel yang sudah ada. Filter eligibility/cohort/provinsi diterapkan sebelum ranking; pagination dan pencarian “posisi saya” setelah ranking. Jangan memasukkan user_id atau waktu submit ke ORDER BY di dalam RANK karena akan memecah nilai seri. [SQLite Window Functions](https://www.sqlite.org/windowfunctions.html).

Usulan MVP: bangun snapshot ranking paling sering satu kali per 60 detik untuk cohort yang berubah; endpoint membaca snapshot, bukan menghitung ulang seluruh jawaban. Tampilkan “diperbarui pada ...”; hasil pribadi dapat muncul lebih cepat daripada posisi ranking. Baca hasil dalam satu snapshot database, hitung di luar transaksi tulis panjang, kemudian simpan generasi baru dan pindahkan pointer active_generation secara atomik. Pembaca melihat satu generasi utuh. Jika rebuild gagal, pertahankan generasi lama dengan indikator data belum diperbarui dan jadwalkan retry.

Penutupan cohort ditentukan ends_at; sesi kompetitif harus berakhir paling lambat ends_at. Setelah semua sesi eligible diselesaikan atau insidennya diputuskan, terbitkan snapshot final. Koreksi sesudah final membuat generasi koreksi dengan alasan dan waktu; tidak menghapus jejak hasil sebelumnya.

## Model data dan indeks

| Tabel | Isi/constraint |
|---|---|
| cohorts | Versi paket, kebijakan ranking, waktu buka/tutup |
| competitive_entries | user, cohort, attempt, provinsi beku, persetujuan tampil; UNIQUE(cohort_id, user_id) |
| attempts, attempt_items | Sesi, deadline, urutan soal/opsi dan versi immutable |
| answers | Pilihan terakhir dan revision; UNIQUE(attempt_id, question_version_id) |
| results, result_subscores | Hasil tersimpan dan revisi penilaian; UNIQUE(attempt_id, grading_revision) |
| ranking_generations | Cohort, grading revision, waktu, status, jumlah peserta; pointer aktif di cohort |
| ranking_entries | Generation, scope umum/provinsi, user, score, rank; UNIQUE(generation_id, scope_key, user_id) |

Indeks kandidat: attempts(status, deadline_at), answers(attempt_id), results(cohort_id, total_score DESC), competitive_entries(cohort_id, region_code), ranking_entries(generation_id, scope_key, rank). Verifikasi dengan query plan dan data uji; jangan membuat indeks berlebih yang memperberat autosave.

## Privasi, akses dan pengujian

Leaderboard hanya untuk peserta login yang memiliki akses cohort; trial tidak membuka leaderboard berbayar. Tampilkan alias publik, peringkat, skor/subskor dan provinsi bila diizinkan. Email, nomor HP, ID pembayaran dan nama lengkap privat tidak disertakan. Detail jawaban hanya pemilik/admin berwenang. SQLite tidak memberi RLS seperti PostgreSQL, maka setiap endpoint wajib menguji otorisasi server. Saat opt-out, respons harus langsung menyembunyikan identitas/baris peserta tersebut dan menghapus cache respons terkait walaupun rebuild ranking belum selesai; posisi sementara boleh tertunda dengan label pembaruan. Pembahasan untuk cohort kompetitif baru terbuka setelah cohort ditutup agar tidak mudah dibagikan ke peserta yang belum ujian; mode latihan tanpa ranking boleh membuka pembahasan setelah submit.

Kasus penerimaan: seri menghasilkan 1/2/2/4; provinsi menghasilkan urutan lokal benar; satu user tidak muncul dua kali; retake tidak mengganti hasil; hasil invalid tidak masuk; nilai nol valid tetap masuk; opt-out tidak bocor; pagination/posisi saya konsisten; koreksi skor mengganti satu generasi utuh; timeout tanpa tab aktif selesai; double submit memberi hasil sama; autosave setelah final ditolak; ranking cohort/formasi/versi berbeda tidak tercampur.
