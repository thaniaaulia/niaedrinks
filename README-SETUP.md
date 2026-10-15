# NiaeDrinks — Setup (Produk + Pesanan ke Google Sheet)

## Spreadsheet yang dipakai
https://docs.google.com/spreadsheets/d/1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0/edit

Akan ada 2 sheet:
- **Products** → daftar menu (dikelola admin)
- **Orders** → pesanan customer saat klik "Simpan pesanan & Chat WhatsApp"

## Setup Apps Script (wajib berurutan)

1. Paste **Code.gs** terbaru → Save
2. Run **`setSpreadsheetId`**
3. Run **`setupDatabase`** (membuat Products + Orders)
4. Cek spreadsheet: harus ada sheet Products & Orders
5. **Deploy → New deployment**
   - Type: Web app
   - Execute as: Me
   - Who has access: **Anyone**
6. Copy URL → paste ke `script.js` di baris `WEB_APP_URL`
7. Upload `script.js`, `index.html`, `style.css` ke GitHub Pages

## Alur customer
1. Add to Cart
2. Klik **Simpan pesanan & Chat WhatsApp**
3. Sistem **menyimpan ke sheet Orders** dulu
4. Muncul notifikasi sukses/gagal di layar
5. Jika sukses → WhatsApp terbuka dengan isi pesanan + nomor order

## Admin
Klik logo 4x → password `Bismillaah` → CRUD produk

## Tes dari editor Apps Script
- `testOrder` → menulis 1 baris uji ke sheet Orders
- `whichSpreadsheet` → cek URL & jumlah baris
