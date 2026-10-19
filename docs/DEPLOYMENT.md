# Panduan Deployment - Mudik Gratis Aceh 2026

Proyek ini dirancang terpisah antara Frontend (React + Vite) dan Backend (Node.js + Express) sehingga dapat di-deploy secara independen pada VPS, Vercel, Netlify, atau Docker.

---

## 1. Persyaratan Server
- Node.js versi 18+ (direkomendasikan v20 / v24)
- MySQL 8.0 atau MariaDB 10.6+
- Reverse Proxy Nginx (untuk HTTPS & routing port)

---

## 2. Menjalankan Backend (Express.js)

```bash
cd backend

# 1. Install dependensi
npm install

# 2. Salin environment
cp .env.example .env
# Edit .env dengan kredensial database & JWT secret Anda

# 3. Jalankan migrasi dan seed database
npm run migrate

# 4. Jalankan server produksi
npm start
# Atau gunakan PM2 untuk background process:
# pm2 start src/server.js --name "mudik-backend"
```

Port default backend: `3001`

---

## 3. Menjalankan Frontend (React + Vite)

```bash
cd frontend

# 1. Install dependensi
npm install

# 2. Atur URL API produksi di .env
echo "VITE_API_BASE_URL=https://api.mudikgratis.acehprov.go.id/api/v1" > .env

# 3. Build bundle produksi
npm run build

# 4. Hasil build statis berada di folder: frontend/dist/
# Siap dideploy ke Nginx (/var/www/...) atau Vercel / Cloudflare Pages.
```

---

## 4. Konfigurasi Nginx Reverse Proxy Contoh

```nginx
server {
    server_name mudikgratis.acehprov.go.id;

    # Frontend
    location / {
        root /var/www/mudik-gratis/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
