# Perencanaan input bank soal MVP

Status: rancangan implementasi, 2026-09-10. SQLite dipilih pengguna; aturan produk di bawah merupakan default rancangan yang dapat ditinjau sebelum rilis. Belum ada UI atau importir yang dibangun.

## Ruang lingkup

MVP menyediakan input manual dan impor JSON terstruktur, review soal, penerbitan versi, penyusunan paket dan preview peserta. Input spreadsheet, OCR PDF dan generasi otomatis ditunda. CPNS dan PPPK memakai struktur yang sama, tetapi blueprint jumlah soal, durasi, formasi dan aturan skornya terpisah.

Jangan memakai angka “100 soal SKD” dari rancangan awal sebagai konstanta. BKN pernah menetapkan 110 soal/100 menit pada SKD 2021; itu referensi historis, bukan verifikasi aturan tahun seleksi sekarang. Simpan tahun, URL sumber, tanggal pemeriksaan dan konfigurasi setiap blueprint; admin harus memvalidasinya sebelum menerbitkan paket berlabel simulasi resmi tahun tertentu. [BKN 2021](https://www.bkn.go.id/peserta-calon-pns-2021-akan-berkompetisi-dalam-100-menit-untuk-menjawab-110-soal-skd-dengan-cat-bkn-berita/).

## Data yang diisi admin

| Field | Wajib | Aturan |
|---|---|---|
| external_key | Untuk impor | Kode stabil buatan penyusun; bukan ID internal database |
| exam_type | Ya | CPNS atau PPPK |
| subtest_code | Ya | Referensi subtes valid pada blueprint |
| formation_code | PPPK teknis | Referensi formasi/bidang; tidak mencampur bidang berbeda dalam ranking |
| topic_code, difficulty | Ya | Topik terdaftar; kesulitan easy/medium/hard sebagai label editorial |
| prompt_md | Ya | Teks pertanyaan; Markdown yang disanitasi, tanpa HTML/script aktif |
| options | Ya | Pilihan tunggal; kode opsi stabil dan teks tidak kosong; jumlah mengikuti blueprint |
| scoring_mode | Ya | single_correct atau weighted_options |
| correct_option_code | single_correct | Tepat satu kode opsi yang ada |
| score_correct, score_wrong, score_blank | single_correct | Integer dalam rentang blueprint |
| option.score, score_blank | weighted_options | Bobot integer setiap opsi; bukan satu kunci benar/salah |
| explanation_md | Ya saat review | Alasan jawaban dan pembahasan; tidak dikirim ke browser saat ujian |
| assets | Bila ada | ID aset milik sistem, alt text, tipe/ukuran valid; tidak mengambil URL arbitrer saat impor |
| source_note, rights_basis | Ya | Sumber dan dasar izin/karya sendiri; parafrase tidak otomatis menjamin bebas hak cipta |
| shuffle_options | Ya | Default true; false untuk opsi berurutan, rujukan A/B, atau alasan pedagogis |

UUID internal dibuat server dan disimpan sebagai TEXT NOT NULL PRIMARY KEY. Kode opsi A/B/C pada input hanyalah kode stabil: setelah diacak, jawaban tetap merujuk option_id, bukan huruf tampilan. Untuk soal bernilai bobot, skor melekat pada option_id.

## Alur input manual dan review

1. Admin memilih blueprint, subtes/topik/formasi, lalu mengisi pertanyaan, opsi, aturan skor dan pembahasan.
2. Simpan draft meskipun belum lengkap; tampilkan daftar kekurangan. Preview memakai tampilan peserta dengan label mode admin.
3. Ajukan review hanya setelah validasi lengkap. Reviewer memeriksa kunci/bobot, bahasa, ambiguitas, hak konten dan tampilan HP.
4. Review dapat mengembalikan draft dengan catatan. Pengelola solo boleh merangkap reviewer, tetapi konfirmasi checklist dan audit tetap dicatat.
5. Publikasikan versi yang disetujui. Versi terbit tidak boleh diedit; koreksi membuat versi baru dengan change_note.
6. Arsipkan untuk mencegah pemakaian pada paket baru. Versi yang dipakai sesi/hasil tidak dihapus secara fisik.

Status editorial: draft → in_review → approved → published → archived. Penolakan review kembali ke draft. Hak editor/reviewer/admin ditegakkan server, bukan hanya tombol UI.

## Impor JSON MVP

Contoh format tersedia di [contoh impor](../examples/question-bank-import.json). Ini kontrak draft v1, bukan format yang sudah didukung aplikasi. Format impor tidak membawa status published atau ID admin; semua hasil masuk draft.

Usulan batas satu unggahan: 100 soal atau 2 MB, mana yang tercapai dulu, tanpa data gambar base64. File berisi schema_version, batch_key dan questions. Server memeriksa struktur, enum, opsi, skor, blueprint, external_key duplikat dan isi terlalu panjang. Pesan kesalahan menyebut nomor soal, field, masalah dan perbaikan.

Proses: unggah → validasi tanpa menulis bank soal → preview jumlah valid/bermasalah/duplikat → konfirmasi impor. Satu batch gagal seluruhnya jika ada error; admin memperbaiki dan mengunggah ulang. Normalisasi dan validasi dikerjakan sebelum transaksi tulis. Impor dibatasi agar transaksi singkat.

Simpan UNIQUE(import_namespace, batch_key) dan hash konten. Retry batch yang sama dengan hash sama mengembalikan hasil lama, tanpa soal ganda; batch_key sama dengan hash berbeda ditolak. UNIQUE(import_namespace, external_key) menjaga identitas soal. Bila external_key sudah ada, impor MVP menolak dan mengarahkan ke alur revisi; tidak menimpa versi lama diam-diam. Impor duplikat secara bersamaan tetap ditahan constraint database.

## Menyusun paket

Admin menentukan judul, jenis ujian, blueprint versi, durasi, jumlah soal per subtes, harga integer rupiah dan masa akses. Pilih soal terbit sesuai kuota; preview menghitung jumlah, skor maksimal dan kelengkapan pembahasan. Publikasi ditolak bila kuota salah, ada soal ganda, versi tidak disetujui, atau formasi tidak sesuai.

Pisahkan produk yang dijual dari paket ujian terbit: satu produk dapat memberi akses ke beberapa paket; satu paket berisi exam_version yang immutable. Daftar question_version_id dibekukan saat paket terbit. Peserta dalam satu leaderboard menerima himpunan soal/bobot sama; hanya urutan soal/opsi yang dapat berbeda. Pengambilan soal acak dari pool berbeda ditunda untuk latihan tanpa ranking komparatif.

Saat mulai sesi, server membekukan exam_version_id, daftar versi soal, urutan opsi, batas waktu, region peserta dan aturan skor. Tidak menyalin seluruh teks soal per peserta; versi soal disimpan sekali dan tidak berubah. Kunci dan pembahasan hanya dibaca server saat penilaian atau setelah akses pembahasan dibuka.

## Model data logis SQLite

| Tabel | Fungsi dan constraint utama |
|---|---|
| exam_blueprints, blueprint_versions | Jenis ujian, formasi, sumber tahun dan aturan skor/kuota/durasi yang diberi versi |
| topics, formations | Referensi kategori valid |
| questions | Identitas soal stabil; UNIQUE(namespace, external_key) |
| question_versions | Teks, pembahasan, mode skor, sumber, status; UNIQUE(question_id, version_no) |
| question_options | FK versi soal; UNIQUE(question_version_id, option_code); bobot integer |
| assets, question_assets | Referensi file dan hak akses; file tidak masuk database/Git |
| products, product_exam_versions | Produk, harga dan daftar paket yang diberikan |
| exam_versions, exam_version_questions | Paket beku; UNIQUE(exam_version_id, question_version_id) dan posisi |
| import_batches, audit_log | Deduplikasi impor, jumlah hasil, pemeriksa, waktu dan alasan perubahan |

Indeks awal: question_versions(status, question_id), questions(exam_type, subtest_code, topic_code), question_options(question_version_id), exam_version_questions(exam_version_id). Field kategori final ditempatkan konsisten saat schema dibuat; ini model logis, bukan DDL executable.

## Koreksi setelah soal dipakai

Koreksi tidak mengubah hasil lama secara otomatis. Admin membuat versi soal/paket baru untuk peserta baru. Jika hasil cohort lama perlu diperbaiki, gunakan revisi penilaian tersendiri: preview dampak untuk seluruh cohort, catat alasan, proses seluruh hasil dengan aturan seragam, lalu publikasikan generasi ranking baru secara atomik. Jangan hanya mengubah skor satu peserta untuk kesalahan soal bersama.

## Kriteria selesai implementasi

- Single-correct dan weighted-options menghitung skor termasuk jawaban kosong dengan benar.
- Impor invalid tidak menulis sebagian; retry/double-click tidak menggandakan data.
- Dua editor tidak saling menimpa: revision/check versi draft diperlukan saat save.
- Revisi soal terbit tidak mengubah sesi lama; soal yang direferensikan tidak bisa dihapus.
- Paket invalid tidak dapat dipublikasikan; peserta tidak menerima kunci/bobot rahasia/pembahasan sebelum berhak.
- Preview, sanitasi Markdown, gambar, alt text dan rumus bila dipakai diperiksa pada HP dan desktop.
