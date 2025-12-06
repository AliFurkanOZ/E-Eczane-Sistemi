# Eczane Yönetim Sistemi - Backend

FastAPI tabanlı eczane ve ilaç satış yönetim sistemi backend projesi.

## Kurulum

### 1. Virtual Environment Oluştur

```bash
python -m venv venv
```

### 2. Virtual Environment'ı Aktif Et

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Bağımlılıkları Yükle

```bash
pip install -r requirements.txt
```

### 4. Environment Değişkenlerini Ayarla

`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri düzenleyin:

```bash
cp .env.example .env
```

### 5. Sunucuyu Başlat

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Dokümantasyonu

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Proje Yapısı

```
eczane-backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/          # Temel yapılandırma ve güvenlik
│   ├── models/        # Veritabanı modelleri
│   ├── schemas/       # Pydantic şemaları
│   ├── repositories/  # Veritabanı işlemleri
│   ├── services/      # İş mantığı
│   ├── routers/       # API endpoint'leri
│   └── utils/         # Yardımcı fonksiyonlar ve enum'lar
├── requirements.txt
├── .env.example
├── .env
└── README.md
```


