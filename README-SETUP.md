# NiaeDrinks — Setup Google Sheets + Admin Panel

## Langkah Setup

### 1. Buat project Apps Script
1. Buka https://script.google.com → **New project**
2. Hapus kode default, paste seluruh isi **Code.gs**
3. Simpan (Ctrl+S), beri nama misalnya `NiaeDrinks Backend`

### 2. Jalankan setupDatabase
1. Di dropdown fungsi (atas), pilih **`setupDatabase`**
2. Klik **Run** ▶️
3. Kalau muncul izin:
   - Review permissions → pilih akun → **Advanced** → **Go to ... (unsafe)** → **Allow**
4. Buka **View → Executions**
5. Harus ada log:
   ```
   1/5 Password admin diset
   2/5 Spreadsheet BARU dibuat
   ...
   🎉 SETUP SELESAI!
   Jumlah baris di sheet: 5
   Spreadsheet URL: https://docs.google.com/...
   ```
6. **Klik link Spreadsheet URL** di log itu → pastikan sheet `Products` ada isinya (4 produk)

### 3. Kalau sheet masih kosong
Jalankan fungsi **`forceSeedData`** (pilih di dropdown lalu Run).

Atau jalankan **`showSpreadsheetUrl`** untuk lihat link spreadsheet yang dipakai.

### 4. Deploy Web App
1. **Deploy** → **New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Deploy → copy **Web app URL**

### 5. Update frontend
Di file **script.js**, ganti:
```js
const WEB_APP_URL = 'YOUR_WEB_APP_URL';
```
dengan URL Web App tadi.

Upload ke GitHub Pages.

---

## Cara pakai Admin
- Klik logo **niaedrinks** sebanyak **4 kali** berturut-turut
- Password: `Bismillaah`
- CRUD produk langsung dari panel

## Troubleshooting Sheet Kosong

| Gejala | Solusi |
|--------|--------|
| Log bilang SETUP SELESAI tapi sheet kosong | Jalankan `forceSeedData` |
| Tidak tahu spreadsheet mana | Jalankan `showSpreadsheetUrl`, buka linknya |
| Error permission | Ulangi Allow (Advanced → Go to unsafe) |
| Data lama menumpuk | `setupDatabase` akan clear lalu isi ulang |

Password & Spreadsheet ID disimpan di **Project Settings → Script properties**. Tidak pernah ada di GitHub.
