import type { QuestionInput } from '../../src/lib/question-input';
import { makeSingle } from './skd-reviewed';

type Response = [string, string];
type Situation = [string, string, Response[]];
// Options are authored in descending quality, then rotated for presentation.
// Weights are the local practice rubric, not an official BKN answer key.
export const tkp: Situation[] = [
  ['PELAYANAN_PUBLIK', 'Warga lanjut usia kesulitan mengisi formulir digital di loket. Antrean masih berjalan dan tersedia meja pendampingan. Anda akan ...', [
    ['Mengarahkannya ke meja pendampingan dan memastikan ada petugas yang membantu.', 'Memberi bantuan yang tersedia tanpa menghentikan antrean.'],
    ['Membantu sebentar untuk bagian yang sulit lalu melanjutkan antrean.', 'Responsif, tetapi bantuan singkat mungkin belum menyelesaikan seluruh kendala.'],
    ['Memberikan panduan tertulis dan meminta ia mencoba kembali.', 'Memberi informasi, tetapi belum menyesuaikan kesulitan pengguna.'],
    ['Memintanya kembali bersama keluarga pada hari lain.', 'Membebankan bantuan kepada keluarga meski fasilitas tersedia.'],
    ['Menolak pelayanan karena ia tidak bisa memakai formulir digital.', 'Mengabaikan kebutuhan bantuan dan menutup akses layanan.']]],
  ['PELAYANAN_PUBLIK', 'Seorang warga mengeluhkan status permohonannya yang melewati waktu layanan. Anda dapat memeriksa status tetapi tidak berwenang menetapkan hasil. Anda akan ...', [
    ['Memeriksa status, menghubungi penanggung jawab, dan menjelaskan tindak lanjut yang dapat dipastikan.', 'Menggabungkan verifikasi, koordinasi, dan informasi yang akurat.'],
    ['Memeriksa status dan memberi kontak penanggung jawab kepada warga.', 'Informasinya faktual, tetapi warga masih harus mengulang koordinasi.'],
    ['Mencatat keluhan untuk dibahas dalam rapat mingguan.', 'Keluhan terdokumentasi, namun tindak lanjut langsung tertunda.'],
    ['Meminta warga menunggu tanpa memeriksa status.', 'Tidak menggunakan akses yang tersedia untuk membantu.'],
    ['Menjanjikan permohonan pasti selesai hari ini agar warga tenang.', 'Janji tanpa kewenangan dan kepastian dapat menyesatkan.']]],
  ['PELAYANAN_PUBLIK', 'Sistem antrean elektronik mati. Prosedur cadangan mengizinkan nomor antrean manual. Ruang tunggu penuh. Anda akan ...', [
    ['Mengumumkan gangguan, menjalankan antrean manual, dan melaporkan gangguan teknis.', 'Menjaga layanan adil sekaligus memulai pemulihan sistem.'],
    ['Menjalankan antrean manual sesuai urutan kedatangan.', 'Layanan tetap berjalan, tetapi informasi dan laporan teknis belum lengkap.'],
    ['Memanggil teknisi dan meminta warga menunggu sementara.', 'Memulai pemulihan, tetapi tidak memakai prosedur cadangan.'],
    ['Menutup loket sampai sistem pulih tanpa perkiraan informasi berikutnya.', 'Menghentikan layanan meski alternatif sah tersedia.'],
    ['Mendahulukan orang yang Anda kenal selama sistem mati.', 'Memanfaatkan gangguan untuk perlakuan tidak adil.']]],
  ['PELAYANAN_PUBLIK', 'Persyaratan pada papan informasi berbeda dengan petunjuk layanan terbaru yang sudah berlaku. Seorang warga membawa berkas mengikuti papan lama. Anda akan ...', [
    ['Menjelaskan perubahan, membantu langkah pemenuhan, dan meminta papan segera diperbarui.', 'Menyelesaikan kendala warga sekaligus sumber kekeliruan informasi.'],
    ['Menjelaskan aturan terbaru serta dokumen tambahan yang diperlukan.', 'Informasi benar, tetapi penyebab kebingungan warga lain belum ditangani.'],
    ['Memberi salinan petunjuk terbaru tanpa penjelasan.', 'Ada informasi benar, namun bantuan memahami perubahan terbatas.'],
    ['Meminta warga membaca ulang papan yang sama.', 'Merujuk kembali ke sumber yang sudah diketahui salah.'],
    ['Memproses berdasarkan persyaratan lama agar tidak perlu menjelaskan.', 'Mengabaikan ketentuan yang berlaku.']]],
  ['PELAYANAN_PUBLIK', 'Pengguna kursi roda tidak dapat mencapai loket di lantai atas. Tersedia ruang layanan di lantai dasar yang dapat digunakan. Anda akan ...', [
    ['Mengoordinasikan layanan di lantai dasar dan mengusulkan perbaikan akses loket.', 'Memberi solusi saat ini serta perbaikan akses berkelanjutan.'],
    ['Melayani warga di ruang lantai dasar yang tersedia.', 'Kebutuhan langsung teratasi, tetapi masalah akses belum ditindaklanjuti.'],
    ['Menawarkan informasi layanan jarak jauh jika warga bersedia.', 'Memberi alternatif, namun tidak memanfaatkan ruang yang sudah dapat diakses.'],
    ['Meminta warga mencari orang lain untuk mewakilinya.', 'Membebankan solusi kepada warga tanpa mencoba fasilitas sendiri.'],
    ['Menyatakan pelayanan hanya dapat dilakukan di lantai atas.', 'Menutup akses walaupun ruang alternatif tersedia.']]],
  ['PELAYANAN_PUBLIK', 'Seorang pemohon meminta data pribadi pemohon lain untuk dijadikan contoh formulir. Contoh formulir tanpa data pribadi tersedia. Anda akan ...', [
    ['Menjelaskan batas kerahasiaan dan memberikan contoh anonim yang tersedia.', 'Melindungi data sekaligus memenuhi kebutuhan contoh.'],
    ['Mengarahkan pemohon ke contoh anonim di situs layanan.', 'Aman dan membantu, tetapi tidak memberikan contoh langsung yang sudah tersedia.'],
    ['Menolak memberikan data orang lain tanpa menawarkan contoh.', 'Menjaga kerahasiaan, namun kebutuhan bantuan belum dipenuhi.'],
    ['Meminta izin lisan rekan untuk memperlihatkan berkas orang lain.', 'Izin rekan bukan dasar yang cukup untuk membuka data pemohon.'],
    ['Memperlihatkan berkas lengkap karena hanya digunakan sebagai contoh.', 'Membuka data pribadi tanpa dasar.']]],
  ['PELAYANAN_PUBLIK', 'Sebelum loket tutup, seorang warga ingin mengetahui alasan berkasnya ditolak. Anda memiliki catatan kekurangannya. Anda akan ...', [
    ['Menjelaskan kekurangan secara ringkas dan memberikan langkah pengajuan kembali yang jelas.', 'Menjawab kebutuhan spesifik dengan tindak lanjut praktis.'],
    ['Memberikan catatan kekurangan dan kontak bantuan lanjutan.', 'Informasi tersedia, tetapi belum dijelaskan langsung.'],
    ['Menunjukkan daftar umum persyaratan kepada warga.', 'Membantu secara umum, belum menguraikan masalah berkasnya.'],
    ['Meminta datang besok tanpa memberikan catatan yang tersedia.', 'Menunda informasi yang sebenarnya bisa diberikan saat itu.'],
    ['Menyalahkan warga karena tidak memahami prosedur.', 'Tidak menjelaskan alasan dan merendahkan pengguna layanan.']]],
  ['PELAYANAN_PUBLIK', 'Anda menyadari nomor telepon kontak bantuan pada situs kantor salah. Beberapa warga telah gagal menghubungi. Anda akan ...', [
    ['Memverifikasi nomor benar, meminta koreksi segera, dan memasang pemberitahuan melalui kanal resmi.', 'Memperbaiki sumber kesalahan dan memberi jalan bagi warga terdampak.'],
    ['Melaporkan nomor yang salah kepada pengelola situs.', 'Memulai perbaikan, namun kebutuhan informasi sementara belum ditangani.'],
    ['Memberikan nomor benar hanya kepada warga yang datang bertanya.', 'Membantu kasus per kasus tetapi membiarkan kesalahan publik.'],
    ['Menunggu pengelola situs menemukan kesalahan sendiri.', 'Menunda perbaikan meskipun dampaknya sudah diketahui.'],
    ['Mengatakan warga salah menekan nomor tanpa memeriksa.', 'Menyalahkan warga dan menutup masalah informasi.']]],
  ['JEJARING_KERJA', 'Bagian tim Anda membutuhkan data dari unit lain yang belum merespons. Tenggat dua hari lagi. Anda akan ...', [
    ['Menghubungi penanggung jawab, menjelaskan kebutuhan minimum dan tenggat, lalu menyepakati pengiriman.', 'Membuat kebutuhan dan komitmen lintas unit jelas.'],
    ['Mengirim pengingat yang merinci data dan batas waktunya.', 'Komunikasi jelas, tetapi belum memastikan kesepakatan penerima.'],
    ['Mengerjakan bagian lain sambil menunggu jawaban pertama.', 'Waktu tetap digunakan, namun hambatan utama belum diatasi.'],
    ['Mengeluhkan kelambatan unit tersebut di grup umum.', 'Menambah ketegangan tanpa memperjelas penyelesaian.'],
    ['Mengisi data perkiraan dan menyebutnya sebagai data unit tersebut.', 'Memalsukan sumber dan merusak kepercayaan kerja.']]],
  ['JEJARING_KERJA', 'Dua anggota tim berbeda pendapat tentang pembagian tugas dan pekerjaan mulai tertunda. Anda memimpin rapat. Anda akan ...', [
    ['Meminta masing-masing menjelaskan beban kerja lalu menyepakati pembagian dan tenggat yang tercatat.', 'Menyelesaikan sebab perselisihan dengan kesepakatan terukur.'],
    ['Mempertemukan keduanya untuk membahas pembagian secara langsung.', 'Membuka dialog, tetapi hasil dan tindak lanjut belum dipastikan.'],
    ['Membagi ulang tugas sendiri berdasarkan informasi yang sudah Anda punya.', 'Memberi keputusan cepat, tetapi belum memeriksa hambatan kedua pihak.'],
    ['Menunda seluruh pekerjaan sampai mereka berdamai sendiri.', 'Membiarkan konflik menghambat tujuan tim.'],
    ['Memihak anggota yang paling dekat dengan Anda.', 'Pembagian tidak didasarkan pada kebutuhan kerja.']]],
  ['JEJARING_KERJA', 'Unit mitra memakai format laporan berbeda sehingga data sulit digabung. Kedua format memuat informasi yang dibutuhkan. Anda akan ...', [
    ['Menyepakati pemetaan kolom dan format pertukaran bersama tanpa menghilangkan informasi penting.', 'Menyelesaikan perbedaan secara kolaboratif dan menjaga kelengkapan data.'],
    ['Membuat pemetaan sementara dan mengirimkannya untuk konfirmasi mitra.', 'Praktis dan dapat diperiksa, namun standar bersama belum disepakati.'],
    ['Mengonversi berkas sendiri setiap kali laporan datang.', 'Pekerjaan berjalan tetapi berulang dan bergantung pada satu orang.'],
    ['Meminta mitra mengikuti format Anda tanpa menjelaskan kebutuhan.', 'Kurang mempertimbangkan proses kerja mitra.'],
    ['Membuang kolom yang tidak cocok agar penggabungan cepat.', 'Berisiko menghilangkan informasi yang dibutuhkan.']]],
  ['JEJARING_KERJA', 'Rekan baru belum mengetahui jalur koordinasi proyek dan sering menghubungi orang yang salah. Anda akan ...', [
    ['Mengenalkan kontak sesuai peran dan membagikan alur koordinasi yang dapat dirujuk kembali.', 'Membantu jejaring dan kemandirian rekan sekaligus.'],
    ['Mengenalkannya kepada penanggung jawab proyek.', 'Memberi kontak utama, tetapi alur lain belum dijelaskan.'],
    ['Menjawab pertanyaan kontak setiap kali ia bertanya.', 'Membantu sementara tanpa rujukan yang membuatnya mandiri.'],
    ['Menyuruhnya mencari tahu sendiri agar cepat belajar.', 'Tidak memberi dukungan yang mudah disediakan.'],
    ['Menertawakannya di depan anggota tim.', 'Merusak rasa aman untuk berkoordinasi.']]],
  ['JEJARING_KERJA', 'Anda menerima masukan teknis dari unit lain yang menunjukkan kelemahan rancangan tim. Anda akan ...', [
    ['Menguji masukan bersama dan memperbarui rancangan jika didukung bukti.', 'Menilai substansi dan membuka kerja sama perbaikan.'],
    ['Memeriksa masukan sendiri lalu menyampaikan hasil kepada tim.', 'Berbasis pemeriksaan, tetapi kesempatan klarifikasi bersama lebih kecil.'],
    ['Menyimpan masukan untuk evaluasi setelah proyek selesai.', 'Masukan diakui, namun perbaikan yang mungkin dibutuhkan tertunda.'],
    ['Mengabaikannya karena berasal dari luar tim.', 'Menilai asal masukan alih-alih isinya.'],
    ['Membalas dengan merendahkan kemampuan unit pemberi masukan.', 'Merusak hubungan dan tidak menyelesaikan masalah teknis.']]],
  ['JEJARING_KERJA', 'Dua unit menjadwalkan kegiatan pada ruang yang sama. Kalender bersama belum diperbarui. Anda akan ...', [
    ['Menghubungi kedua koordinator, mencari penyesuaian yang layak, dan memperbarui kalender bersama.', 'Menyelesaikan benturan sekaligus memperbaiki informasi koordinasi.'],
    ['Mencari ruang pengganti untuk kegiatan unit Anda dan memberitahu mitra.', 'Memberi solusi langsung, tetapi kalender bersama belum diperbaiki.'],
    ['Meminta koordinator Anda menentukan langkah berikutnya.', 'Menggunakan jalur koordinasi, tetapi belum membantu mencari alternatif.'],
    ['Datang lebih awal untuk menguasai ruangan.', 'Mengubah masalah jadwal menjadi persaingan sepihak.'],
    ['Membatalkan kegiatan unit lain tanpa pemberitahuan.', 'Melampaui peran dan merugikan mitra.']]],
  ['JEJARING_KERJA', 'Proyek selesai dan mitra meminta catatan kendala agar kolaborasi berikutnya lebih baik. Anda akan ...', [
    ['Menyusun evaluasi faktual bersama, termasuk perbaikan dari kedua pihak dan penanggung jawabnya.', 'Membangun pembelajaran tim dengan tindak lanjut konkret.'],
    ['Mengirim catatan kendala disertai saran perbaikan.', 'Bermanfaat, tetapi belum menyepakati tindak lanjut bersama.'],
    ['Menyampaikan hanya keberhasilan proyek.', 'Menjaga suasana positif tetapi kehilangan pembelajaran kendala.'],
    ['Tidak merespons karena proyek sudah selesai.', 'Mengabaikan peluang perbaikan kerja sama.'],
    ['Mencantumkan kesalahan mitra yang belum diverifikasi.', 'Evaluasi tidak adil dan dapat merusak kepercayaan.']]],
  ['JEJARING_KERJA', 'Koordinator berhalangan saat keputusan lintas unit diperlukan. Ada wakil resmi yang dapat dihubungi. Anda akan ...', [
    ['Menghubungi wakil resmi dengan ringkasan masalah dan mencatat keputusan untuk koordinator.', 'Menggunakan kewenangan pengganti serta menjaga kesinambungan informasi.'],
    ['Menghubungi wakil resmi untuk meminta arahan.', 'Jalur tepat, tetapi dokumentasi serah terima belum direncanakan.'],
    ['Menyiapkan pilihan keputusan sambil menunggu koordinator kembali.', 'Ada persiapan tetapi keputusan tertunda meski pengganti tersedia.'],
    ['Memutuskan sendiri walaupun di luar kewenangan.', 'Mengabaikan pembagian kewenangan.'],
    ['Mengatasnamakan koordinator untuk memperoleh persetujuan mitra.', 'Menggunakan identitas kewenangan secara tidak jujur.']]],
  ['SOSIAL_BUDAYA', 'Rapat dijadwalkan bersamaan dengan waktu ibadah sebagian anggota. Waktu alternatif masih tersedia. Anda akan ...', [
    ['Menyepakati waktu alternatif yang memungkinkan semua anggota berpartisipasi.', 'Menghormati kebutuhan dan mempertahankan partisipasi bersama.'],
    ['Mengusulkan perubahan waktu kepada ketua rapat.', 'Membuka penyesuaian, tetapi ketersediaan semua peserta belum dipastikan.'],
    ['Mengirim ringkasan kepada anggota yang tidak hadir.', 'Informasi tersampaikan, tetapi kesempatan berpendapat langsung berkurang.'],
    ['Meminta mereka meninggalkan ibadah untuk rapat.', 'Mengabaikan kebutuhan yang bisa diakomodasi.'],
    ['Mengejek anggota yang meminta penyesuaian.', 'Merendahkan keyakinan dan merusak hubungan kerja.']]],
  ['SOSIAL_BUDAYA', 'Rekan berbicara dengan logat yang belum Anda pahami saat memberi instruksi penting. Anda akan ...', [
    ['Meminta pengulangan dengan sopan lalu mengonfirmasi pemahaman isi instruksi.', 'Menjaga penghormatan sekaligus akurasi komunikasi.'],
    ['Meminta instruksi tertulis untuk memastikan rincian.', 'Memberi cara memahami isi tanpa merendahkan rekan.'],
    ['Bertanya kepada rekan lain tentang bagian yang Anda pahami sebagian.', 'Mencari bantuan, tetapi berisiko salah melalui perantara.'],
    ['Mengangguk walaupun belum memahami instruksi.', 'Menyembunyikan kendala dan meningkatkan risiko salah kerja.'],
    ['Menirukan logatnya sebagai lelucon.', 'Mengalihkan masalah pemahaman menjadi tindakan merendahkan.']]],
  ['SOSIAL_BUDAYA', 'Panitia makan bersama belum mengetahui kebutuhan makanan peserta yang beragam. Anda mengurus konsumsi. Anda akan ...', [
    ['Menanyakan kebutuhan secara wajar dan menyiapkan pilihan dengan label bahan yang jelas.', 'Mengakomodasi kebutuhan tanpa membuat asumsi tentang kelompok.'],
    ['Menyediakan beberapa pilihan makanan dan memberi informasi bahan.', 'Memberi pilihan, tetapi belum memastikan kebutuhan khusus peserta.'],
    ['Memilih satu menu yang menurut Anda biasanya diterima banyak orang.', 'Ada pertimbangan umum, namun kebutuhan berbeda mungkin terlewat.'],
    ['Meminta peserta berkebutuhan khusus membawa makanan sendiri sejak awal.', 'Membebankan kebutuhan kepada peserta tanpa mencoba akomodasi.'],
    ['Memaksa semua peserta menyantap menu yang sama.', 'Mengabaikan kebutuhan dan pilihan pribadi.']]],
  ['SOSIAL_BUDAYA', 'Dalam diskusi, usul anggota muda ditolak semata-mata karena usianya. Anda akan ...', [
    ['Mengajak tim menilai usul berdasarkan alasan dan manfaat, bukan usia pemberi usul.', 'Mengembalikan penilaian pada substansi secara setara.'],
    ['Meminta anggota itu menjelaskan usulnya lebih lengkap.', 'Memberi kesempatan, tetapi alasan penolakan berbasis usia belum diluruskan.'],
    ['Membahas usul tersebut secara pribadi setelah rapat.', 'Ada ruang dukungan, tetapi kesempatan forum tetap hilang.'],
    ['Menyarankan ia menunggu sampai lebih senior.', 'Mempertahankan pembatasan berdasarkan usia.'],
    ['Ikut menolak tanpa mendengar isi usulnya.', 'Menguatkan perlakuan tidak adil.']]],
  ['SOSIAL_BUDAYA', 'Rekan membuat julukan berdasarkan suku anggota tim dan penerimanya terlihat tidak nyaman. Anda akan ...', [
    ['Meminta julukan dihentikan dengan tenang dan mengajak menggunakan panggilan yang disukai rekan.', 'Menghentikan dampak serta menawarkan cara komunikasi yang menghormati.'],
    ['Mengingatkan pembuat julukan secara pribadi segera setelah percakapan.', 'Menegur secara konstruktif, tetapi dampak saat kejadian belum langsung dihentikan.'],
    ['Menghibur penerima julukan tanpa membahas perilaku pembuatnya.', 'Memberi dukungan tetapi perilaku dapat berulang.'],
    ['Menganggapnya wajar selama dimaksudkan sebagai lelucon.', 'Mengabaikan ketidaknyamanan penerima.'],
    ['Menggunakan julukan yang sama agar diterima kelompok.', 'Ikut memperkuat perilaku merendahkan.']]],
  ['SOSIAL_BUDAYA', 'Petugas baru belum memahami kebiasaan sapaan setempat dan warga salah mengartikannya sebagai tidak sopan. Anda akan ...', [
    ['Menjelaskan maksud kedua pihak dan mengenalkan kebiasaan sapaan setempat secara hormat.', 'Menjembatani perbedaan tanpa menyalahkan latar budaya.'],
    ['Mendampingi petugas saat melayani warga berikutnya.', 'Memberi contoh praktis, tetapi salah paham sebelumnya belum dijernihkan.'],
    ['Memberi petugas daftar sapaan untuk dipelajari sendiri.', 'Menyediakan bantuan, namun dialog konteks terbatas.'],
    ['Memindahkan petugas agar tidak bertemu warga setempat.', 'Menghindari kesempatan belajar dan penyesuaian.'],
    ['Menyebut budaya asal petugas sebagai penyebab ketidaksopanan.', 'Menggeneralisasi kelompok dan memperbesar prasangka.']]],
  ['SOSIAL_BUDAYA', 'Kegiatan tim menggunakan permainan yang sulit diikuti anggota dengan hambatan pendengaran. Anda akan ...', [
    ['Mendiskusikan penyesuaian, seperti petunjuk visual, agar ia dapat ikut setara.', 'Menyesuaikan kegiatan dengan melibatkan kebutuhan peserta.'],
    ['Menambahkan petunjuk tertulis yang dapat dilihat semua peserta.', 'Meningkatkan akses, tetapi kecocokan kebutuhan belum dikonfirmasi.'],
    ['Menawarkan peran pencatat yang terpisah dari permainan.', 'Ada peran, namun partisipasi inti belum setara.'],
    ['Meminta ia menonton saja demi kelancaran.', 'Mengecualikan peserta dari kegiatan.'],
    ['Menganggap keterbatasannya sebagai bahan candaan.', 'Merendahkan martabat peserta.']]],
  ['SOSIAL_BUDAYA', 'Tim memilih perwakilan untuk forum warga multikultural. Ada calon dari kelompok minoritas dengan pengalaman yang sesuai. Anda akan ...', [
    ['Menilai semua calon memakai kriteria pengalaman dan kemampuan komunikasi yang sama.', 'Menjaga kesempatan berdasarkan kompetensi tanpa diskriminasi.'],
    ['Mengusulkan calon tersebut dipertimbangkan bersama calon lain.', 'Membuka kesempatan, tetapi kriteria setara belum dirumuskan.'],
    ['Mengikuti pilihan mayoritas tanpa menanyakan dasar penilaian.', 'Menerima proses tetapi belum memastikan keadilannya.'],
    ['Meminta calon minoritas mundur agar tidak menimbulkan perdebatan.', 'Mengorbankan kesempatan berdasarkan identitas.'],
    ['Menolak calon hanya karena asal kelompoknya.', 'Menjadikan identitas sebagai alasan diskriminasi langsung.']]],
  ['TEKNOLOGI_INFORMASI', 'Email mengatasnamakan pengelola sistem meminta Anda memasukkan kata sandi melalui tautan yang tidak dikenal. Anda akan ...', [
    ['Tidak membuka tautan, melaporkan email, dan memverifikasi melalui kontak resmi pengelola.', 'Menghindari risiko sambil membantu penanganan dan verifikasi.'],
    ['Tidak membuka tautan dan menanyakan keaslian kepada pengelola resmi.', 'Aman dan terverifikasi, tetapi laporan insiden belum lengkap.'],
    ['Menghapus email tanpa membuka tautan.', 'Melindungi diri, namun tim tidak mendapat informasi ancaman.'],
    ['Meneruskan email ke rekan untuk mencoba tautannya.', 'Memindahkan risiko kepada orang lain.'],
    ['Memasukkan kata sandi agar akun tidak diblokir.', 'Menyerahkan kredensial kepada tujuan yang belum diverifikasi.']]],
  ['TEKNOLOGI_INFORMASI', 'Komputer bersama masih menampilkan akun Anda ketika harus meninggalkan ruangan. Anda akan ...', [
    ['Menyimpan pekerjaan dan keluar dari akun atau mengunci sesi sebelum pergi.', 'Mencegah orang lain memakai sesi aktif.'],
    ['Meminta rekan menjaga komputer sambil Anda segera kembali menutup sesi.', 'Ada pengawasan sementara, tetapi bergantung pada orang lain.'],
    ['Menutup jendela kerja saja tanpa keluar dari akun.', 'Mengurangi tampilan langsung, namun sesi tetap dapat diakses.'],
    ['Meninggalkan komputer karena tidak ada orang saat itu.', 'Tidak melindungi sesi dari orang yang datang kemudian.'],
    ['Membiarkan rekan memakai sesi Anda agar lebih praktis.', 'Menghilangkan pemisahan identitas dan tanggung jawab akses.']]],
  ['TEKNOLOGI_INFORMASI', 'Berkas kerja berisi data sensitif perlu dikirim ke unit mitra. Kanal berbagi resmi dengan pengaturan penerima tersedia. Anda akan ...', [
    ['Menggunakan kanal resmi, membatasi penerima yang perlu, dan memeriksa izin akses.', 'Menjaga tujuan pengiriman dan pembatasan akses sekaligus.'],
    ['Menggunakan kanal resmi dengan penerima yang sudah diketahui.', 'Memakai sarana tepat, tetapi pemeriksaan izin belum eksplisit.'],
    ['Meminta pengelola kanal mengirimkan berkas untuk Anda.', 'Dapat menjaga jalur resmi, namun perlu koordinasi tambahan.'],
    ['Mengunggah ke tautan publik agar mudah dibuka.', 'Membuka data melebihi penerima yang membutuhkan.'],
    ['Membagikan akun pribadi kantor kepada mitra.', 'Menyerahkan akses akun yang lebih luas daripada kebutuhan berkas.']]],
  ['TEKNOLOGI_INFORMASI', 'Setelah pembaruan aplikasi, Anda tidak menemukan fitur ekspor laporan yang diperlukan. Panduan dan bantuan teknis tersedia. Anda akan ...', [
    ['Memeriksa panduan, mencoba pada data aman, lalu menghubungi bantuan jika belum berhasil.', 'Belajar terarah dengan menjaga keamanan data.'],
    ['Menghubungi bantuan teknis dengan rincian fitur yang dicari.', 'Meminta dukungan yang tepat, tetapi belum mencoba rujukan tersedia.'],
    ['Meminta rekan yang pernah memakai versi baru mendampingi.', 'Mendapat bantuan, namun perlu memastikan praktiknya sesuai panduan.'],
    ['Menunda laporan tanpa mengabarkan kendala.', 'Hambatan tidak ditangani atau dikomunikasikan.'],
    ['Memasang aplikasi pengganti tidak dikenal memakai akun kantor.', 'Menambah risiko tanpa verifikasi atau persetujuan.']]],
  ['TEKNOLOGI_INFORMASI', 'Tautan folder internal ternyata dapat diakses siapa pun yang memiliki tautannya. Di dalamnya ada data terbatas. Anda akan ...', [
    ['Membatasi izin sesuai kewenangan dan segera melaporkan kemungkinan paparan untuk diperiksa.', 'Mengurangi paparan dan memulai penilaian dampak.'],
    ['Meminta pengelola segera membatasi izin folder.', 'Memulai perbaikan akses, tetapi pemeriksaan paparan belum disebutkan.'],
    ['Berhenti membagikan tautan kepada orang baru.', 'Mengurangi penyebaran baru namun akses lama tetap terbuka.'],
    ['Mengganti nama folder agar tidak mudah dicari.', 'Tidak mengubah izin akses tautan.'],
    ['Membiarkan karena belum ada laporan penyalahgunaan.', 'Mengabaikan kelemahan akses yang sudah diketahui.']]],
  ['TEKNOLOGI_INFORMASI', 'Rekan meminta kata sandi Anda karena akunnya bermasalah dan tenggat dekat. Anda akan ...', [
    ['Menolak berbagi kata sandi dan membantu menghubungi dukungan atau akses delegasi yang sah.', 'Menjaga kredensial sambil mencari penyelesaian pekerjaan.'],
    ['Mengarahkannya ke dukungan untuk memulihkan akun.', 'Jalur aman, tetapi bantuan terhadap urgensi pekerjaan terbatas.'],
    ['Menolak memberikan kata sandi tanpa menawarkan bantuan.', 'Melindungi akun tetapi tidak membantu kendala rekan.'],
    ['Meminjamkan sesi aktif tanpa menyebut kata sandinya.', 'Akses tetap berpindah identitas meskipun kata sandi tidak disebut.'],
    ['Mengirim kata sandi melalui pesan pribadi.', 'Membagikan kredensial dan merusak akuntabilitas akses.']]],
  ['TEKNOLOGI_INFORMASI', 'Anda menemukan perangkat USB tanpa pemilik di ruang layanan. Anda akan ...', [
    ['Menyerahkan kepada petugas berwenang sesuai prosedur tanpa menyambungkannya ke komputer.', 'Menjaga keamanan perangkat dan penanganan barang temuan.'],
    ['Menghubungi petugas keamanan untuk mengambil perangkat.', 'Memakai jalur penanganan aman, meski serah terima belum selesai.'],
    ['Membiarkannya di tempat dan memberi tahu rekan agar tidak menggunakannya.', 'Memberi peringatan tetapi barang tetap tidak terkelola.'],
    ['Menyambungkannya ke komputer pribadi untuk mencari nama pemilik.', 'Tetap berisiko menjalankan atau membuka isi tidak dikenal.'],
    ['Menyambungkannya ke komputer layanan dan membuka seluruh berkas.', 'Memaparkan sistem layanan pada perangkat tidak tepercaya.']]],
  ['PROFESIONALISME', 'Dua tugas penting memiliki tenggat bersamaan dan Anda memperkirakan tidak mampu menyelesaikan keduanya dengan kualitas baik. Anda akan ...', [
    ['Menjelaskan kapasitas dan dampaknya kepada atasan lalu menyepakati prioritas atau dukungan.', 'Membuat keputusan prioritas secara transparan sebelum terlambat.'],
    ['Mengusulkan jadwal penyelesaian bertahap kepada atasan.', 'Memberi pilihan, tetapi kebutuhan dukungan belum dianalisis lengkap.'],
    ['Mengerjakan tugas yang paling mendesak menurut penilaian sendiri.', 'Ada prioritas, tetapi belum dikonfirmasi dengan pemilik kebutuhan.'],
    ['Mengerjakan keduanya tanpa memberi kabar meskipun tahu akan terlambat.', 'Menyembunyikan risiko yang dapat dikelola lebih awal.'],
    ['Melaporkan salah satu tugas selesai walaupun belum dikerjakan.', 'Memalsukan kemajuan pekerjaan.']]],
  ['PROFESIONALISME', 'Angka pada laporan belum cocok dengan sumber dan laporan akan dipresentasikan besok. Anda akan ...', [
    ['Menelusuri selisih, memperbaiki berdasarkan bukti, dan menyampaikan bagian yang belum terverifikasi.', 'Menjaga akurasi serta transparansi keterbatasan.'],
    ['Meminta pemeriksaan silang dari rekan dengan menyertakan sumber.', 'Menambah kontrol, tetapi tindak lanjut koreksi belum dipastikan.'],
    ['Menandai angka meragukan untuk dijelaskan saat presentasi.', 'Tidak menyembunyikan keraguan, tetapi belum mencoba menyelesaikannya.'],
    ['Memakai angka versi terbaru tanpa memeriksa asalnya.', 'Kemutakhiran tidak menjamin ketepatan.'],
    ['Memilih angka yang membuat hasil terlihat paling baik.', 'Menyesatkan laporan demi kesan positif.']]],
  ['PROFESIONALISME', 'Anda diberi tugas baru yang memerlukan kemampuan yang belum dikuasai. Tenggat masih cukup untuk belajar. Anda akan ...', [
    ['Memetakan kebutuhan, belajar dari panduan, meminta pendampingan, dan memeriksa hasil awal.', 'Mengembangkan kemampuan dengan kontrol kualitas.'],
    ['Meminta pendampingan rekan berpengalaman untuk mengerjakan tahap awal.', 'Membantu belajar tetapi rencana kemandirian belum lengkap.'],
    ['Mencoba sendiri dengan panduan yang tersedia.', 'Ada inisiatif, namun pemeriksaan dan dukungan kurang.'],
    ['Menolak tugas sebelum mempelajari kebutuhannya.', 'Tidak mencoba peluang belajar yang tersedia.'],
    ['Mengaku ahli lalu menyerahkan hasil tanpa pemeriksaan.', 'Tidak jujur tentang kemampuan dan berisiko salah hasil.']]],
  ['PROFESIONALISME', 'Anda melihat langkah pemeriksaan mutu sering dilewati agar pekerjaan cepat. Anda akan ...', [
    ['Menjelaskan risiko, menjalankan pemeriksaan, dan mengusulkan perbaikan proses bila terlalu lambat.', 'Menjaga mutu sekaligus mencari efisiensi yang sah.'],
    ['Tetap melakukan pemeriksaan pada pekerjaan Anda.', 'Melindungi mutu sendiri, tetapi masalah tim belum diatasi.'],
    ['Menyampaikan kekhawatiran kepada rekan saat ada kesempatan.', 'Ada kepedulian, namun tindakan nyata belum jelas.'],
    ['Mengikuti kebiasaan karena semua orang melakukannya.', 'Mengabaikan kontrol hanya karena tekanan kebiasaan.'],
    ['Mencatat pemeriksaan telah dilakukan padahal dilewati.', 'Memalsukan bukti kontrol mutu.']]],
  ['PROFESIONALISME', 'Anda akan cuti dan masih memegang pekerjaan yang perlu ditindaklanjuti saat Anda pergi. Anda akan ...', [
    ['Menyusun status, dokumen, tenggat, dan penanggung jawab pengganti lalu melakukan serah terima.', 'Menjaga kesinambungan dan kejelasan tanggung jawab.'],
    ['Mengirim ringkasan status kepada atasan sebelum cuti.', 'Informasi tersampaikan, tetapi pelaksana pengganti belum dipastikan.'],
    ['Merapikan dokumen di folder bersama tanpa penjelasan.', 'Dokumen tersedia, tetapi konteks tindak lanjut terbatas.'],
    ['Menunggu rekan bertanya setelah Anda cuti.', 'Membuat tindak lanjut bergantung pada respons selama cuti.'],
    ['Menghapus pekerjaan yang belum selesai dari daftar tugas.', 'Menyembunyikan kewajiban yang masih ada.']]],
  ['PROFESIONALISME', 'Hasil pekerjaan Anda dikritik karena tidak memenuhi satu kriteria yang memang terlewat. Anda akan ...', [
    ['Mengakui bagian yang terlewat, memperbaikinya, dan menambahkan pemeriksaan untuk pekerjaan berikutnya.', 'Menyelesaikan kesalahan dan mencegah pengulangan.'],
    ['Memperbaiki bagian tersebut sesuai kriteria.', 'Kesalahan sekarang selesai, tetapi pencegahan belum direncanakan.'],
    ['Meminta penjelasan ulang kriteria sebelum mulai memperbaiki.', 'Klarifikasi berguna, tetapi kesalahan yang sudah jelas belum ditindaklanjuti.'],
    ['Membela hasil karena bagian lainnya sudah baik.', 'Menghindari kriteria yang belum terpenuhi.'],
    ['Mengubah catatan kriteria agar pekerjaan tampak memenuhi.', 'Memanipulasi dasar penilaian.']]],
  ['PROFESIONALISME', 'Dalam rapat kemajuan, pekerjaan Anda baru selesai separuh sementara target hari itu seharusnya selesai. Anda akan ...', [
    ['Melaporkan kemajuan nyata, sebab keterlambatan, dan rencana pemulihan yang terukur.', 'Informasi jujur disertai solusi yang dapat dipantau.'],
    ['Melaporkan kemajuan nyata dan meminta bantuan untuk menyelesaikan.', 'Jujur dan mencari dukungan, tetapi rencana belum rinci.'],
    ['Menyampaikan bahwa tugas belum selesai tanpa menjelaskan kebutuhan lanjut.', 'Status benar, namun tim sulit menentukan bantuan.'],
    ['Menghindari rapat agar tidak ditanya.', 'Menghambat koordinasi tentang keterlambatan.'],
    ['Melaporkan tugas sudah selesai dan berharap dapat mengejar kemudian.', 'Memalsukan status sehingga keputusan tim dapat salah.']]],
  ['ANTI_RADIKALISME', 'Dalam grup kerja muncul ajakan mengucilkan rekan karena keyakinannya. Anda akan ...', [
    ['Menolak ajakan secara tenang, mendukung rekan terdampak, dan melaporkan melalui jalur yang sesuai.', 'Menghentikan normalisasi diskriminasi dan mendukung penanganan.'],
    ['Mengingatkan grup agar tidak membedakan rekan berdasarkan keyakinan.', 'Menolak diskriminasi, tetapi dukungan dan tindak lanjut belum lengkap.'],
    ['Tidak ikut ajakan dan menghubungi rekan terdampak secara pribadi.', 'Memberi dukungan, tetapi ajakan di grup belum ditangani.'],
    ['Diam agar tidak dianggap berbeda dari kelompok.', 'Membiarkan ajakan berkembang tanpa keberatan.'],
    ['Ikut mengucilkan agar diterima anggota grup.', 'Turut melakukan diskriminasi.']]],
  ['ANTI_RADIKALISME', 'Rekan membagikan konten yang membenarkan kekerasan terhadap kelompok berbeda pendapat. Anda akan ...', [
    ['Tidak menyebarkan, menyampaikan keberatan, dan menggunakan kanal pelaporan yang tepat.', 'Membatasi penyebaran serta mendorong penanganan tanpa kekerasan.'],
    ['Mengajak rekan memeriksa konten dan menjelaskan mengapa pembenaran kekerasan bermasalah.', 'Memberi koreksi, tetapi pelaporan konten berbahaya belum ditangani.'],
    ['Tidak meneruskan konten dan meninggalkan percakapan.', 'Tidak menambah penyebaran, namun sumber masalah tetap berlangsung.'],
    ['Meneruskan konten sebagai bahan hiburan.', 'Memperluas pembenaran kekerasan.'],
    ['Menambahkan dukungan terhadap ancaman dalam konten.', 'Memperkuat ajakan kekerasan.']]],
  ['ANTI_RADIKALISME', 'Perdebatan kebijakan di kantor berubah menjadi ancaman terhadap keselamatan seorang peserta. Anda akan ...', [
    ['Memprioritaskan keselamatan, menghentikan interaksi berisiko secara aman, dan meminta bantuan berwenang.', 'Menangani ancaman nyata tanpa memicu pembalasan.'],
    ['Segera meminta bantuan keamanan tanpa ikut berkonfrontasi.', 'Mengaktifkan bantuan yang tepat, meski pengaturan keselamatan belum rinci.'],
    ['Mengajak peserta yang terancam menjauh dari lokasi.', 'Mengurangi risiko langsung tetapi bantuan penanganan belum diminta.'],
    ['Merekam dan menyebarkan ancaman tanpa mencari bantuan.', 'Dokumentasi publik tidak menggantikan perlindungan keselamatan.'],
    ['Membalas ancaman dengan kekerasan.', 'Meningkatkan risiko terhadap semua pihak.']]],
  ['ANTI_RADIKALISME', 'Seorang teman mengajak Anda menghadiri pertemuan yang mensyaratkan kebencian kepada kelompok tertentu. Anda akan ...', [
    ['Menolak dan mengajak teman memilih forum dialog yang menghormati perbedaan.', 'Menjaga sikap damai dan menawarkan alternatif konstruktif.'],
    ['Menolak dengan menjelaskan keberatan terhadap syarat kebencian.', 'Menyampaikan batas prinsip secara jelas.'],
    ['Tidak hadir tanpa menjelaskan alasan.', 'Tidak terlibat, tetapi kesempatan meluruskan ajakan terlewat.'],
    ['Hadir agar pertemanan tidak terganggu.', 'Menerima forum yang mendasarkan partisipasi pada kebencian.'],
    ['Membantu mengajak orang lain dengan syarat yang sama.', 'Memperluas rekrutmen berdasarkan kebencian.']]],
  ['ANTI_RADIKALISME', 'Anda mendengar tuduhan ekstremisme terhadap seorang rekan hanya berdasarkan pakaian, tanpa bukti perilaku. Anda akan ...', [
    ['Menolak pelabelan berbasis penampilan dan meminta kekhawatiran dinilai berdasarkan perilaku serta bukti.', 'Mencegah prasangka sambil tetap membuka penilaian faktual.'],
    ['Mengingatkan bahwa pakaian saja tidak cukup untuk menilai seseorang.', 'Meluruskan dasar tuduhan, tetapi cara menangani kekhawatiran belum dijelaskan.'],
    ['Tidak ikut membicarakan tuduhan itu.', 'Tidak menambah rumor, namun tuduhan tidak dikoreksi.'],
    ['Menjauhi rekan tersebut untuk berjaga-jaga.', 'Memberi dampak sosial pada tuduhan tanpa bukti.'],
    ['Menyebarkan tuduhan ke unit lain.', 'Memperbesar stigma tanpa dasar.']]],
  ['ANTI_RADIKALISME', 'Sebuah diskusi warga membahas isu sensitif dan peserta mulai memakai hinaan terhadap kelompok lain. Anda menjadi moderator. Anda akan ...', [
    ['Menghentikan hinaan, menegaskan aturan diskusi, dan mengarahkan kembali pada persoalan dengan alasan faktual.', 'Menjaga ruang dialog aman serta tetap membahas substansi.'],
    ['Mengingatkan peserta agar memakai bahasa yang menghormati pihak lain.', 'Mengoreksi perilaku, tetapi arah pembahasan belum dipulihkan.'],
    ['Memberi jeda singkat agar peserta lebih tenang.', 'Mengurangi ketegangan sementara tanpa menegaskan batas perilaku.'],
    ['Membiarkan hinaan agar semua bebas berbicara.', 'Kebebasan diskusi digunakan untuk membenarkan perendahan kelompok.'],
    ['Ikut memakai hinaan kepada kelompok yang tidak Anda setujui.', 'Moderator memperkuat permusuhan dan kehilangan netralitas.']]],
  ['ANTI_RADIKALISME', 'Pesan anonim mengajak merusak fasilitas umum untuk memaksakan tuntutan. Anda akan ...', [
    ['Tidak mengikuti atau menyebarkan ajakan, menyimpan informasi yang diperlukan, dan melapor melalui kanal berwenang.', 'Menolak perusakan dan membantu penanganan informasi secara aman.'],
    ['Melaporkan pesan melalui fasilitas pelaporan platform.', 'Memulai penanganan, tetapi ancaman pada fasilitas belum tentu sampai ke pihak terkait.'],
    ['Menghapus pesan tanpa meneruskannya.', 'Tidak ikut menyebarkan, namun informasi ancaman tidak ditindaklanjuti.'],
    ['Meneruskan pesan tanpa komentar kepada banyak grup.', 'Memperluas ajakan perusakan meskipun tanpa dukungan tertulis.'],
    ['Membantu menyiapkan alat untuk merusak fasilitas.', 'Berpartisipasi langsung dalam tindakan merusak.']]]
];

export function makeTkp(tuple: Situation, position: number): QuestionInput {
  const [topic, prompt, responses] = tuple;
  const base = makeSingle('TWK', [topic, prompt, responses.map(r => r[0]), ''], position);
  const q: QuestionInput = { ...base, subtest_code: 'TKP', scoring_mode: 'weighted_options' };
  delete q.correct_option_code;
  delete q.score_correct;
  delete q.score_wrong;
  q.options = base.options.map(o => ({ ...o, score: 5 - responses.findIndex(r => r[0] === o.text_md) }));
  q.explanation_md = 'Rubrik latihan lokal; bobot ini bukan kunci resmi BKN. ' + responses.map(([text, why], i) => `Nilai ${5-i}: “${text}” ${why}`).join('\n\n');
  return q;
}
