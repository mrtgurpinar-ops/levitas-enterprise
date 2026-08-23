# 🚀 Levitas Enterprise Intelligence & Technology

**Geleceğin Yapay Zeka Sistemleri, Otonom İş Akışları ve Özel Kurumsal Yazılım Mimarisi**

Levitas Enterprise; kurumsal şirketler ve vizyoner girişimler için çok modelli yapay zeka ajanları (LLM), otonom süreç otomasyonları, yüksek performanslı web/SaaS platformları ve mobil uygulamalar geliştiren bağımsız bir teknoloji platformudur.

---

## 💎 Temel Özellikler

- **🤖 21st.dev Dark Obsidian Tasarım:** Frosted glassmorphism, neon ambient ışımaları, dinamik bento grid kartları ve modern tipografi.
- **🧮 İnteraktif Proje Hesaplayıcı:** Ziyaretçilerin proje türü, ileri modüller ve teslimat önceliği seçerek anında bütçe ve süre tahmini alabilmesi.
- **📬 Çok Kanallı Talep & Lead Motoru:** Web formundan gelen talepleri SQLite/PostgreSQL'e kaydetme ve tek tıkla kurumsal WhatsApp görüşmesi başlatma.
- **🔐 Güvenli Yönetici Paneli (`/admin`):** Gelen talepleri filtreleme, durum güncelleme (Yeni, İnceleniyor, Teklif Verildi, Onaylandı) ve CSV formatında dışa aktarma.
- **🛡️ Production & Railway Uyumlu:** Uvicorn port güvenliği, Pydantic email validator koruması, PostgreSQL dialect uyumluluğu ve `?v=1.0.0` cache-busting.

---

## 🛠️ Yerel Kurulum ve Çalıştırma

```bash
# 1. Proje dizinine geçin
cd projects/levitas_enterprise

# 2. Bağımlılıkları yükleyin
pip install -r requirements.txt

# 3. Sunucuyu başlatın
python main.py
```

Tarayıcınızda açın:
- **Web Sitesi:** [http://localhost:8080](http://localhost:8080)
- **Yönetici Paneli:** [http://localhost:8080/admin](http://localhost:8080/admin) *(Varsayılan PIN: `levitas2026`)*
- **Sağlık Kontrolü:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 🌐 Canlı Yayın (Production)
Detaylı canlıya alma ve domain bağlama adımları için [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) dosyasını inceleyiniz.
