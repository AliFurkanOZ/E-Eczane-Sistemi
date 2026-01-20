<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

# 💊 E-Eczane Sistemi

Modern, kullanıcı dostu ve güvenli bir **Elektronik Eczane Yönetim Sistemi**. Bu proje, eczaneler, doktorlar, hastalar ve sistem yöneticileri arasında dijital reçete yönetimi, ilaç siparişi ve stok takibini sağlayan kapsamlı bir web uygulamasıdır.

---

## 🚀 Özellikler

### 👨‍⚕️ Doktor Paneli
- 📝 Hastalara dijital reçete yazma
- 📋 Yazılan reçeteleri görüntüleme ve yönetme
- 👤 Profil bilgilerini güncelleme

### 🏥 Eczane Paneli
- 📦 Hasta siparişlerini görüntüleme ve yönetme
- 💊 İlaç stok takibi ve güncelleme
- 📊 Satış istatistikleri ve raporlama
- 🔔 Sipariş bildirimleri

### 👤 Hasta Paneli
- 📜 Reçetelerini görüntüleme
- 🛒 İlaç siparişi oluşturma
- 🛍️ Sepet yönetimi
- 💳 Ödeme işlemleri
- 📍 Yakın eczane bulma
- 📦 Sipariş takibi

### 👨‍💼 Admin Paneli
- 👥 Kullanıcı yönetimi (Doktor, Eczane, Hasta)
- 🏪 Eczane onaylama ve yönetim
- 📊 Sistem genelinde istatistikler
- 📋 Tüm siparişleri görüntüleme

### 🔐 Güvenlik
- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme (RBAC)
- Şifreli parola saklama (bcrypt)

---

## 🛠️ Teknoloji Stack

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| **FastAPI** | Yüksek performanslı Python web framework |
| **SQLAlchemy** | ORM (Object Relational Mapping) |
| **PostgreSQL** | İlişkisel veritabanı |
| **Alembic** | Database migration aracı |
| **Pydantic** | Data validation |
| **JWT** | Token tabanlı authentication |
| **Uvicorn** | ASGI server |

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| **React 19** | Modern UI library |
| **Vite** | Hızlı build tool |
| **TailwindCSS** | Utility-first CSS framework |
| **Redux Toolkit** | State management |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |
| **Lucide React** | Modern icon library |
| **React Hook Form** | Form yönetimi |
| **React Hot Toast** | Bildirim sistemi |

### DevOps
| Teknoloji | Açıklama |
|-----------|----------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |

---

## 📁 Proje Yapısı

```
E-Eczane-Sistemi/
├── e_eczane/
│   ├── eczane-backend/          # FastAPI Backend
│   │   ├── app/
│   │   │   ├── core/            # Konfigürasyon, database, security
│   │   │   ├── models/          # SQLAlchemy modelleri
│   │   │   ├── routers/         # API endpoint'leri
│   │   │   ├── schemas/         # Pydantic şemaları
│   │   │   ├── services/        # İş mantığı
│   │   │   ├── repositories/    # Database işlemleri
│   │   │   └── utils/           # Yardımcı fonksiyonlar
│   │   ├── tests/               # Test dosyaları
│   │   ├── migrations/          # Alembic migration'ları
│   │   └── requirements.txt     # Python bağımlılıkları
│   │
│   ├── eczane-frontend/         # React Frontend
│   │   ├── src/
│   │   │   ├── api/             # API çağrıları
│   │   │   ├── components/      # Yeniden kullanılabilir bileşenler
│   │   │   ├── pages/           # Sayfa bileşenleri
│   │   │   │   ├── admin/       # Admin paneli
│   │   │   │   ├── auth/        # Login/Register
│   │   │   │   ├── doktor/      # Doktor paneli
│   │   │   │   ├── eczane/      # Eczane paneli
│   │   │   │   └── hasta/       # Hasta paneli
│   │   │   ├── redux/           # State management
│   │   │   └── utils/           # Yardımcı fonksiyonlar
│   │   └── package.json         # Node bağımlılıkları
│   │
│   └── docker-compose.yml       # Docker konfigürasyonu
│
└── README.md
```

---

## ⚙️ Kurulum

### Gereksinimler
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ (veya Docker)
- Git

### 1️⃣ Projeyi Klonlayın

