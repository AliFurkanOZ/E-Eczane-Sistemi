from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_eczane
from app.models.user import User
from app.models.eczane import Eczane
from app.models.siparis import Siparis
from app.models.hasta import Hasta
from app.schemas.stok import (
    StokResponse, StokCreate, StokUpdate, 
    StokUyari, IlacEkle
)
from app.schemas.eczane import EczaneResponse, EczaneUpdate
from app.schemas.siparis import (
    SiparisResponse, SiparisDetayItem,
    SiparisDurumGuncelle, SiparisIptal
)
from app.services.eczane_service import EczaneService
from app.services.siparis_service import SiparisService
from app.repositories.stok_repository import StokRepository
from app.repositories.eczane_repository import EczaneRepository
from app.utils.enums import SiparisDurum
from app.utils.email import send_order_status_email

router = APIRouter(tags=["Eczane"])


def siparis_to_response(siparis: Siparis, db: Session) -> SiparisResponse:
    """
    Convert a Siparis model to SiparisResponse, properly handling the 
    detaylar conversion with ilac_adi and barkod from related ilac objects.
    """
    # Get eczane and hasta names
    eczane = db.query(Eczane).filter(Eczane.id == siparis.eczane_id).first()
    hasta = db.query(Hasta).filter(Hasta.id == siparis.hasta_id).first()
    
    # Build detaylar manually because SiparisDetay doesn't have ilac_adi/barkod columns directly
    detaylar_response = []
    for detay in siparis.detaylar:
        detaylar_response.append(SiparisDetayItem(
            ilac_id=str(detay.ilac_id),
            ilac_adi=detay.ilac.ad if detay.ilac else "Bilinmeyen İlaç",
            barkod=detay.ilac.barkod if detay.ilac else "",
            miktar=detay.miktar,
            birim_fiyat=detay.birim_fiyat,
            ara_toplam=detay.ara_toplam
        ))
    
    return SiparisResponse(
        id=str(siparis.id),
        siparis_no=siparis.siparis_no,
        eczane_id=str(siparis.eczane_id),
        eczane_adi=eczane.eczane_adi if eczane else "Bilinmeyen Eczane",
        hasta_id=str(siparis.hasta_id),
        hasta_adi=hasta.tam_ad if hasta else "Bilinmeyen Hasta",
        recete_id=str(siparis.recete_id) if siparis.recete_id else None,
        toplam_tutar=siparis.toplam_tutar,
        durum=siparis.durum,
        odeme_durumu=siparis.odeme_durumu,
        teslimat_adresi=siparis.teslimat_adresi,
        siparis_notu=siparis.siparis_notu,
        iptal_nedeni=siparis.iptal_nedeni,
        created_at=siparis.created_at,
        updated_at=siparis.updated_at,
        detaylar=detaylar_response
    )


# ==================== PROFİL ====================

@router.get("/profil", response_model=EczaneResponse, summary="Profil Görüntüle")
def get_profil(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczane profilini görüntüle
    
    Returns:
        EczaneResponse: Eczane profil bilgileri
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    if not eczane:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eczane profili bulunamadı"
        )
    return eczane

@router.put("/profil", response_model=EczaneResponse, summary="Profil Güncelle")
def update_profil(
    update_data: EczaneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczane profilini güncelle
    
    Args:
        update_data: Güncellenecek profil verileri
    
    Returns:
        EczaneResponse: Güncellenmiş profil
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    if not eczane:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eczane profili bulunamadı"
        )
    eczane_service = EczaneService(db)
    return eczane_service.update_profil(eczane.id, update_data)

# ==================== STOK YÖNETİMİ ====================

@router.get("/stoklar", response_model=List[StokResponse], summary="Stokları Listele")
def list_stoklar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczaneye ait tüm stokları listele
    
    Returns:
        List[StokResponse]: Stok listesi
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stoklar = stok_repo.get_by_eczane(eczane.id)
    # This response construction is kept as is because it's for the final JSON output
    # The error was in the data passed to the repository, not in the response model building.
    return stoklar

