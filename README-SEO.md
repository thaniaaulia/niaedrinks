# Panduan SEO NiaeDrinks (nnthan.my.id)

## File yang ditambahkan/diperbaiki di ZIP ini

| File | Fungsi |
|------|--------|
| `robots.txt` | Mengizinkan crawler + menunjuk ke sitemap |
| `sitemap.xml` | Sitemap XML sederhana (1 halaman) |
| `favicon.ico` | Favicon klasik |
| `index.html` | Meta SEO lengkap, OG, Twitter Card, JSON-LD, favicon links, canonical, theme-color |
| `site.webmanifest` | PWA manifest diperbarui |

File lain (CSS, JS, gambar, Code.gs, CNAME, favicon-*.png, og-image.*) tetap dari repo asli.

## Cara deploy

1. Extract ZIP ini.
2. Upload **semua file** ke root repository GitHub `thaniaaulia/niaedrinks` (overwrite yang sudah ada).
3. Commit & push ke branch `main`.
4. Tunggu GitHub Pages rebuild (biasanya 1–2 menit). Domain custom sudah pakai CNAME `nnthan.my.id`.

## Langkah SEO setelah deploy (WAJIB)

### 1. Google Search Console
- Buka: https://search.google.com/search-console
- Tambah property: **URL prefix** → `https://nnthan.my.id`
- Verifikasi (paling mudah: HTML tag atau DNS TXT jika domain kamu).
- Setelah verified → **Sitemaps** → submit `https://nnthan.my.id/sitemap.xml`
- Minta indexing halaman utama (URL Inspection → Request indexing)

### 2. Bing Webmaster Tools
- https://www.bing.com/webmasters
- Add site `https://nnthan.my.id`
- Submit sitemap yang sama

### 3. Tes Open Graph / Preview
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
  - Masukkan `https://nnthan.my.id/` → Scrape Again
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Twitter/X Card Validator: https://cards-dev.twitter.com/validator (atau cukup share di X)
- WhatsApp: kirim link ke diri sendiri / teman, cek preview

### 4. Cek teknis
- robots.txt: https://nnthan.my.id/robots.txt
- sitemap: https://nnthan.my.id/sitemap.xml
- og-image: https://nnthan.my.id/og-image.png
- favicon: https://nnthan.my.id/favicon.ico

### 5. Opsional lanjutan
- Google Business Profile (jika ada lokasi fisik)
- Instagram / TikTok bio link ke website
- Buat konten (blog/story) yang backlink ke site
- Nanti kalau produk banyak, update `sitemap.xml` + tambah page produk individual + Product schema

## Catatan
- Site single-page, jadi sitemap hanya 1 URL.
- Jangan ubah URL og-image tanpa update meta + re-scrape.
- Cache OG bisa lama (WhatsApp/Facebook). Gunakan debugger untuk force refresh.
