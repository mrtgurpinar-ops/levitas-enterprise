# 🌐 Levitas Enterprise — Canlı Yayın ve Dağıtım Rehberi (Railway Deployment)

Bu doküman, **Levitas Enterprise Intelligence & Technology** platformunun bağımsız bir GitHub deposu üzerinden Railway'e nasıl dağıtılacağını ve özel alan adının (custom domain) nasıl bağlanacağını açıklar.

---

## 📋 1. Ön Dağıtım Kontrol Listesi (Pre-Flight Checklist)

Proje aşağıdaki üretim korumalarıyla donatılmıştır:
- [x] **Port Eşleşmesi:** `main.py` içerisindeki `int(os.environ.get("PORT") or 8080)` okuyucusu ile Railway portu ($PORT) tam eşleşir.
- [x] **Procfile Komutu:** `web: python main.py` olarak ayarlanmıştır (literal string parse hatasını önler).
- [x] **Nixpacks Yapılandırması:** `nixpacks.toml` içinde `providers = ["python"]` ve Python 3.11 sabitlenmiştir.
- [x] **Mise Güvenlik Bypass:** `mise.toml` dosyasında `[settings] python.github_attestations = false` eklenmiştir.
- [x] **Veritabanı Dialect Güvencesi:** `database.py` dosyasında `postgres://` protokolü otomatik olarak `postgresql://` dizesine dönüştürülür.
- [x] **Email Validator Koruması:** `requirements.txt` dosyasına `email-validator>=2.1.0` eklenmiştir.
- [x] **Cache Busting:** Statik dosya bağlantılarına `?v=1.0.0` eklenmiştir.

---

## 🚀 2. Bağımsız GitHub Reposu Oluşturma ve Bağlama

1. GitHub üzerinde `levitas_enterprise` isimli yeni ve boş bir repository oluşturun.
2. Yerel terminalde bağımsız depoyu bağlayın:
   ```bash
   cd projects/levitas_enterprise
   git init
   git add .
   git commit -m "feat: initial release of Levitas Enterprise platform (v1.0.0)"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/levitas_enterprise.git
   git push -u origin main
   ```

---

## ☁️ 3. Railway Proje Kurulumu

1. **[Railway Dashboard](https://railway.app)** üzerinde oturum açın.
2. **"New Project"** -> **"Deploy from GitHub repo"** seçeneğini tıklayın.
3. `levitas_enterprise` deposunu seçin.
4. **Environment Variables (Ortam Değişkenleri)** alanına şunları ekleyin:
   - `PORT`: `8080`
   - `ADMIN_KEY`: `levitas2026` *(veya belirleyeceğiniz güçlü bir şifre)*
   - `WHATSAPP_PHONE`: `905550000000` *(Kurumsal WhatsApp hattınız)*
   - `APP_ENV`: `production`
5. *(İsteğe Bağlı)* Kalıcı PostgreSQL eklemek için Railway projenize **"New Service"** -> **"Database"** -> **"PostgreSQL"** ekleyin. Railway otomatik olarak `DATABASE_URL` değişkenini bağlayacaktır.

---

## 🌐 4. Özel Alan Adı (Custom Domain) Bağlama

1. Railway servisinizin **"Settings"** sekmesine gidin.
2. **"Networking"** -> **"Custom Domain"** butonuna tıklayın.
3. Alan adınızı girin (Örn: `levitas.tech` veya `www.levitas.tech`).
4. Alan adı sağlayıcınızın (Cloudflare, GoDaddy, Namecheap vb.) DNS yönetim paneline giderek Railway'in verdiği CNAME kaydını ekleyin:
   - **Type:** `CNAME`
   - **Name:** `@` veya `www`
   - **Target / Value:** `levitasenterprise-production.up.railway.app`
5. SSL sertifikası Railway tarafından otomatik olarak (Let's Encrypt) ücretsiz tahsis edilecektir.
