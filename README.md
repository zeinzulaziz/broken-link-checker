# Broken Link Checker

Website modern untuk mengecek broken links seperti [brokenlinkcheck.com](https://www.brokenlinkcheck.com/), dengan fitur-fitur optimal dan performa tinggi.

## ✨ Fitur Utama

- ✅ **Crawling Otomatis**: Scan seluruh website secara otomatis
- ✅ **Pengecekan Parallel**: Check multiple links secara bersamaan untuk performa optimal
- ✅ **Internal & External Links**: Deteksi broken links internal dan external
- ✅ **Real-time Progress**: Progress bar untuk tracking proses
- ✅ **Detail Error**: Menampilkan status code dan error message
- ✅ **Filter Links**: Filter berdasarkan internal/external
- ✅ **Export Results**: Export hasil dalam format JSON atau CSV
- ✅ **Real-time Results**: Hasil selalu update tanpa cache
- ✅ **Modern UI**: Desain yang responsif dan user-friendly

## 🚀 Instalasi

1. Clone atau download repository ini

2. Install dependencies:
```bash
npm install
```

3. Jalankan server:
```bash
npm start
```

Atau untuk development mode (dengan auto-reload):
```bash
npm run dev
```

4. Buka browser dan akses: `http://localhost:3000`

## 🌐 Deploy ke Production

### Deploy ke Vercel (Recommended)

1. **Push ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy ke Vercel**:
   - Kunjungi [vercel.com](https://vercel.com)
   - Login dengan GitHub account
   - Klik "Import Project"
   - Pilih repository yang baru dibuat
   - Vercel akan otomatis detect dan deploy
   - Setiap kali push ke GitHub, Vercel akan auto-deploy

3. **Hasil**: Website akan live di URL seperti `https://your-app.vercel.app`

### Deploy ke Railway/Render

Alternatif lain yang juga bagus untuk Node.js apps dengan auto-deploy dari GitHub.

## 📋 Penggunaan

1. Masukkan URL website yang ingin dicek (contoh: `www.example.com` atau `https://example.com`)
2. Klik tombol "Find Broken Links"
3. Tunggu proses crawling dan checking selesai
4. Lihat hasil broken links yang ditemukan
5. Gunakan filter untuk melihat hanya internal atau external links
6. Export hasil jika diperlukan (JSON atau CSV)

## 🎯 Optimasi yang Diterapkan

### 1. **Parallel Processing**
- Mengecek multiple links secara bersamaan (default: 15 concurrent requests)
- Menggunakan worker pattern untuk distribusi tugas

### 2. **Real-time Results**
- Hasil selalu fresh dan up-to-date
- Tidak ada cache, setiap check memberikan hasil terbaru

### 3. **Efficient Crawling**
- Menggunakan queue untuk BFS traversal
- Menghindari duplicate visits
- Limit jumlah halaman yang di-scan (configurable)

### 4. **Error Handling**
- Retry mechanism untuk failed requests
- Timeout handling untuk mencegah hanging
- Graceful error handling

### 5. **Performance**
- Async/await untuk non-blocking operations
- Memory-efficient dengan Set dan Map
- Optimized URL normalization

## 🔧 Konfigurasi

Anda dapat mengubah konfigurasi di `server.js`:

- `maxPages`: Default limit halaman yang di-scan (default: 100)
- `concurrency`: Jumlah parallel requests (default: 15)
- `timeout`: Request timeout (default: 8-10 detik)

## 📦 Dependencies

- **express**: Web framework
- **axios**: HTTP client untuk fetching
- **cheerio**: HTML parsing (jQuery-like)
- **url-parse**: URL parsing dan normalization
- **cors**: Cross-origin resource sharing

## 🌐 API Endpoints

### POST `/api/check`
Check broken links pada sebuah website

**Request:**
```json
{
  "url": "www.example.com",
  "maxPages": 100
}
```

**Response:**
```json
{
  "startUrl": "https://www.example.com",
  "totalPages": 50,
  "totalLinks": 200,
  "brokenLinks": 5,
  "workingLinks": 195,
  "brokenLinksDetails": [...],
  "workingLinksDetails": [...],
  "summary": {...}
}
```

### POST `/api/link-details`
Get detail HTML dengan highlighted broken links

**Request:**
```json
{
  "pageUrl": "https://example.com/page",
  "brokenLinkUrl": "https://example.com/broken"
}
```

## 💡 Tips untuk Optimasi Lebih Lanjut

1. **Database Storage**: Gunakan database (MongoDB/PostgreSQL) untuk menyimpan hasil pengecekan
2. **WebSocket**: Implement WebSocket untuk real-time progress updates
3. **Queue System**: Gunakan queue system (Redis/Bull) untuk handle large-scale checking
4. **Rate Limiting**: Implement rate limiting untuk mencegah abuse
5. **Scheduled Checks**: Tambahkan fitur scheduled checks dengan cron jobs
6. **Email Reports**: Kirim laporan via email setelah pengecekan selesai
7. **Multiple Domain Support**: Support checking multiple domains sekaligus
8. **API Key Authentication**: Tambahkan authentication untuk API
9. **Dashboard**: Buat dashboard untuk melihat history pengecekan
10. **Analytics**: Track dan analisis broken links trends

## 📝 License

MIT

## 🤝 Kontribusi

Pull requests are welcome! Untuk perubahan besar, silakan buat issue terlebih dahulu.

