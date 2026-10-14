# NiaeDrinks — Setup Google Sheets + Admin Panel

## Ringkasan Fitur Baru

- Database produk pakai **Google Sheets**
- Sheet + header **otomatis digenerate** dari script (tidak perlu buat manual)
- Admin panel muncul dengan **klik logo 4 kali berturut-turut**
- Password admin: `Bismillaah` (disimpan di **Script Properties**, tidak pernah di GitHub Pages)
- CRUD penuh: Create, Read, Update, Delete produk
- Frontend hanya menyimpan URL Web App (aman)

---

## Langkah 1: Buat Apps Script

1. Buka https://script.google.com → **New project**
2. Hapus semua kode default
3. Copy-paste seluruh isi file **`Code.gs`**
4. Simpan project (Ctrl+S) → beri nama misalnya `NiaeDrinks Backend`

## Langkah 2: Jalankan Setup Database

1. Di editor Apps Script, pilih fungsi **`setupDatabase`** di dropdown
2. Klik **Run**
3. Izinkan permission (pilih akun Google kamu → Advanced → Go to ... → Allow)
4. Buka **View → Logs** (atau Execution log). Harusnya muncul:
   - Spreadsheet baru dibuat
   - Setup selesai
5. Cek **Project Settings** (ikon gerigi kiri) → **Script properties**
   - Harus ada `ADMIN_PASSWORD` = `Bismillaah`
   - Harus ada `SPREADSHEET_ID`

> Spreadsheet bisa dilihat di Google Drive kamu dengan nama **NiaeDrinks Database**.

## Langkah 3: Deploy sebagai Web App

1. Klik **Deploy** → **New deployment**
2. Jenis: **Web app**
3. Description: `v1`
4. **Execute as**: Me
5. **Who has access**: **Anyone**
6. Klik **Deploy**
7. Copy **Web app URL** (bentuknya `https://script.google.com/macros/s/....../exec`)

> Setiap kali kamu ubah kode, buat **New deployment** lagi (atau Manage deployments → Edit → New version).

## Langkah 4: Update Frontend

1. Ganti file-file di repository GitHub Pages kamu dengan:
   - `index.html`
   - `style.css`
   - `script.js`
2. Di **`script.js`**, ganti baris ini:

```js
const WEB_APP_URL = 'YOUR_WEB_APP_URL';
```

dengan URL Web App yang sudah di-copy.

3. Commit & push ke GitHub. Tunggu beberapa detik sampai GitHub Pages update.

## Cara Pakai Admin

1. Buka website
2. **Klik logo "niaedrinks" sebanyak 4 kali** (cepat, dalam ~1.5 detik)
3. Muncul modal password → ketik `Bismillaah`
4. Panel Admin muncul:
   - Lihat semua produk
   - Tambah produk baru
   - Edit
   - Hapus
5. Perubahan langsung terlihat di menu depan (setelah refresh otomatis)

## Catatan Keamanan

- Password **tidak pernah** disimpan di file frontend / GitHub
- Hanya ada di Script Properties Apps Script
- Setiap request admin wajib kirim password (dicek di server)
- URL Web App memang public, tapi tanpa password tidak bisa CRUD

## Struktur Sheet Products

| id | name | price | description | image | active | created_at | updated_at |
|----|------|-------|-------------|-------|--------|------------|------------|

- `price` disimpan dalam angka penuh (18000 = Rp18k)
- `active` = TRUE/FALSE (hanya yang TRUE yang tampil di menu depan)

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "WEB_APP_URL belum di-set" | Ganti konstanta di script.js |
| Unauthorized / Password salah | Pastikan Script Properties `ADMIN_PASSWORD` = Bismillaah |
| Gagal memuat menu | Cek apakah sudah Deploy dengan "Anyone" |
| Sheet kosong | Jalankan lagi `setupDatabase` |
| CORS error | Pastikan pakai method POST + Content-Type text/plain |

---

Selamat! Sekarang website kamu sudah punya database + admin panel yang aman.
