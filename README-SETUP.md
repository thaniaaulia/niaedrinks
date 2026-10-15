# NiaeDrinks — Setup (versi jelas 1 spreadsheet)

## Spreadsheet yang DIPAKAI
Hanya satu ini:

https://docs.google.com/spreadsheets/d/1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0/edit

Spreadsheet lain (1W7Tx6Qad...) **TIDAK dipakai**. Abaikan saja.

---

## Urutan wajib di Apps Script

### 1. Paste Code.gs terbaru
Hapus semua kode lama → paste Code.gs dari zip ini → Save.

### 2. Kunci spreadsheet (sekali)
- Dropdown fungsi → pilih **`setSpreadsheetId`**
- Klik **Run**
- View → Executions → pastikan log bilang URL spreadsheet di atas

### 3. Buat sheet + data
- Dropdown → **`setupDatabase`**
- Klik **Run**
- Buka spreadsheet di atas → harus ada sheet **Products** berisi 4 produk

### 4. Cek (opsional)
- Jalankan **`whichSpreadsheet`** → lihat log URL-nya
- Atau **`forceSeedData`** kalau data masih kosong

### 5. Deploy Web App
1. Deploy → **New deployment** (penting: New, bukan Manage yang lama)
2. Type: Web app
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Deploy → **copy URL baru**
6. Paste URL itu ke `script.js` baris:
   ```js
   const WEB_APP_URL = 'https://script.google.com/macros/s/...../exec';
   ```
7. Upload script.js ke GitHub Pages

---

## Kenapa dulu bingung?
- Kamu buka Apps Script dari spreadsheet **1W7Tx6Qad...** (container-bound)
- Sementara script menyimpan data ke spreadsheet yang ID-nya di Script Properties
- Sekarang ID dikunci ke **1P5YPbWz...** saja

## Admin panel
Klik logo **niaedrinks** 4x → password: `Bismillaah`

## Kalau CRUD masih gagal
1. Pastikan sudah **New deployment** setelah ubah Code.gs
2. WEB_APP_URL di script.js harus URL deployment terbaru
3. Jalankan `whichSpreadsheet` → pastikan URL-nya 1P5YPbWz...
