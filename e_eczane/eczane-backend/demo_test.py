"""
E-Eczane Projesi Demo Test
Bu script projenin temel özelliklerini test eder
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash, create_access_token
from app.models import *
from app.utils.enums import *
from datetime import date
import uuid


def test_database_connection():
    """Database bağlantısını test et"""
    print("\n" + "="*60)
    print("📊 DATABASE BAĞLANTI TESTİ")
    print("="*60)
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database bağlantısı başarılı!")
        return True
    except Exception as e:
        print(f"❌ Database bağlantı hatası: {e}")
        return False


def create_sample_data():
    """Örnek veri oluştur"""
    print("\n" + "="*60)
    print("📝 ÖRNEK VERİ OLUŞTURMA")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # 1. Admin kullanıcı oluştur
        print("\n1️⃣  Admin kullanıcı oluşturuluyor...")
        admin_user = User(
            email="admin@eczane.com",
            password_hash=get_password_hash("admin123"),
            user_type=UserType.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.flush()
        
        admin = Admin(
            user_id=admin_user.id,
            ad="Ahmet",
            soyad="Yılmaz",
            telefon="0532 111 2222"
        )
        db.add(admin)
        print(f"   ✅ Admin: {admin.tam_ad}")
        
        
        # 2. Eczane kullanıcısı oluştur
        print("\n2️⃣  Eczane kullanıcısı oluşturuluyor...")
        eczane_user = User(
            email="guven@eczane.com",
            password_hash=get_password_hash("eczane123"),
            user_type=UserType.ECZANE,
            is_active=True
        )
        db.add(eczane_user)
        db.flush()
        
        eczane = Eczane(
            user_id=eczane_user.id,
            sicil_no="ECZ12345",
            eczane_adi="Güven Eczanesi",
            adres="Atatürk Cad. No:123 Kadıköy/İstanbul",
            telefon="0216 333 4444",
            mahalle="Kadıköy",
            eczaci_adi="Mehmet",
            eczaci_soyadi="Demir",
            eczaci_diploma_no="DIP123456",
            banka_hesap_no="1234567890",
            iban="TR330006100519786457841326",
            onay_durumu=OnayDurumu.ONAYLANDI
        )
        db.add(eczane)
        print(f"   ✅ Eczane: {eczane.eczane_adi}")
        print(f"   ✅ Eczacı: {eczane.eczaci_tam_ad}")
        
        
        # 3. Hasta kullanıcısı oluştur
        print("\n3️⃣  Hasta kullanıcısı oluşturuluyor...")
        hasta_user = User(
            email="ayse@gmail.com",
            password_hash=get_password_hash("hasta123"),
            user_type=UserType.HASTA,
            is_active=True
        )
        db.add(hasta_user)
        db.flush()
        
        hasta = Hasta(
            user_id=hasta_user.id,
            tc_no="12345678901",
            ad="Ayşe",
            soyad="Kaya",
            adres="Bağdat Cad. No:456 Kadıköy/İstanbul",
            telefon="0532 555 6666"
        )
        db.add(hasta)
        print(f"   ✅ Hasta: {hasta.tam_ad}")
        
        
        # 4. İlaçlar oluştur
        print("\n4️⃣  İlaçlar oluşturuluyor...")
        ilac1 = Ilac(
            barkod="8699524650011",
            ad="Parol 500mg Tablet",
            kategori=IlacKategori.NORMAL,
            kullanim_talimati="Günde 3 kez, yemeklerden sonra alınır.",
            fiyat=25.50,
            receteli=False,
            aktif=True,
            etken_madde="Parasetamol",
            firma="Atabay İlaç"
        )
        db.add(ilac1)
        
        ilac2 = Ilac(
            barkod="8699524650028",
            ad="Majezik 100mg Tablet",
            kategori=IlacKategori.NORMAL,
            kullanim_talimati="Ağrı olduğunda günde 2-3 kez alınır.",
            fiyat=42.75,
            receteli=True,
            aktif=True,
            etken_madde="Deksketoprofen",
            firma="Sanovel İlaç"
        )
        db.add(ilac2)
        
        ilac3 = Ilac(
            barkod="8699524650035",
            ad="Coraspin 100mg Tablet",
            kategori=IlacKategori.NORMAL,
            kullanim_talimati="Günde 1 kez, tok karnına alınır.",
            fiyat=15.25,
            receteli=True,
            aktif=True,
            etken_madde="Asetilsalisilik Asit",
            firma="Mustafa Nevzat İlaç"
        )
        db.add(ilac3)
        print(f"   ✅ {ilac1.ad} - {ilac1.fiyat} TL")
        print(f"   ✅ {ilac2.ad} - {ilac2.fiyat} TL")
        print(f"   ✅ {ilac3.ad} - {ilac3.fiyat} TL")
        
        db.flush()
        
        
        # 5. Stok oluştur
        print("\n5️⃣  Stoklar oluşturuluyor...")
        stok1 = Stok(eczane_id=eczane.id, ilac_id=ilac1.id, miktar=150, min_stok=20)
        stok2 = Stok(eczane_id=eczane.id, ilac_id=ilac2.id, miktar=75, min_stok=15)
        stok3 = Stok(eczane_id=eczane.id, ilac_id=ilac3.id, miktar=8, min_stok=10)  # Düşük stok
        db.add_all([stok1, stok2, stok3])
        print(f"   ✅ {ilac1.ad}: {stok1.miktar} adet (Durum: {stok1.stok_durumu})")
        print(f"   ✅ {ilac2.ad}: {stok2.miktar} adet (Durum: {stok2.stok_durumu})")
        print(f"   ✅ {ilac3.ad}: {stok3.miktar} adet (Durum: {stok3.stok_durumu})")
        
        
        # 6. Reçete oluştur
        print("\n6️⃣  Reçete oluşturuluyor...")
        recete = Recete(
            recete_no="RCT2024001",
            tc_no=hasta.tc_no,
            tarih=date.today(),
            durum=ReceteDurum.AKTIF,
            doktor_adi="Dr. Fatma Şahin",
            hastane="İstanbul Eğitim ve Araştırma Hastanesi"
        )
        db.add(recete)
        db.flush()
        
        recete_ilac1 = ReceteIlac(
            recete_id=recete.id,
            ilac_id=ilac2.id,
            miktar=2,
            kullanim_suresi="10 gün"
        )
        recete_ilac2 = ReceteIlac(
            recete_id=recete.id,
            ilac_id=ilac3.id,
            miktar=1,
            kullanim_suresi="30 gün"
        )
        db.add_all([recete_ilac1, recete_ilac2])
        print(f"   ✅ Reçete No: {recete.recete_no}")
        print(f"   ✅ İlaçlar: {ilac2.ad} (2 kutu), {ilac3.ad} (1 kutu)")
        
        
        # 7. Sipariş oluştur
        print("\n7️⃣  Sipariş oluşturuluyor...")
        siparis = Siparis(
            hasta_id=hasta.id,
            eczane_id=eczane.id,
            recete_id=recete.id,
            toplam_tutar=100.75,
            durum=SiparisDurum.BEKLEMEDE,
            odeme_durumu=OdemeDurum.BEKLEMEDE,
            teslimat_adresi=hasta.adres
        )
        db.add(siparis)
        db.flush()
        
        detay1 = SiparisDetay(
            siparis_id=siparis.id,
            ilac_id=ilac2.id,
            miktar=2,
            birim_fiyat=42.75,
            ara_toplam=85.50
        )
        detay2 = SiparisDetay(
            siparis_id=siparis.id,
            ilac_id=ilac3.id,
            miktar=1,
            birim_fiyat=15.25,
            ara_toplam=15.25
        )
        db.add_all([detay1, detay2])
        print(f"   ✅ Sipariş No: {siparis.siparis_no}")
        print(f"   ✅ Toplam: {siparis.toplam_tutar} TL")
        
        
        # 8. Bildirim oluştur
        print("\n8️⃣  Bildirimler oluşturuluyor...")
        bildirim1 = Bildirim(
            user_id=hasta_user.id,
            baslik="Siparişiniz Alındı",
            mesaj=f"Sipariş numaranız: {siparis.siparis_no}. En kısa sürede hazırlanacaktır.",
            tip=BildirimTip.SIPARIS,
            okundu=False
        )
        bildirim2 = Bildirim(
            user_id=eczane_user.id,
            baslik="Yeni Sipariş",
            mesaj=f"{hasta.tam_ad} isimli hasta tarafından yeni sipariş alındı.",
            tip=BildirimTip.SIPARIS,
            okundu=False
        )
        bildirim3 = Bildirim(
            user_id=eczane_user.id,
            baslik="Düşük Stok Uyarısı",
            mesaj=f"{ilac3.ad} stoğu minimum seviyenin altında! (Mevcut: {stok3.miktar})",
            tip=BildirimTip.SISTEM,
            okundu=False
        )
        db.add_all([bildirim1, bildirim2, bildirim3])
        print(f"   ✅ 3 bildirim oluşturuldu")
        
        
        # Commit
        db.commit()
        print("\n" + "="*60)
        print("✅ TÜM ÖRNEK VERİLER BAŞARIYLA OLUŞTURULDU!")
        print("="*60)
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Hata oluştu: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def display_summary():
    """Veritabanı özetini göster"""
    print("\n" + "="*60)
    print("📈 VERİTABANI ÖZETİ")
    print("="*60)
    
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        hasta_count = db.query(Hasta).count()
        eczane_count = db.query(Eczane).count()
        admin_count = db.query(Admin).count()
        ilac_count = db.query(Ilac).count()
        siparis_count = db.query(Siparis).count()
        recete_count = db.query(Recete).count()
        
        print(f"\n👥 Kullanıcılar:")
        print(f"   • Toplam Kullanıcı: {user_count}")
        print(f"   • Hasta: {hasta_count}")
        print(f"   • Eczane: {eczane_count}")
        print(f"   • Admin: {admin_count}")
        
        print(f"\n💊 İlaçlar: {ilac_count}")
        print(f"📋 Reçeteler: {recete_count}")
        print(f"🛒 Siparişler: {siparis_count}")
        
        # En son siparişi göster
        latest_siparis = db.query(Siparis).order_by(Siparis.created_at.desc()).first()
        if latest_siparis:
            print(f"\n📦 Son Sipariş:")
            print(f"   • Sipariş No: {latest_siparis.siparis_no}")
            print(f"   • Durum: {latest_siparis.durum.value}")
            print(f"   • Tutar: {latest_siparis.toplam_tutar} TL")
            
        print("\n" + "="*60)
        
    finally:
        db.close()


def test_authentication():
    """JWT authentication test"""
    print("\n" + "="*60)
    print("🔐 AUTHENTICATION TESTİ")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Kullanıcı bul
        user = db.query(User).filter(User.email == "ayse@gmail.com").first()
        if user:
            # Token oluştur
            token_data = {
                "user_id": str(user.id),
                "email": user.email,
                "user_type": user.user_type.value
            }
            token = create_access_token(token_data)
            print(f"\n✅ Token oluşturuldu:")
            print(f"   • Email: {user.email}")
            print(f"   • Tip: {user.user_type.value}")
            print(f"   • Token: {token[:50]}...")
        else:
            print("❌ Kullanıcı bulunamadı")
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "🏥 E-ECZANE PROJESİ DEMO TEST ".center(60, "="))
    
    # 1. Database bağlantı testi
    if not test_database_connection():
        sys.exit(1)
    
    # 2. Örnek veri oluştur
    if create_sample_data():
        # 3. Özet göster
        display_summary()
        
        # 4. Authentication test
        test_authentication()
        
        print("\n" + "✅ TÜM TESTLER TAMAMLANDI! ".center(60, "="))
        print("\n💡 Swagger UI: http://localhost:8000/docs")
        print("💡 Database: postgresql://localhost:5433/eczane_db\n")
    else:
        print("\n❌ Test başarısız!")
        sys.exit(1)