```bash
git clone https://github.com/AliFurkanOZ/E-Eczane-Sistemi.git
cd E-Eczane-Sistemi
```

### 2️⃣ Database Kurulumu (Docker ile)

```bash
cd e_eczane
docker-compose up -d
```

Bu komut PostgreSQL veritabanını `localhost:5433` portunda başlatır.

### 3️⃣ Backend Kurulumu

```bash
cd e_eczane/eczane-backend

# Virtual environment oluştur
python -m venv venv

# Aktive et (Windows)
venv\Scripts\activate

# Aktive et (Linux/Mac)
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# .env dosyasını oluştur
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/eczane_db
SECRET_KEY=your-super-secret-key-here
ENVIRONMENT=development
```

Backend'i başlatın:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4️⃣ Frontend Kurulumu

```bash
cd e_eczane/eczane-frontend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
VITE_API_URL=http://localhost:8000
```

Frontend'i başlatın:
```bash
npm run dev
```

---

## 🌐 Erişim

| Servis | URL |
|--------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc |

---

## 📊 Database Modeli

```mermaid
erDiagram
    USER ||--o| HASTA : is
    USER ||--o| ECZANE : is
    USER ||--o| ADMIN : is
    USER ||--o| DOKTOR : is
    
    DOKTOR ||--o{ RECETE : writes
    HASTA ||--o{ RECETE : has
    RECETE ||--o{ RECETE_ILAC : contains
    ILAC ||--o{ RECETE_ILAC : in
    ILAC ||--o{ MUADIL_ILAC : has
    
    ECZANE ||--o{ STOK : has
    ILAC ||--o{ STOK : in
    
    HASTA ||--o{ SIPARIS : places
    ECZANE ||--o{ SIPARIS : receives
    SIPARIS ||--o{ SIPARIS_DETAY : contains
    SIPARIS ||--o{ SIPARIS_DURUM_GECMISI : tracks
    
    USER ||--o{ BILDIRIM : receives
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi |

### Hasta
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/hasta/receteler` | Reçeteleri listele |
| GET | `/api/hasta/siparisler` | Siparişleri listele |
| POST | `/api/hasta/siparis` | Yeni sipariş oluştur |
| GET | `/api/hasta/ilaclar` | İlaçları ara |

### Eczane
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/eczane/siparisler` | Siparişleri listele |
| PUT | `/api/eczane/siparis/{id}/durum` | Sipariş durumu güncelle |
| GET | `/api/eczane/stok` | Stok durumu |
| PUT | `/api/eczane/stok/{id}` | Stok güncelle |

### Doktor
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/doktor/recete` | Reçete yaz |
| GET | `/api/doktor/receteler` | Reçeteleri listele |
| GET | `/api/doktor/hastalar` | Hasta ara |

### Admin
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/admin/users` | Kullanıcıları listele |
| GET | `/api/admin/eczaneler` | Eczaneleri listele |
| PUT | `/api/admin/eczane/{id}/onayla` | Eczane onayla |
| GET | `/api/admin/istatistikler` | Sistem istatistikleri |

---

## 🧪 Test

### Backend Tests
```bash
cd e_eczane/eczane-backend
pytest
```

### API Test
```bash
# Health check
curl http://localhost:8000/health

# Database test
curl http://localhost:8000/db-test
```

---

## 📝 Kullanım Senaryoları

### Senaryo 1: Hasta İlaç Siparişi
1. Hasta sisteme giriş yapar
2. Reçetesini görüntüler
3. İlaçları sepete ekler
4. Yakın eczaneyi seçer
5. Siparişi onaylar
6. Ödeme yapar

### Senaryo 2: Doktor Reçete Yazma
1. Doktor sisteme giriş yapar
2. Hastayı TC Kimlik No ile arar
3. İlaçları seçer ve dozaj belirler
4. Reçeteyi onaylar

### Senaryo 3: Eczane Sipariş İşleme
1. Eczane sisteme giriş yapar
2. Bekleyen siparişleri görür
3. Stok durumunu kontrol eder
4. Siparişi hazırlar ve durumu günceller

---

## 👥 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📧 İletişim

**Ali Furkan ÖZ**

- GitHub: [@AliFurkanOZ](https://github.com/AliFurkanOZ)

---

