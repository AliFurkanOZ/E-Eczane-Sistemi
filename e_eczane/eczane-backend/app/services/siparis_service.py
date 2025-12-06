from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from app.models.siparis import Siparis, SiparisDetay, SiparisDurumGecmisi
from app.models.stok import Stok
from app.models.bildirim import Bildirim
from app.schemas.siparis import SiparisCreate, SiparisResponse
from app.utils.enums import SiparisDurum, OdemeDurum, BildirimTip
from app.repositories.eczane_repository import EczaneRepository
from app.repositories.ilac_repository import IlacRepository


class SiparisService:
    """Sipariş servis katmanı"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_siparis(
        self,
        hasta_id: str,
        siparis_data: SiparisCreate
    ) -> Siparis:
        """
        Yeni sipariş oluştur
        
        Args:
            hasta_id: Hasta kullanıcı ID
            siparis_data: Sipariş bilgileri
        
        Returns:
            Siparis: Oluşturulan sipariş
        
        Raises:
            HTTPException: Stok yetersiz veya eczane bulunamadı
        """
        eczane_repo = EczaneRepository(self.db)
        
        # Eczane kontrolü
        eczane = eczane_repo.get_by_id(siparis_data.eczane_id)
        if not eczane:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Eczane bulunamadı"
            )
        
        # Stok kontrolü
        ilac_miktar_map = {
            item.ilac_id: item.miktar 
            for item in siparis_data.items
        }
        
        stok_yeterli, eksik_ilaclar = eczane_repo.check_stock_availability(
            siparis_data.eczane_id,
            ilac_miktar_map
        )
        
        if not stok_yeterli:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Bazı ilaçlar için stok yetersiz",
                    "eksik_ilaclar": eksik_ilaclar
                }
            )
        
        # Toplam tutarı hesapla
        toplam_tutar = sum(item.ara_toplam for item in siparis_data.items)
        
        # Sipariş oluştur
        siparis = Siparis(
            hasta_id=hasta_id,
            eczane_id=siparis_data.eczane_id,
            recete_id=siparis_data.recete_id,
            toplam_tutar=toplam_tutar,
            durum=SiparisDurum.BEKLEMEDE,
            odeme_durumu=OdemeDurum.ODENDI,  # Simülasyon - ödeme yapıldı
            teslimat_adresi=siparis_data.teslimat_adresi,
            siparis_notu=siparis_data.siparis_notu
        )
        
        self.db.add(siparis)
        self.db.flush()  # ID'yi al
        
        # Sipariş detaylarını ekle
        for item in siparis_data.items:
            detay = SiparisDetay(
                siparis_id=siparis.id,
                ilac_id=item.ilac_id,
                miktar=item.miktar,
                birim_fiyat=item.birim_fiyat,
                ara_toplam=item.ara_toplam
            )
            self.db.add(detay)
        
        # Stokları azalt
        for ilac_id, miktar in ilac_miktar_map.items():
            stok = self.db.query(Stok).filter(
                Stok.eczane_id == UUID(siparis_data.eczane_id),
                Stok.ilac_id == UUID(ilac_id)
            ).first()
            
            if stok:
                stok.miktar -= miktar
        
        # Durum geçmişi ekle
        gecmis = SiparisDurumGecmisi(
            siparis_id=siparis.id,
            eski_durum=None,
            yeni_durum=SiparisDurum.BEKLEMEDE.value,
            aciklama="Sipariş oluşturuldu",
            degistiren_user_id=hasta_id
        )
        self.db.add(gecmis)
        
        # Eczaneye bildirim gönder
        bildirim = Bildirim(
            user_id=eczane.user_id,
            baslik="Yeni Sipariş",
            mesaj=f"#{siparis.siparis_no} numaralı yeni sipariş geldi. Toplam: {toplam_tutar} TL",
            tip=BildirimTip.SIPARIS,
            link=f"/eczane/siparisler/{siparis.id}"
        )
        self.db.add(bildirim)
        
        self.db.commit()
        self.db.refresh(siparis)
        
        return siparis
    
    def update_durum(
        self,
        siparis_id: str,
        yeni_durum: SiparisDurum,
        user_id: str,
        aciklama: Optional[str] = None
    ) -> Siparis:
        """
        Sipariş durumunu güncelle
        
        Args:
            siparis_id: Sipariş ID
            yeni_durum: Yeni durum
            user_id: İşlemi yapan kullanıcı ID
            aciklama: Durum değişikliği açıklaması
        
        Returns:
            Siparis: Güncellenmiş sipariş
        
        Raises:
            HTTPException: Geçersiz durum geçişi
        """
        siparis = self.db.query(Siparis).filter(Siparis.id == UUID(siparis_id)).first()
        
        if not siparis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sipariş bulunamadı"
            )
        
        # Durum geçiş kontrolü
        if siparis.durum == SiparisDurum.HAZIRLANIYOR and yeni_durum == SiparisDurum.IPTAL_EDILDI:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hazırlanıyor durumundaki sipariş iptal edilemez"
            )
        
        if siparis.durum == SiparisDurum.TESLIM_EDILDI:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Teslim edilmiş sipariş değiştirilemez"
            )
        
        eski_durum = siparis.durum
        siparis.durum = yeni_durum
        
        # Durum geçmişi ekle
        gecmis = SiparisDurumGecmisi(
            siparis_id=siparis.id,
            eski_durum=eski_durum.value,
            yeni_durum=yeni_durum.value,
            aciklama=aciklama,
            degistiren_user_id=user_id
        )
        self.db.add(gecmis)
        
        # Bildirim gönder
        if yeni_durum == SiparisDurum.ONAYLANDI:
            mesaj = f"#{siparis.siparis_no} numaralı siparişiniz onaylandı"
        elif yeni_durum == SiparisDurum.HAZIRLANIYOR:
            mesaj = f"#{siparis.siparis_no} numaralı siparişiniz hazırlanıyor"
        elif yeni_durum == SiparisDurum.YOLDA:
            mesaj = f"#{siparis.siparis_no} numaralı siparişiniz yola çıktı"
        elif yeni_durum == SiparisDurum.TESLIM_EDILDI:
            mesaj = f"#{siparis.siparis_no} numaralı siparişiniz teslim edildi"
            # Ödemeyi onayla
            siparis.odeme_durumu = OdemeDurum.ODENDI
        else:
            mesaj = f"#{siparis.siparis_no} numaralı sipariş durumu: {yeni_durum.value}"
        
        bildirim = Bildirim(
            user_id=siparis.hasta.user_id,
            baslik="Sipariş Güncelleme",
            mesaj=mesaj,
            tip=BildirimTip.SIPARIS,
            link=f"/hasta/siparislerim/{siparis.id}"
        )
        self.db.add(bildirim)
        
        self.db.commit()
        self.db.refresh(siparis)
        
        return siparis
    
    def iptal_et(
        self,
        siparis_id: str,
        iptal_nedeni: str,
        user_id: str
    ) -> Siparis:
        """
        Siparişi iptal et
        
        Args:
            siparis_id: Sipariş ID
            iptal_nedeni: İptal nedeni
            user_id: İptal eden kullanıcı ID
        
        Returns:
            Siparis: İptal edilen sipariş
        """
        siparis = self.db.query(Siparis).filter(Siparis.id == UUID(siparis_id)).first()
        
        if not siparis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sipariş bulunamadı"
            )
        
        # İptal edilebilir mi kontrol et
        if siparis.durum in [SiparisDurum.HAZIRLANIYOR, SiparisDurum.YOLDA, SiparisDurum.TESLIM_EDILDI]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{siparis.durum.value} durumundaki sipariş iptal edilemez"
            )
        
        # Stokları geri ekle
        for detay in siparis.detaylar:
            stok = self.db.query(Stok).filter(
                Stok.eczane_id == siparis.eczane_id,
                Stok.ilac_id == detay.ilac_id
            ).first()
            
            if stok:
                stok.miktar += detay.miktar
        
        # Eski durumu kaydet
        eski_durum = siparis.durum
        
        # Sipariş durumunu güncelle
        siparis.durum = SiparisDurum.IPTAL_EDILDI
        siparis.iptal_nedeni = iptal_nedeni
        siparis.odeme_durumu = OdemeDurum.IADE_EDILDI
        
        # Durum geçmişi ekle
        gecmis = SiparisDurumGecmisi(
            siparis_id=siparis.id,
            eski_durum=eski_durum.value,
            yeni_durum=SiparisDurum.IPTAL_EDILDI.value,
            aciklama=f"İptal nedeni: {iptal_nedeni}",
            degistiren_user_id=user_id
        )
        self.db.add(gecmis)
        
        # Karşı tarafa bildirim gönder
        if str(siparis.hasta.user_id) == user_id:
            # Hasta iptal etti, eczaneye bildir
            bildirim_user_id = siparis.eczane.user_id
            mesaj = f"#{siparis.siparis_no} numaralı sipariş hasta tarafından iptal edildi"
        else:
            # Eczane iptal etti, hastaya bildir
            bildirim_user_id = siparis.hasta.user_id
            mesaj = f"#{siparis.siparis_no} numaralı siparişiniz eczane tarafından iptal edildi. Ödeme iade edilecektir."
        
        bildirim = Bildirim(
            user_id=bildirim_user_id,
            baslik="Sipariş İptal Edildi",
            mesaj=mesaj,
            tip=BildirimTip.SIPARIS
        )
        self.db.add(bildirim)
        
        self.db.commit()
        self.db.refresh(siparis)
        
        return siparis