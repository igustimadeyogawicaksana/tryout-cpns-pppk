import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL?.replace(/^file:/, '') || 'data/app.sqlite');
const twk = [
  ['NASIONALISME', 'Sikap yang paling mencerminkan nasionalisme dalam keberagaman adalah …', ['Mengutamakan kelompok sendiri', 'Menghargai perbedaan dan menjaga persatuan', 'Menolak budaya daerah lain', 'Memaksakan pendapat mayoritas', 'Menghindari kerja sama'], 'B', 'Nasionalisme diwujudkan dengan menghargai keberagaman dan menjaga persatuan.'],
  ['INTEGRITAS', 'Ketika menemukan kesalahan data dalam laporan yang sudah dikirim, tindakan yang tepat adalah …', ['Membiarkannya agar tidak disalahkan', 'Menghapus jejak kesalahan', 'Melaporkan dan memperbaiki dengan transparan', 'Menyalahkan rekan kerja', 'Menunggu sampai ada yang bertanya'], 'C', 'Integritas berarti jujur, bertanggung jawab, dan memperbaiki kesalahan secara terbuka.'],
  ['PILAR_NEGARA', 'Pancasila sebagai dasar negara berarti …', ['Hanya berlaku dalam upacara', 'Menjadi landasan penyelenggaraan negara', 'Dapat diganti oleh kebiasaan', 'Berlaku untuk satu golongan', 'Tidak terkait peraturan'], 'B', 'Pancasila menjadi dasar dan sumber nilai dalam penyelenggaraan negara.'],
  ['BELA_NEGARA', 'Contoh bela negara dalam kehidupan sehari-hari adalah …', ['Menyebarkan berita tanpa memeriksa sumber', 'Mematuhi hukum dan menjaga kerukunan', 'Menghindari kewajiban warga', 'Menolak pelayanan publik', 'Mengutamakan kepentingan pribadi'], 'B', 'Bela negara dapat dilakukan melalui kepatuhan hukum dan kontribusi positif bagi masyarakat.'],
  ['BAHASA_NEGARA', 'Kalimat yang paling efektif adalah …', ['Para peserta-peserta wajib hadir.', 'Demi untuk kelancaran acara, harap tenang.', 'Peserta wajib hadir tepat waktu.', 'Ia adalah merupakan ketua panitia.', 'Rapat itu membahas tentang anggaran.'], 'C', 'Kalimat C hemat kata dan memiliki struktur yang jelas.']
];
const tiu = [
  ['NUMERIK', 'Sebuah barang seharga Rp240.000 mendapat diskon 15%. Harga setelah diskon adalah …', ['Rp196.000', 'Rp204.000', 'Rp216.000', 'Rp225.000', 'Rp276.000'], 'B', 'Diskon 15% dari Rp240.000 adalah Rp36.000, sehingga harga akhirnya Rp204.000.'],
  ['PERBANDINGAN', 'Enam pekerja menyelesaikan pekerjaan dalam 12 hari. Dengan kemampuan sama, delapan pekerja memerlukan …', ['6 hari', '8 hari', '9 hari', '12 hari', '16 hari'], 'C', 'Beban kerja 6 × 12 = 72 hari-orang. Dengan 8 pekerja, waktunya 72 ÷ 8 = 9 hari.'],
  ['VERBAL', 'Makna kata “akurat” yang paling tepat adalah …', ['Cepat', 'Tepat dan cermat', 'Banyak', 'Sementara', 'Berulang'], 'B', 'Akurat berarti tepat, teliti, dan bebas dari kesalahan berarti.'],
  ['SILOGISME', 'Semua arsip digital dicadangkan. Sebagian dokumen kantor adalah arsip digital. Kesimpulan yang tepat adalah …', ['Semua dokumen kantor dicadangkan', 'Sebagian dokumen kantor dicadangkan', 'Tidak ada dokumen yang dicadangkan', 'Semua cadangan adalah dokumen kantor', 'Arsip digital tidak dicadangkan'], 'B', 'Sebagian dokumen kantor yang merupakan arsip digital termasuk dalam arsip yang dicadangkan.'],
  ['FIGURAL', 'Pola bilangan 2, 6, 12, 20, 30, … dilanjutkan dengan …', ['36', '40', '42', '44', '48'], 'C', 'Selisihnya 4, 6, 8, 10, sehingga selisih berikutnya 12 dan hasilnya 42.']
];
const tkp = [
  ['PELAYANAN_PUBLIK', 'Warga datang saat loket hampir tutup dengan dokumen yang belum lengkap. Anda sebaiknya …', ['Menolak tanpa penjelasan', 'Memarahi warga', 'Menjelaskan kekurangan dan prosedur dengan sopan', 'Meminta warga mencari petugas lain', 'Menyelesaikan tanpa dokumen'], 'C', 'Pelayanan yang baik tetap mengikuti aturan sambil memberi penjelasan dan solusi yang jelas.'],
  ['JEJARING_KERJA', 'Rekan satu tim terlambat menyerahkan bagian pekerjaan sehingga jadwal terancam. Anda …', ['Langsung menyalahkannya', 'Mengerjakan diam-diam tanpa komunikasi', 'Menghubungi, mencari hambatan, dan menyepakati rencana pemulihan', 'Melaporkan sebelum berbicara', 'Membatalkan pekerjaan'], 'C', 'Kolaborasi efektif dimulai dari komunikasi, pemahaman hambatan, dan rencana tindak lanjut.'],
  ['SOSIAL_BUDAYA', 'Dalam rapat, cara bicara peserta berbeda karena latar budaya. Anda …', ['Menirukan logatnya', 'Meminta semua mengikuti cara Anda', 'Mendengarkan dan menjaga komunikasi tetap saling menghormati', 'Menghentikan rapat', 'Mengabaikan pendapatnya'], 'C', 'Sikap inklusif menghormati perbedaan dan menjaga tujuan bersama.'],
  ['TEKNOLOGI_INFORMASI', 'Anda menerima tautan mencurigakan yang meminta kata sandi akun kantor. Anda …', ['Membuka dan mengisi data', 'Meneruskan ke semua rekan', 'Tidak membuka, melaporkan, dan menghapusnya', 'Menyimpan untuk dicoba nanti', 'Membalas pengirim'], 'C', 'Tautan mencurigakan berisiko phishing; jangan dibuka dan laporkan melalui kanal resmi.'],
  ['PROFESIONALISME', 'Atasan meminta laporan selesai hari ini, tetapi data belum tervalidasi. Anda …', ['Mengarang data agar cepat selesai', 'Menunda tanpa kabar', 'Menyampaikan kondisi, memprioritaskan validasi, dan memberi estimasi realistis', 'Menghapus data yang belum lengkap', 'Meminta rekan menanggung risiko'], 'C', 'Profesional berarti menjaga kualitas dan menyampaikan risiko serta estimasi secara jujur.']
];

