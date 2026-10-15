# NiaeDrinks v3 — Admin + Pesanan (nama & WA)

## Spreadsheet
https://docs.google.com/spreadsheets/d/1P5YPbWzCnhbWbwbi65r5dgwocJcwBjIHCjRM7QlK0Z0/edit

- **Products** — menu
- **Orders** — id, created_at, customer_name, customer_wa, items, total, customer_note, status  
  status: `new` | `answered` | `served`

## Setup (setelah ganti Code.gs)
1. Run `setSpreadsheetId`
2. Run `setupDatabase` (atau cukup buka site & createOrder — sheet Orders di-migrasi otomatis)
3. **Deploy → New deployment** → Anyone
4. Update `WEB_APP_URL` di script.js
5. Upload index.html, style.css, script.js ke GitHub Pages

## Fitur baru
- Tombol **Admin** di header → password `Bismillaah`
- Panel: tab **Pesanan** (lihat / ubah status) + tab **Produk** (CRUD)
- Checkout: minta **nama + nomor WA** → simpan ke Orders → notifikasi → buka WA
