# -*- coding: utf-8 -*-
"""
Veritabani Temizleme ve Admin Ekleme Scripti
Tum verileri siler, sadece admin hesabi olusturur.
"""
import sys
import os
sys.path.insert(0, '.')

from sqlalchemy import text
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.admin import Admin
from app.utils.enums import UserType

def clean_database():
    """Tum tablolari temizle (foreign key sirasina gore)"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("VERITABANI TEMIZLEME BASLATILIYOR...")
        print("=" * 60)
        
        # Foreign key constraint'leri nedeniyle silme sirasi onemli
        # Oncelikle bagli tablolar silinmeli
        tables_to_clean = [
            "bildirimler",           # Bildirimleri sil
            "siparis_durum_gecmisi", # Siparis durum gecmisini sil
            "siparis_detaylari",     # Siparis detaylarini sil
            "siparisler",            # Siparisleri sil
            "recete_ilaclar",        # Recete-ilac iliskilerini sil
            "receteler",             # Receteleri sil
            "stoklar",               # Stoklari sil
            "muadil_ilaclar",        # Muadil ilaclari sil
            "ilaclar",               # Ilaclari sil
            "doktorlar",             # Doktorlari sil
            "hastalar",              # Hastalari sil
            "eczaneler",             # Eczaneleri sil
            "adminler",              # Adminleri sil
            "users",                 # Kullanicilari sil
        ]
        
        for table in tables_to_clean:
            try:
                result = db.execute(text(f"DELETE FROM {table}"))
                count = result.rowcount
                print(f"  [OK] {table}: {count} kayit silindi")
                db.commit()
            except Exception as e:
                print(f"  [HATA] {table}: {e}")
                db.rollback()
        
        print("\n" + "=" * 60)
        print("TUM VERILER SILINDI!")
        print("=" * 60)
        
    finally:
        db.close()


def create_admin_only():
    """Sadece admin hesabi olustur"""
    db = SessionLocal()
    
    try:
        print("\n" + "=" * 60)
        print("ADMIN HESABI OLUSTURULUYOR...")
        print("=" * 60)
        
        # Admin kullanicisi olustur
        user = User(
            email="admin@eczane.com",
            password_hash=get_password_hash("Admin123!"),
            user_type=UserType.ADMIN,
            is_active=True
        )
        db.add(user)
        db.flush()
        
        # Admin profili olustur
        admin = Admin(
            user_id=user.id,
            ad="Sistem",
            soyad="Yoneticisi",
            telefon="555 000 00 00"
        )
        db.add(admin)
        db.commit()
        
        print("\n  [OK] Admin hesabi olusturuldu!")
        print("\n" + "=" * 60)
        print("ADMIN GIRIS BILGILERI")
        print("=" * 60)
        print("  E-mail:  admin@eczane.com")
        print("  Sifre:   Admin123!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n  [HATA] Admin olusturulamadi: {e}")
        db.rollback()
    finally:
        db.close()


def verify_clean():
    """Temizlik sonrasi kontrol"""
    db = SessionLocal()
    
    try:
        print("\n" + "=" * 60)
        print("TEMIZLIK SONRASI DURUM")
        print("=" * 60)
        
        from app.models import (
            User, Hasta, Eczane, Admin, Doktor, 
            Ilac, Stok, Recete, Siparis, Bildirim
        )
        
        counts = {
            "Users": db.query(User).count(),
            "Hastalar": db.query(Hasta).count(),
            "Eczaneler": db.query(Eczane).count(),
            "Adminler": db.query(Admin).count(),
            "Doktorlar": db.query(Doktor).count(),
            "Ilaclar": db.query(Ilac).count(),
            "Stoklar": db.query(Stok).count(),
            "Receteler": db.query(Recete).count(),
            "Siparisler": db.query(Siparis).count(),
            "Bildirimler": db.query(Bildirim).count(),
        }
        
        for table, count in counts.items():
            status = "[OK]" if (table in ["Users", "Adminler"] and count == 1) or count == 0 else "[!]"
            print(f"  {status} {table}: {count}")
        
        print("=" * 60)
        
    finally:
        db.close()


if __name__ == "__main__":
    print("\n")
    print("*" * 60)
    print("*  E-ECZANE VERITABANI TEMIZLEME VE ADMIN EKLEME          *")
    print("*" * 60)
    print("\n")
    
    # 1. Veritabanini temizle
    clean_database()
    
    # 2. Sadece admin ekle
    create_admin_only()
    
    # 3. Sonucu dogrula
    verify_clean()
    
    print("\n[TAMAMLANDI] Veritabani temizlendi ve admin eklendi.\n")
