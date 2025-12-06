from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db, engine, Base

# Import ALL models to create tables
from app.models import (
    User, Hasta, Eczane, Admin,
    Ilac, MuadilIlac,
    Recete, ReceteIlac,
    Stok,
    Siparis, SiparisDetay, SiparisDurumGecmisi,
    Bildirim
)

# Import routers
from app.routers import auth, hasta, eczane, admin

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Eczane Yönetim Sistemi API",
    description="Eczane ve ilaç satış yönetim sistemi",
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


@app.get("/")
def root():
    return {
        "message": "Eczane Yönetim Sistemi API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
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
            "tables": tables
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

