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
const twkFacts = [
  ['Lambang sila pertama Pancasila adalah …', ['Bintang', 'Rantai', 'Pohon beringin', 'Kepala banteng', 'Padi dan kapas'], 'A', 'Bintang melambangkan sila Ketuhanan Yang Maha Esa.'],
  ['Semboyan Bhinneka Tunggal Ika berasal dari kitab …', ['Negarakertagama', 'Sutasoma', 'Pararaton', 'Arjunawiwaha', 'Nagarakretagama'], 'B', 'Bhinneka Tunggal Ika berasal dari Kakawin Sutasoma karya Mpu Tantular.'],
  ['UUD 1945 disahkan pada tanggal …', ['17 Agustus 1945', '18 Agustus 1945', '20 Mei 1908', '28 Oktober 1928', '10 November 1945'], 'B', 'UUD 1945 disahkan oleh PPKI pada 18 Agustus 1945.'],
  ['Lembaga yang berwenang mengubah dan menetapkan UUD adalah …', ['DPR', 'MPR', 'DPD', 'Mahkamah Konstitusi', 'Presiden'], 'B', 'UUD 1945 memberikan kewenangan perubahan dan penetapan UUD kepada MPR.'],
  ['Warna putih pada bendera Indonesia melambangkan …', ['Keberanian', 'Kesucian', 'Keadilan', 'Kemakmuran', 'Persatuan'], 'B', 'Warna putih melambangkan kesucian.'],
  ['Sumpah Pemuda diikrarkan pada tahun …', ['1908', '1928', '1945', '1955', '1998'], 'B', 'Sumpah Pemuda diikrarkan pada Kongres Pemuda II tahun 1928.'],
  ['Contoh pengamalan sila kedua adalah …', ['Menolong korban bencana tanpa membeda-bedakan', 'Memaksakan keyakinan', 'Mengutamakan daerah sendiri', 'Menghindari musyawarah', 'Mengabaikan aturan'], 'A', 'Kemanusiaan yang adil dan beradab mendorong kepedulian tanpa diskriminasi.'],
  ['Musyawarah untuk mufakat merupakan pengamalan sila ke …', ['Satu', 'Dua', 'Tiga', 'Empat', 'Lima'], 'D', 'Musyawarah untuk mufakat merupakan inti sila keempat.'],
  ['Bahasa Indonesia berkedudukan sebagai bahasa negara sejak …', ['Sumpah Pemuda', 'Proklamasi', 'Dekrit Presiden', 'Reformasi', 'Konferensi Asia Afrika'], 'B', 'Bahasa Indonesia ditegaskan sebagai bahasa persatuan dalam Sumpah Pemuda dan sebagai bahasa negara dalam UUD 1945.'],
  ['Sikap yang tepat terhadap produk budaya daerah adalah …', ['Merendahkan', 'Melestarikan dan menghargai', 'Menghapus', 'Mengklaim milik sendiri', 'Membatasi'], 'B', 'Menghargai dan melestarikan budaya memperkuat identitas nasional.']
];
const makeGenerated = (row, index) => {
  if (row.subtest_code === 'TWK') {
    const [prompt, options, correct, explanation] = twkFacts[index % twkFacts.length];
    return [row.topic_code || 'NASIONALISME', `${prompt} (Latihan ${index + 1})`, options, correct, explanation];
  }
  if (row.subtest_code === 'TIU') {
    const n = index + 3; const answer = n * 7 + 4; const options = [answer - 8, answer - 3, answer, answer + 5, answer + 9].map(String);
    return ['NUMERIK', `Jika pola bertambah 7 dimulai dari ${n}, nilai suku berikutnya setelah ${n * 7 - 3} adalah … (Latihan ${index + 1})`, options, 'C', `Nilai berikutnya diperoleh dengan menambahkan 7: ${n * 7 - 3} + 7 = ${answer}.`];
  }
  const situations = ['antrean layanan', 'rapat tim', 'verifikasi dokumen', 'keamanan akun', 'target laporan'];
  const action = ['menjelaskan prosedur dengan sopan', 'membagi tugas dan menyepakati tenggat', 'memeriksa data sebelum memproses', 'melaporkan melalui kanal resmi', 'menyampaikan risiko dan estimasi'];
  const topic = row.topic_code; const context = situations[index % situations.length]; const best = action[index % action.length];
  const options = [best, 'Mengabaikan sampai masalah hilang', 'Menyalahkan pihak lain tanpa klarifikasi', 'Melewati prosedur agar cepat', 'Menyimpan masalah tanpa laporan'];
  return [topic, `Dalam situasi ${context} nomor ${index + 1}, tindakan paling tepat adalah …`, options, 'A', `Pilihan A paling tepat karena menunjukkan ${best.toLowerCase()} dengan tetap menjaga aturan dan pelayanan.`];
};
const tx = db.transaction(() => {
  const rows = db.prepare("select qv.id,qv.content,qv.subtest_code,qv.topic_code from question_versions qv join questions q on q.id=qv.question_id where q.external_key like 'CPNS-SKD-TRIAL-%' order by q.external_key").all();
  const update = db.prepare('update question_versions set content=?, topic_code=?, updated_at=? where id=?');
  const updateItems = db.prepare('update exam_items set content=? where version_id=?');
  const now = Date.now();
  const prompts = new Set();
  rows.forEach((row, index) => {
    const [topic, prompt, options, correct, explanation] = makeGenerated(row, index);
    if (prompts.has(prompt)) throw new Error(`Duplicate prompt generated at ${index + 1}`);
    prompts.add(prompt);
    const content = JSON.parse(row.content);
    content.topic_code = topic;
    content.prompt_md = prompt;
    content.options = options.map((text, i) => ({ code: String.fromCharCode(65 + i), text_md: text, ...(row.subtest_code === 'TKP' ? { score: 5 - i } : {}) }));
    content.correct_option_code = correct;
    content.explanation_md = explanation;
    content.source_note = 'Soal latihan orisinal untuk simulasi aplikasi; bukan soal resmi BKN dan perlu ditinjau pengelola.';
    update.run(JSON.stringify(content), topic, now, row.id);
    updateItems.run(JSON.stringify(content), row.id);
  });
  console.log(`Updated ${rows.length} trial questions.`);
});
tx();
db.close();
