"""
İlk admin kullanıcısını oluşturur
Kullanım: python -m app.scripts.create_first_admin
"""

import sys
sys.path.append('.')

from app.core.database import SessionLocal
from app.services.admin_service import AdminService
from app.schemas.admin import AdminCreate


def create_first_admin():
    db = SessionLocal()
    
    try:
        admin_service = AdminService(db)
        
        admin_data = AdminCreate(
            ad="Admin",
            soyad="User",
            telefon="05551234567",
            email="admin@eczane.com",
            password="Admin123!"
        )
        
        admin = admin_service.create_admin(admin_data)
        
        print(f"✅ İlk admin kullanıcısı oluşturuldu!")
        print(f"Email: {admin_data.email}")
        print(f"Şifre: {admin_data.password}")
        print(f"Admin ID: {admin.id}")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_first_admin()
