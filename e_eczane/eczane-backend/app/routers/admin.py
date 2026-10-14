from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.models.eczane import Eczane
from app.models.hasta import Hasta
from app.models.admin import Admin
from app.models.siparis import Siparis
from app.models.doktor import Doktor
from app.schemas.admin import (
    AdminResponse,
    EczaneOnayDetay,
    EczaneOnayAction,
    KullaniciYonetim,
    DashboardIstatistik,
    SiparisIstatistik,
    DoktorDetay,
    DoktorDuzenle,
)
from app.schemas.eczane import EczaneResponse
from app.schemas.hasta import HastaResponse
from app.schemas.siparis import SiparisResponse, SiparisDetayItem
from app.schemas.doktor import DoktorCreate, DoktorResponse
from app.services.admin_service import AdminService
from app.repositories.admin_repository import AdminRepository
from app.utils.enums import OnayDurumu, SiparisDurum

router = APIRouter()


@router.get("/profil", response_model=AdminResponse, summary="Admin Profil")
def get_profil(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Admin profilini görüntüle"""
    admin_repo = AdminRepository(db)
    admin = admin_repo.get_by_user_id(str(current_user.id))
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin profili bulunamadı"
        )
    
    return AdminResponse(
        id=str(admin.id),
        user_id=str(admin.user_id),
        ad=admin.ad,
        soyad=admin.soyad,
        telefon=admin.telefon,
        email=current_user.email,
        created_at=admin.created_at
    )


@router.get("/dashboard", response_model=DashboardIstatistik, summary="Dashboard İstatistikleri")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Dashboard istatistiklerini getir"""
    admin_repo = AdminRepository(db)
    stats = admin_repo.get_dashboard_stats()
    return DashboardIstatistik(**stats)


@router.get("/dashboard/siparis-stats", response_model=SiparisIstatistik, summary="Sipariş İstatistikleri")
def get_siparis_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Sipariş durum istatistiklerini getir"""
    admin_repo = AdminRepository(db)
    stats = admin_repo.get_siparis_stats()
    return SiparisIstatistik(**stats)


@router.get("/eczaneler/bekleyenler", response_model=List[EczaneOnayDetay], summary="Bekleyen Eczaneler")
def get_bekleyen_eczaneler(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Onay bekleyen eczaneleri listele"""
    admin_repo = AdminRepository(db)
    eczaneler = admin_repo.get_bekleyen_eczaneler()
    
    result = []
    for eczane in eczaneler:
        result.append(EczaneOnayDetay(
            id=str(eczane.id),
            user_id=str(eczane.user_id),
            sicil_no=eczane.sicil_no,
            eczane_adi=eczane.eczane_adi,
            adres=eczane.adres,
            telefon=eczane.telefon,
            mahalle=eczane.mahalle,
            email=eczane.user.email,
            eczaci_adi=eczane.eczaci_adi,
            eczaci_soyadi=eczane.eczaci_soyadi,
            eczaci_diploma_no=eczane.eczaci_diploma_no,
            banka_hesap_no=eczane.banka_hesap_no,
            iban=eczane.iban,
            onay_durumu=eczane.onay_durumu.value,
            onay_notu=eczane.onay_notu,
            is_active=eczane.user.is_active,
            created_at=eczane.created_at
        ))
    
    return result


@router.get("/eczaneler", response_model=List[EczaneOnayDetay], summary="Tüm Eczaneler")
def get_all_eczaneler(
    onay_durumu: Optional[str] = Query(None, description="beklemede, onaylandi, reddedildi"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Tüm eczaneleri listele (filtre ile)"""
    admin_repo = AdminRepository(db)
    
    onay_enum = None
    if onay_durumu:
        try:
            onay_enum = OnayDurumu(onay_durumu)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçersiz onay durumu"
            )
    
    eczaneler = admin_repo.get_all_eczaneler(onay_enum)
    
    result = []
    for eczane in eczaneler:
        result.append(EczaneOnayDetay(
            id=str(eczane.id),
            user_id=str(eczane.user_id),
            sicil_no=eczane.sicil_no,
            eczane_adi=eczane.eczane_adi,
            adres=eczane.adres,
            telefon=eczane.telefon,
            mahalle=eczane.mahalle,
            email=eczane.user.email,
            eczaci_adi=eczane.eczaci_adi,
            eczaci_soyadi=eczane.eczaci_soyadi,
            eczaci_diploma_no=eczane.eczaci_diploma_no,
            banka_hesap_no=eczane.banka_hesap_no,
            iban=eczane.iban,
            onay_durumu=eczane.onay_durumu.value,
            onay_notu=eczane.onay_notu,
            is_active=eczane.user.is_active,
            created_at=eczane.created_at
        ))
    
    return result


@router.post("/eczaneler/{eczane_id}/onayla", response_model=EczaneResponse, summary="Eczane Onayla")
def onayla_eczane(
    eczane_id: str,
    action_data: EczaneOnayAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Eczane kaydını onayla"""
    admin_service = AdminService(db)
    return admin_service.onayla_eczane(eczane_id, action_data)


@router.post("/eczaneler/{eczane_id}/reddet", response_model=EczaneResponse, summary="Eczane Reddet")
def reddet_eczane(
    eczane_id: str,
    action_data: EczaneOnayAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Eczane kaydını reddet"""
    admin_service = AdminService(db)
    return admin_service.reddet_eczane(eczane_id, action_data)


@router.put("/eczaneler/{eczane_id}/durum", summary="Eczane Durumu Güncelle")
def update_eczane_durum(
    eczane_id: str,
    yonetim_data: KullaniciYonetim,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Eczane aktif/pasif durumunu güncelle"""
    eczane = db.query(Eczane).filter(Eczane.id == eczane_id).first()
    
    if not eczane:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eczane bulunamadı"
        )
    
    admin_service = AdminService(db)
    user = admin_service.update_kullanici_durum(str(eczane.user_id), yonetim_data)
    
    return {
        "message": "Eczane durumu güncellendi",
        "is_active": user.is_active
    }


@router.get("/hastalar", response_model=List[HastaResponse], summary="Tüm Hastalar")
def get_all_hastalar(
    is_active: Optional[bool] = Query(None, description="true: aktif, false: pasif"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Tüm hastaları listele (filtre ile)"""
    admin_repo = AdminRepository(db)
    hastalar = admin_repo.get_all_hastalar(is_active)
    
    result = []
    for hasta in hastalar:
        result.append(HastaResponse(
            id=str(hasta.id),
            user_id=str(hasta.user_id),
            tc_no=hasta.tc_no,
            ad=hasta.ad,
            soyad=hasta.soyad,
            adres=hasta.adres,
            telefon=hasta.telefon,
            profil_resmi_url=hasta.profil_resmi_url,
            is_active=hasta.user.is_active,
            created_at=hasta.created_at,
            updated_at=hasta.updated_at
        ))
    
    return result


@router.put("/hastalar/{hasta_id}/durum", summary="Hasta Durumu Güncelle")
def update_hasta_durum(
    hasta_id: str,
    yonetim_data: KullaniciYonetim,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Hasta aktif/pasif durumunu güncelle"""
    hasta = db.query(Hasta).filter(Hasta.id == hasta_id).first()
    
    if not hasta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hasta bulunamadı"
        )
    
    admin_service = AdminService(db)
    user = admin_service.update_kullanici_durum(str(hasta.user_id), yonetim_data)
    
    return {
        "message": "Hasta durumu güncellendi",
        "is_active": user.is_active
    }


@router.get("/siparisler", response_model=List[SiparisResponse], summary="Tüm Siparişler")
def get_all_siparisler(
    durum: Optional[str] = Query(None, description="Duruma göre filtrele"),
    baslangic_tarih: Optional[date] = Query(None, description="Başlangıç tarihi"),
    bitis_tarih: Optional[date] = Query(None, description="Bitiş tarihi"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Tüm siparişleri listele (filtreler ve sayfalama ile)"""
    admin_repo = AdminRepository(db)
    
    durum_enum = None
    if durum:
        try:
            durum_enum = SiparisDurum(durum)
        except ValueError:
            pass
    
    siparisler = admin_repo.get_all_siparisler(durum_enum, baslangic_tarih, bitis_tarih)
    
    # Pagination
    total = len(siparisler)
    start = (page - 1) * page_size
    end = start + page_size
    siparisler_page = siparisler[start:end]
    
    result = []
    for siparis in siparisler_page:
        result.append(SiparisResponse(
            id=str(siparis.id),
            siparis_no=siparis.siparis_no,
            eczane_id=str(siparis.eczane_id),
            eczane_adi=siparis.eczane.eczane_adi,
            hasta_id=str(siparis.hasta_id),
            hasta_adi=siparis.hasta.tam_ad,
            recete_id=str(siparis.recete_id) if siparis.recete_id else None,
            toplam_tutar=siparis.toplam_tutar,
            durum=siparis.durum,
            odeme_durumu=siparis.odeme_durumu,
            teslimat_adresi=siparis.teslimat_adresi,
            siparis_notu=siparis.siparis_notu,
            iptal_nedeni=siparis.iptal_nedeni,
            created_at=siparis.created_at,
            updated_at=siparis.updated_at,
            detaylar=[
                SiparisDetayItem(
                    ilac_id=str(d.ilac_id),
                    ilac_adi=d.ilac.ad,
                    barkod=d.ilac.barkod,
                    miktar=d.miktar,
                    birim_fiyat=d.birim_fiyat,
                    ara_toplam=d.ara_toplam
                ) for d in siparis.detaylar
            ]
        ))
    
    return result


@router.get("/siparisler/{siparis_id}", response_model=SiparisResponse, summary="Sipariş Detayı")
def get_siparis_detay(
    siparis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Sipariş detaylarını görüntüle"""
    siparis = db.query(Siparis).filter(Siparis.id == siparis_id).first()
    
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı"
        )
    
    return SiparisResponse(
        id=str(siparis.id),
        siparis_no=siparis.siparis_no,
        eczane_id=str(siparis.eczane_id),
        eczane_adi=siparis.eczane.eczane_adi,
        hasta_id=str(siparis.hasta_id),
        hasta_adi=siparis.hasta.tam_ad,
        recete_id=str(siparis.recete_id) if siparis.recete_id else None,
        toplam_tutar=siparis.toplam_tutar,
        durum=siparis.durum,
        odeme_durumu=siparis.odeme_durumu,
        teslimat_adresi=siparis.teslimat_adresi,
        siparis_notu=siparis.siparis_notu,
        iptal_nedeni=siparis.iptal_nedeni,
        created_at=siparis.created_at,
        updated_at=siparis.updated_at,
        detaylar=[
            SiparisDetayItem(
                ilac_id=str(d.ilac_id),
                ilac_adi=d.ilac.ad,
                barkod=d.ilac.barkod,
                miktar=d.miktar,
                birim_fiyat=d.birim_fiyat,
                ara_toplam=d.ara_toplam
            ) for d in siparis.detaylar
        ]
    )


@router.get("/doktorlar", response_model=List[DoktorDetay], summary="Tüm Doktorlar")
def get_all_doktorlar(
    is_active: Optional[bool] = Query(None, description="true: aktif, false: pasif"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Tüm doktorları listele (filtre ile)"""
    admin_repo = AdminRepository(db)
    doktorlar = admin_repo.get_all_doktorlar(is_active)
    
    result = []
    for doktor in doktorlar:
        result.append(DoktorDetay(
            id=str(doktor.id),
            user_id=str(doktor.user_id),
            diploma_no=doktor.diploma_no,
            ad=doktor.ad,
            soyad=doktor.soyad,
            uzmanlik=doktor.uzmanlik,
            hastane=doktor.hastane,
            telefon=doktor.telefon,
            email=doktor.user.email,
            tam_ad=doktor.tam_ad,
            is_active=doktor.user.is_active,
            created_at=doktor.created_at
        ))
    
    return result


@router.post("/doktorlar", response_model=DoktorResponse, summary="Doktor Ekle")
def create_doktor(
    doktor_data: DoktorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Yeni doktor ekle"""
    admin_service = AdminService(db)
    doktor = admin_service.create_doktor(doktor_data)
    
    return DoktorResponse(
        id=str(doktor.id),
        user_id=str(doktor.user_id),
        diploma_no=doktor.diploma_no,
        ad=doktor.ad,
        soyad=doktor.soyad,
        uzmanlik=doktor.uzmanlik,
        hastane=doktor.hastane,
        telefon=doktor.telefon,
        tam_ad=doktor.tam_ad,
        created_at=doktor.created_at
    )


@router.get("/doktorlar/{doktor_id}", response_model=DoktorDetay, summary="Doktor Detay")
def get_doktor_detay(
    doktor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Doktor detaylarını görüntüle"""
    admin_repo = AdminRepository(db)
    doktor = admin_repo.get_doktor_by_id(doktor_id)
    
    if not doktor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doktor bulunamadı"
        )
    
    return DoktorDetay(
        id=str(doktor.id),
        user_id=str(doktor.user_id),
        diploma_no=doktor.diploma_no,
        ad=doktor.ad,
        soyad=doktor.soyad,
        uzmanlik=doktor.uzmanlik,
        hastane=doktor.hastane,
        telefon=doktor.telefon,
        email=doktor.user.email,
        tam_ad=doktor.tam_ad,
        is_active=doktor.user.is_active,
        created_at=doktor.created_at
    )


@router.put("/doktorlar/{doktor_id}", response_model=DoktorDetay, summary="Doktor Güncelle")
def update_doktor(
    doktor_id: str,
    doktor_data: DoktorDuzenle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Doktor bilgilerini güncelle"""
    admin_service = AdminService(db)
    doktor = admin_service.update_doktor(doktor_id, doktor_data)
    
    return DoktorDetay(
        id=str(doktor.id),
        user_id=str(doktor.user_id),
        diploma_no=doktor.diploma_no,
        ad=doktor.ad,
        soyad=doktor.soyad,
        uzmanlik=doktor.uzmanlik,
        hastane=doktor.hastane,
        telefon=doktor.telefon,
        email=doktor.user.email,
        tam_ad=doktor.tam_ad,
        is_active=doktor.user.is_active,
        created_at=doktor.created_at
    )


@router.put("/doktorlar/{doktor_id}/durum", summary="Doktor Durumu Güncelle")
def update_doktor_durum(
    doktor_id: str,
    yonetim_data: KullaniciYonetim,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Doktor aktif/pasif durumunu güncelle"""
    admin_repo = AdminRepository(db)
    doktor = admin_repo.get_doktor_by_id(doktor_id)
    
    if not doktor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doktor bulunamadı"
        )
    
    admin_service = AdminService(db)
    user = admin_service.update_kullanici_durum(str(doktor.user_id), yonetim_data)
    
    return {
        "message": "Doktor durumu güncellendi",
        "is_active": user.is_active
    }
