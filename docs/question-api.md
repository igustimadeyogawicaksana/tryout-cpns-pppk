# API unggah bank soal

Endpoint ini menerima soal buatan skrip atau hasil Gemini/OpenAI/Claude dari aplikasi Anda. Tidak memanggil provider AI dan tidak memerlukan impor berkas manual. Semua soal masuk **draft**; publikasi tetap melalui review admin. Target persiapan pengguna adalah CPNS 2027, tetapi API ini tidak membuktikan kesesuaian kisi-kisi atau kebenaran isi soal.

## Aktivasi dan token

Jalankan pada server/workspace yang memiliki database dan `.env`:

```sh
npm run api:token -- email-admin
```

Email harus milik admin yang sudah ada. Token acak disimpan di `.local/question-api-token.txt`; `.env` hanya menyimpan SHA-256 token (`QUESTIONS_API_TOKEN_SHA256`) dan ID admin (`QUESTIONS_API_USER_ID`). Keduanya diabaikan Git. Restart aplikasi. Di Dokploy, set kedua variabel tersebut lewat environment server dan gunakan HTTPS. Set `BODY_SIZE_LIMIT=4M` pada adapter Node; endpoint tetap membatasi body sampai 2.000.000 byte. Compose sudah meneruskan variabel ini.

Simpan bearer token di environment **skrip/backend pemanggil**, jangan pada frontend, prompt AI, log atau repositori. Cookie login admin saja tidak cukup untuk API ini. Satu token hanya memberi kemampuan menambah draft melalui dua endpoint ini, bukan mengubah, membaca atau menerbitkan soal. Penghapusan hak admin pemilik langsung membuat token ditolak. Untuk menonaktifkan API, kosongkan konfigurasi dan restart; untuk rotasi, jalankan perintah yang sama dengan `--rotate`, restart lalu perbarui token pada pemanggil. MVP mendukung satu token server; pembatasan 60 permintaan terautentikasi/menit berbagi satu instance dan reset saat restart.

## Endpoint

| Metode/path | Body | Hasil |
|---|---|---|
| `POST /api/admin/questions` | Satu objek soal | Satu draft |
| `POST /api/admin/questions/batch` | `{ "questions": [soal1, soal2] }` | 1–100 draft secara atomik |

Header wajib: `Authorization: Bearer TOKEN`, `Content-Type: application/json`, `Idempotency-Key: kode-permintaan-unik`. Kunci 8–128 karakter, huruf/angka/`-`/`_`. Gunakan **kunci yang sama dan isi yang sama** saat retry setelah timeout/putus jaringan. Kunci sama dengan isi berbeda menghasilkan 409. Kode `external_key` yang sudah ada juga menghasilkan 409, tanpa menimpa soal lama. Validasi dilakukan sebelum penyimpanan; satu soal invalid membatalkan seluruh batch.

Format tiap soal mengikuti [contoh lengkap](../examples/question-bank-import.json): gunakan objek dalam array `questions`, bukan pembungkus `schema_version`/`batch_key`. Opsi A–E tepat lima dan unik; bobot, pembahasan, topik, sumber, dasar hak penggunaan wajib lengkap. TWK/TIU memakai satu kunci; TKP dapat memakai bobot setiap opsi. `status`, ID internal dan properti yang tidak dikenal ditolak. Keterangan sumber sebaiknya menyebut target tahun, tahun referensi, dokumen, halaman/diktum, serta bahwa isi merupakan latihan buatan AI yang perlu pemeriksaan manusia. API memvalidasi struktur dan konsistensi dasar, bukan keaslian referensi atau aturan tahun seleksi.

## Contoh Node.js: hasil AI langsung dikirim

`generatedQuestions` adalah array objek soal yang sudah dihasilkan dan dipetakan ke format bank soal oleh skrip Anda. Tidak perlu menulis berkas JSON.

```js
async function uploadQuestions(generatedQuestions, requestKey) {
  const response = await fetch(`${process.env.BANK_SOAL_URL}/api/admin/questions/batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.BANK_SOAL_TOKEN}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': requestKey
    },
    body: JSON.stringify({ questions: generatedQuestions })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.error.message}`);
  return result;
}
// Buat dan simpan requestKey sekali per kiriman; jangan membuat ulang saat retry.
// await uploadQuestions(generatedQuestions, 'cpns2027-tiu-batch-0001');
```

Untuk satu soal, ubah path menjadi `/api/admin/questions` dan body menjadi `JSON.stringify(generatedQuestion)`.

Respons baru HTTP 201; retry yang sudah tersimpan HTTP 200:

```json
{
  "count": 1,
  "repeated": false,
  "items": [{
    "external_key": "LATIHAN-TIU-001",
    "question_id": "uuid-soal",
    "version_id": "uuid-versi",
    "admin_url": "/admin/questions/uuid-versi"
  }],
  "batch_key": "api-hash-permintaan",
  "initial_status": "draft"
}
```

`initial_status` adalah status saat dibuat, bukan status terkini setelah review. Retry mengembalikan ID versi pertama yang sama. Aktor pemilik token dan kegiatan `question.api_upload` dicatat bersama transaksi penyimpanan.

| HTTP | Makna |
|---|---|
| 400 | JSON/kunci permintaan tidak valid |
| 401 | Bearer token tidak ada/salah |
| 403 | Pemilik bukan admin aktif; framework juga dapat menolak form lintas origin |
| 409 | Kode soal duplikat atau kunci dipakai untuk isi berbeda |
| 413 | Body terlalu besar |
| 415 | Gunakan application/json |
| 422 | Struktur atau kelengkapan soal gagal validasi |
| 429 | Tunggu Retry-After sebelum mengulang |
| 503 | API belum dikonfigurasi |
| 500 | Penyimpanan gagal; ulangi dengan kunci yang sama |

Kesalahan endpoint berbentuk `{ "error": { "code": "...", "message": "..." } }`. Reverse proxy/framework bisa memberi format berbeda sebelum request mencapai endpoint. CORS lintas origin tidak dibuka: integrasi ditujukan untuk backend-ke-backend. CSV dan pembuatan soal otomatis oleh aplikasi bukan bagian endpoint ini.
