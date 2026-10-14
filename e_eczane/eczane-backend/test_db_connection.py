"""
PostgreSQL veritabanı bağlantı test scripti
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def test_connection():
    """PostgreSQL bağlantısını test et"""
    try:
        print(f"🔌 Bağlantı test ediliyor: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'N/A'}")
        
        # Engine oluştur
        engine = create_engine(settings.DATABASE_URL)
        
        # Bağlantıyı test et
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Bağlantı başarılı!")
            print(f"📊 PostgreSQL Versiyonu: {version.split(',')[0]}")
            
            # Veritabanı adını kontrol et
            result = connection.execute(text("SELECT current_database();"))
            db_name = result.fetchone()[0]
            print(f"📁 Veritabanı: {db_name}")
            
            # Kullanıcı adını kontrol et
            result = connection.execute(text("SELECT current_user;"))
            user = result.fetchone()[0]
            print(f"👤 Kullanıcı: {user}")
            
        return True
        
    except Exception as e:
        print(f"❌ Bağlantı hatası: {str(e)}")
        print(f"\n💡 Kontrol edin:")
        print(f"   1. PostgreSQL çalışıyor mu? (Port 5432)")
        print(f"   2. .env dosyasındaki DATABASE_URL doğru mu?")
        print(f"   3. Veritabanı ve kullanıcı oluşturuldu mu?")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)