const choose = (arr, index) => arr[index % arr.length];
const tx = db.transaction(() => {
  const rows = db.prepare("select qv.id,qv.content,qv.subtest_code from question_versions qv join questions q on q.id=qv.question_id where q.external_key like 'CPNS-SKD-TRIAL-%' order by q.external_key").all();
  const update = db.prepare('update question_versions set content=?, topic_code=?, updated_at=? where id=?');
  const now = Date.now();
  rows.forEach((row, index) => {
    const bank = row.subtest_code === 'TWK' ? twk : row.subtest_code === 'TIU' ? tiu : tkp;
    const [topic, prompt, options, correct, explanation] = choose(bank, index);
    const content = JSON.parse(row.content);
    content.topic_code = topic;
    content.prompt_md = prompt;
    content.options = options.map((text, i) => ({ code: String.fromCharCode(65 + i), text_md: text, ...(row.subtest_code === 'TKP' ? { score: 5 - i } : {}) }));
    content.correct_option_code = correct;
    content.explanation_md = explanation;
    content.source_note = 'Soal latihan orisinal untuk simulasi aplikasi; bukan soal resmi BKN dan perlu ditinjau pengelola.';
    update.run(JSON.stringify(content), topic, now, row.id);
  });
  console.log(`Updated ${rows.length} trial questions.`);
});
tx();
db.close();