@router.get("/stoklar/uyarilar", response_model=List[StokUyari], summary="Stok Uyarıları")
def get_stok_uyarilari(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Düşük stok uyarılarını getir
    
    Returns:
        List[StokUyari]: Düşük stok uyarıları
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    eczane_service = EczaneService(db)
    return eczane_service.get_stok_uyarilari(eczane.id)

@router.post("/stoklar", response_model=StokResponse, status_code=status.HTTP_201_CREATED, summary="Stok Ekle")
def add_stok(
    stok_data: StokCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Yeni stok ekle
    
    Args:
        stok_data: Stok bilgileri
    
    Returns:
        StokResponse: Oluşturulan stok
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stok = stok_repo.create(eczane.id, stok_data)
    # The response model will handle the conversion
    return stok

@router.put("/stoklar/{stok_id}", response_model=StokResponse, summary="Stok Güncelle")
def update_stok(
    stok_id: uuid.UUID,
    stok_data: StokUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Stok bilgilerini güncelle
    
    Args:
        stok_id: Stok ID
        stok_data: Güncellenecek veriler
    
    Returns:
        StokResponse: Güncellenmiş stok
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stok = stok_repo.get_by_id(stok_id)
    if not stok or stok.eczane_id != eczane.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stok bulunamadı"
        )
    stok = stok_repo.update(stok_id, stok_data)
    return stok

@router.delete("/stoklar/{stok_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Stok Sil")
def delete_stok(
    stok_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Stok kaydını sil
    
    Args:
        stok_id: Stok ID
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    stok_repo = StokRepository(db)
    stok = stok_repo.get_by_id(stok_id)
    if not stok or stok.eczane_id != eczane.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stok bulunamadı"
        )
    stok_repo.delete(stok_id)
    return None

@router.post("/urun-ekle", response_model=StokResponse, status_code=status.HTTP_201_CREATED, summary="Reçetesiz Ürün Ekle")
def add_recetesiz_urun(
    ilac_data: IlacEkle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Reçetesiz ilaç/ürün ekle
    
    İlaç sistemde yoksa oluşturur, varsa sadece stok ekler.
    
    Args:
        ilac_data: İlaç ve stok bilgileri
    
    Returns:
        StokResponse: Oluşturulan stok
    """
    import traceback
    try:
        print(f"[DEBUG] add_recetesiz_urun called with: {ilac_data}")
        eczane_repo = EczaneRepository(db)
        eczane = eczane_repo.get_by_user_id(current_user.id)
        print(f"[DEBUG] Found eczane: {eczane}")
        
        if not eczane:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Eczane profili bulunamadı"
            )
        
        eczane_service = EczaneService(db)
        _, stok = eczane_service.add_recetesiz_ilac(eczane.id, ilac_data)
        print(f"[DEBUG] Created stok: {stok}")
        print(f"[DEBUG] Stok ilac: {stok.ilac}")
        print(f"[DEBUG] Stok ilac_adi: {stok.ilac_adi}")
        return stok
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Exception in add_recetesiz_urun: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"İç sunucu hatası: {str(e)}"
        )

# ==================== SİPARİŞ YÖNETİMİ ====================

@router.get("/siparisler", response_model=List[SiparisResponse], summary="Siparişleri Listele")
def list_siparisler(
    durum: Optional[str] = Query(None, description="Duruma göre filtrele"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Eczaneye ait siparişleri listele
    
    Args:
        durum: Sipariş durumu filtresi (opsiyonel)
        page: Sayfa numarası
        page_size: Sayfa boyutu
    
    Returns:
        List[SiparisResponse]: Sipariş listesi
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    query = db.query(Siparis).filter(Siparis.eczane_id == eczane.id)
    if durum:
        try:
            durum_enum = SiparisDurum(durum)
            query = query.filter(Siparis.durum == durum_enum)
        except ValueError:
            pass
    
    offset = (page - 1) * page_size
    siparisler = query.order_by(Siparis.created_at.desc()).offset(offset).limit(page_size).all()
    # Use helper function to properly convert detaylar
    return [siparis_to_response(s, db) for s in siparisler]

@router.get("/siparisler/{siparis_id}", response_model=SiparisResponse, summary="Sipariş Detayı")
def get_siparis_detay(
    siparis_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Sipariş detaylarını görüntüle
    
    Args:
        siparis_id: Sipariş ID
    
    Returns:
        SiparisResponse: Sipariş detayları
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    siparis = db.query(Siparis).filter(
        Siparis.id == siparis_id,
        Siparis.eczane_id == eczane.id
    ).first()
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı"
        )
    return siparis_to_response(siparis, db)

@router.put("/siparisler/{siparis_id}/durum", response_model=SiparisResponse, summary="Sipariş Durumu Güncelle")
def update_siparis_durum(
    siparis_id: uuid.UUID,
    durum_data: SiparisDurumGuncelle,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Sipariş durumunu güncelle (Eczane için)
    
    Args:
        siparis_id: Sipariş ID
        durum_data: Yeni durum bilgisi
    
    Returns:
        SiparisResponse: Güncellenmiş sipariş
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    
    # Sipariş kontrolü
    siparis_service = SiparisService(db)
    siparis = siparis_service.get_siparis_by_id_and_eczane(siparis_id, eczane.id)
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı"
        )
    
    # E-posta için gerekli bilgileri önceden al (DB session kapandıktan sonra kullanmak için)
    hasta_email = siparis.hasta.user.email
    hasta_adi = siparis.hasta.tam_ad
    eczane_adi = eczane.eczane_adi
    
    siparis = siparis_service.update_durum(
        siparis_id=siparis_id,
        yeni_durum=durum_data.yeni_durum,
        user_id=current_user.id,
        aciklama=durum_data.aciklama
    )
    
    # E-postayı arka planda gönder (yanıtı beklemeden)
    status_key = durum_data.yeni_durum.value.upper()
    background_tasks.add_task(
        send_order_status_email,
        to_email=hasta_email,
        order_id=str(siparis.id),
        status=status_key,
        patient_name=hasta_adi,
        eczane_adi=eczane_adi
    )
    
    return siparis_to_response(siparis, db)

@router.post("/siparisler/{siparis_id}/onayla", response_model=SiparisResponse, summary="Sipariş Onayla")
def onayla_siparis(
    siparis_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Siparişi onayla ve hazırlanmaya başla
    
    Args:
        siparis_id: Sipariş ID
    
    Returns:
        SiparisResponse: Onaylanmış sipariş
    """
    durum_data = SiparisDurumGuncelle(
        yeni_durum=SiparisDurum.HAZIRLANIYOR,
        aciklama="Sipariş onaylandı ve hazırlanmaya başlandı"
    )
    # Re-use the update function
    return update_siparis_durum(siparis_id, durum_data, background_tasks, db, current_user)


@router.post("/siparisler/{siparis_id}/iptal", response_model=SiparisResponse, summary="Sipariş İptal Et")
def iptal_siparis(
    siparis_id: uuid.UUID,
    iptal_data: SiparisIptal,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_eczane)
):
    """
    Siparişi iptal et (Eczane için)
    
    Args:
        siparis_id: Sipariş ID
        iptal_data: İptal nedeni
    
    Returns:
        SiparisResponse: İptal edilmiş sipariş
    """
    eczane_repo = EczaneRepository(db)
    eczane = eczane_repo.get_by_user_id(current_user.id)
    
    # Sipariş kontrolü
    siparis_service = SiparisService(db)
    siparis = siparis_service.get_siparis_by_id_and_eczane(siparis_id, eczane.id)
    if not siparis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı"
        )
    
    # E-posta için gerekli bilgileri önceden al
    hasta_email = siparis.hasta.user.email
    hasta_adi = siparis.hasta.tam_ad
    eczane_adi = eczane.eczane_adi
    
    siparis = siparis_service.iptal_et(
        siparis_id=siparis_id,
        iptal_nedeni=iptal_data.iptal_nedeni,
        user_id=current_user.id
    )
    
    # İptal e-postasını arka planda gönder
    background_tasks.add_task(
        send_order_status_email,
        to_email=hasta_email,
        order_id=str(siparis.id),
        status="IPTAL_EDILDI",
        patient_name=hasta_adi,
        cancel_reason=iptal_data.iptal_nedeni,
        eczane_adi=eczane_adi
    )
    
    return siparis_to_response(siparis, db)
