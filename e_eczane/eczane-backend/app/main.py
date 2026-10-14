from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db, engine, Base

# Import ALL models to create tables
from app.models import (
    User, Hasta, Eczane, Admin, Doktor,
    Ilac, MuadilIlac,
    Recete, ReceteIlac,
    Stok,
    Siparis, SiparisDetay,
)
# Bildirim ve SiparisDurumGecmisi artık DynamoDB (NoSQL) üzerinden yönetiliyor

# Import routers
from app.routers import auth, hasta, eczane, admin, doktor, cosmos_admin

# DynamoDB initialization
from app.core.dynamodb import init_dynamodb

# Create tables (PostgreSQL)
Base.metadata.create_all(bind=engine)

# Initialize DynamoDB (NoSQL) connection
init_dynamodb()

# Benchmark test tablosunu oluştur (yoksa)
from sqlalchemy import text as _text
with engine.connect() as _conn:
    _conn.execute(_text("""
        CREATE TABLE IF NOT EXISTS benchmark_test (
            id VARCHAR(36) PRIMARY KEY,
            test_key VARCHAR(100),
            test_value TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """))
    _conn.commit()

app = FastAPI(
    title="Eczane Yönetim Sistemi API",
    description="Eczane ve ilaç satış yönetim sistemi — Polyglot Persistence (PostgreSQL + DynamoDB)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(hasta.router, prefix="/api/hasta", tags=["Hasta"])
app.include_router(eczane.router, prefix="/api/eczane", tags=["Eczane"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(doktor.router, prefix="/api/doktor", tags=["Doktor"])
app.include_router(cosmos_admin.router, prefix="/api/cosmos", tags=["DynamoDB NoSQL"])


@app.get("/")
def root():
    return {
        "message": "Eczane Yönetim Sistemi API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "databases": {
            "sql": "PostgreSQL",
            "nosql": "AWS DynamoDB"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/db-test")
def test_database(db: Session = Depends(get_db)):
    """Database bağlantısını test et"""
    try:
        # Basit bir query çalıştır
        db.execute(text("SELECT 1"))
        return {
            "status": "success",
            "message": "Database bağlantısı başarılı"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/dynamodb-test")
def test_dynamodb():
    """DynamoDB bağlantısını test et"""
    try:
        from app.core.dynamodb import get_dynamodb
        db = get_dynamodb()
        if db:
            return {
                "status": "success",
                "message": "DynamoDB bağlantısı başarılı",
                "provider": "AWS",
                "region": settings.AWS_REGION
            }
        return {
            "status": "warning",
            "message": "DynamoDB yapılandırılmamış"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/tables")
def list_tables(db: Session = Depends(get_db)):
    """Oluşturulan tabloları listele"""
    try:
        result = db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result]
        return {
            "status": "success",
            "total": len(tables),
            "tables": tables,
            "dynamodb_tables": [
                f"{settings.DYNAMODB_TABLE_PREFIX}bildirimler",
                f"{settings.DYNAMODB_TABLE_PREFIX}siparis_durum_gecmisi",
                f"{settings.DYNAMODB_TABLE_PREFIX}sistem_loglari"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
