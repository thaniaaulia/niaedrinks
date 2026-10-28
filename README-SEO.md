# Panduan SEO Lengkap — NiaeDrinks (nnthan.my.id)

Repo sudah dilengkapi file SEO. Ikuti langkah di bawah setelah deploy ulang.

## File SEO yang ada di ZIP ini

| File | Fungsi |
|------|--------|
| `index.html` | Meta title/description, canonical, robots, theme-color, favicon links, Open Graph, Twitter Card, JSON-LD (FoodEstablishment + WebSite + WebPage) |
| `robots.txt` | Allow all + Sitemap + blokir file teknis |
| `sitemap.xml` | Sitemap 1 halaman (single-page site) |
| `site.webmanifest` | PWA / Add to Home Screen |
| `favicon.ico` + `favicon-*.png` | Favicon multi-ukuran (32, 64, 128, 180, 192, 512) |
| `og-image.png` | Gambar preview 1200×630 (WhatsApp, Facebook, X, LinkedIn) |
| `CNAME` | Domain custom GitHub Pages |

**Cara pakai ZIP:**  
Extract → upload **semua file** ke root repo `thaniaaulia/niaedrinks` (overwrite yang lama) → Commit & Push ke `main`.

---

## Langkah 1 — Deploy ulang (GitHub Pages)

1. Buka repo: https://github.com/thaniaaulia/niaedrinks
2. Upload / replace semua file dari ZIP ini ke root.
3. Commit message contoh: `SEO: update meta, schema, robots, sitemap`
4. Pastikan Settings → Pages → Source = Deploy from branch `main` / root.
5. Tunggu 1–3 menit sampai live di https://nnthan.my.id/

Cek cepat setelah deploy:
- https://nnthan.my.id/robots.txt
- https://nnthan.my.id/sitemap.xml
- https://nnthan.my.id/og-image.png
- https://nnthan.my.id/favicon.ico

---

## Langkah 2 — Google Search Console (WAJIB)

1. Buka: **https://search.google.com/search-console**
2. Klik **Add property** → pilih **URL prefix** → isi `https://nnthan.my.id`
3. Verifikasi (pilih salah satu yang paling mudah):
   - **HTML tag** → copy meta tag verifikasi → tempel di `<head>` index.html (sebelum `</head>`) → deploy ulang → klik Verify.
   - Atau **DNS** (TXT record) jika kamu kontrol domain di registrar.
4. Setelah verified:
   - Menu kiri → **Sitemaps** → submit: `https://nnthan.my.id/sitemap.xml`
   - Menu **URL Inspection** → masukkan `https://nnthan.my.id/` → **Request indexing**
5. (Opsional) Tambah property **Domain** juga (lebih kuat) lewat DNS TXT.

---

## Langkah 3 — Bing Webmaster Tools

1. Buka: **https://www.bing.com/webmasters**
2. Sign in dengan Microsoft account.
3. Add site → `https://nnthan.my.id`
4. Verifikasi (bisa import dari Google Search Console atau HTML/meta/DNS).
5. Submit sitemap: `https://nnthan.my.id/sitemap.xml`

---

## Langkah 4 — Tes & Refresh Open Graph / Social Preview

Cache sosial media sering lama. Force refresh:

| Platform | Link Tool | Cara |
|----------|-----------|------|
| Facebook / Instagram / WhatsApp | https://developers.facebook.com/tools/debug/ | Masukkan `https://nnthan.my.id/` → **Scrape Again** (bisa 2–3 kali) |
| LinkedIn | https://www.linkedin.com/post-inspector/ | Masukkan URL → Inspect |
| X (Twitter) | https://cards-dev.twitter.com/validator | Atau cukup share link di X dan lihat preview |
| WhatsApp | — | Kirim link ke diri sendiri / teman. Kalau masih lama, tunggu atau clear cache WhatsApp |

Pastikan preview menampilkan:
- Judul: NiaeDrinks | Soft Colors. Fresh Drinks. Good Vibes.
- Deskripsi yang bagus
- Gambar `og-image.png` (1200×630)

---

## Langkah 5 — Cek teknis tambahan

- PageSpeed / Core Web Vitals: https://pagespeed.web.dev/ → masukkan `https://nnthan.my.id/`
- Mobile-Friendly: https://search.google.com/test/mobile-friendly
- Rich Results Test (schema): https://search.google.com/test/rich-results → masukkan URL
- Schema Markup Validator: https://validator.schema.org/

---

## Langkah 6 — Optimasi lanjutan (opsional tapi recommended)

1. **Google Business Profile** (kalau ada lokasi fisik / pickup):
   - https://business.google.com/
2. **Link di bio** Instagram & TikTok ke `https://nnthan.my.id`
3. **Backlink & konten**:
   - Post di Instagram/TikTok/Story dengan link
   - Minta teman review / sebut website
4. **Nanti kalau produk banyak**:
   - Buat halaman produk terpisah (atau hash + dynamic)
   - Update `sitemap.xml` dengan semua URL produk
   - Tambah schema `Product` + `Offer` di setiap produk
5. **Google Analytics 4** (opsional):
   - https://analytics.google.com/ → buat property → pasang gtag di `<head>`

---

## Checklist cepat setelah deploy

- [ ] robots.txt & sitemap.xml bisa diakses
- [ ] og-image.png tampil (ukuran 1200×630)
- [ ] Favicon muncul di tab browser
- [ ] Google Search Console verified + sitemap submitted + request indexing
- [ ] Bing Webmaster verified + sitemap
- [ ] Facebook Sharing Debugger sudah Scrape Again
- [ ] Preview WhatsApp/Instagram bagus
- [ ] Rich Results Test tidak error

---

## Catatan penting

- Site ini single-page → sitemap hanya 1 URL sudah cukup.
- Jangan ganti nama file `og-image.png` tanpa update meta di index.html + force scrape lagi.
- Cache Facebook/WhatsApp bisa 1–7 hari. Debugger adalah cara tercepat memaksa update.
- JSON-LD sudah memakai `FoodEstablishment` (lebih relevan untuk drink store) + WebSite + WebPage.

Selamat ranking! 🩷  
Kalau nanti butuh page produk individual atau blog, tinggal bilang biar dibantu schema & sitemap-nya.
