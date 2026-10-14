from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import UserLogin, Token, PasswordChange, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.hasta import HastaCreate, HastaResponse
from app.schemas.eczane import EczaneCreate, EczaneResponse
from app.schemas.doktor import DoktorCreate, DoktorResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.models.user import User
from app.core.security import verify_password, get_password_hash


router = APIRouter()


@router.post("/login", response_model=Token, summary="Kullanıcı Girişi")
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Kullanıcı girişi yapar ve JWT token döner
    
    - **identifier**: Email, TC No, Sicil No veya Diploma No
    - **password**: Şifre
    - **user_type**: hasta, eczane, admin veya doktor
    """
    auth_service = AuthService(db)
    return auth_service.login(login_data)


@router.post(
    "/register/hasta",
    response_model=HastaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Hasta Kaydı"
)
def register_hasta(
    hasta_data: HastaCreate,
    db: Session = Depends(get_db)
):
    """
    Yeni hasta kaydı oluşturur
    
    Kayıt sonrası direkt aktif olur, giriş yapabilir
    """
    auth_service = AuthService(db)
    return auth_service.register_hasta(hasta_data)


@router.post(
    "/register/eczane",
    status_code=status.HTTP_201_CREATED,
    summary="Eczane Kaydı"
)
def register_eczane(
    eczane_data: EczaneCreate,
    db: Session = Depends(get_db)
):
    """
    Yeni eczane kaydı oluşturur
    
    Kayıt sonrası admin onayı bekler. Onaylanmadan giriş yapamaz.
    """
    auth_service = AuthService(db)
    eczane = auth_service.register_eczane(eczane_data)
    
    return {
        "id": str(eczane.id),
        "user_id": str(eczane.user_id),
        "sicil_no": eczane.sicil_no,
        "eczane_adi": eczane.eczane_adi,
        "adres": eczane.adres,
        "telefon": eczane.telefon,
        "mahalle": eczane.mahalle,
        "eczaci_adi": eczane.eczaci_adi,
        "eczaci_soyadi": eczane.eczaci_soyadi,
        "eczaci_diploma_no": eczane.eczaci_diploma_no,
        "banka_hesap_no": eczane.banka_hesap_no,
        "iban": eczane.iban,
        "onay_durumu": eczane.onay_durumu.value,
        "onay_notu": eczane.onay_notu,
        "created_at": eczane.created_at.isoformat(),
        "message": "Eczane kaydınız oluşturuldu. Admin onayı bekleniyor."
    }


@router.post(
    "/register/doktor",
    status_code=status.HTTP_201_CREATED,
    summary="Doktor Kaydı"
)
def register_doktor(
    doktor_data: DoktorCreate,
    db: Session = Depends(get_db)
):
    """
    Yeni doktor kaydı oluşturur
    
    Kayıt sonrası direkt aktif olur, giriş yapabilir
    """
    auth_service = AuthService(db)
    doktor = auth_service.register_doktor(doktor_data)
    
    return {
        "id": str(doktor.id),
        "user_id": str(doktor.user_id),
        "diploma_no": doktor.diploma_no,
        "ad": doktor.ad,
        "soyad": doktor.soyad,
        "uzmanlik": doktor.uzmanlik,
        "hastane": doktor.hastane,
        "telefon": doktor.telefon,
        "created_at": doktor.created_at.isoformat(),
        "message": "Doktor kaydınız başarıyla oluşturuldu. Hemen giriş yapabilirsiniz."
    }


@router.get("/me", response_model=UserResponse, summary="Mevcut Kullanıcı Bilgisi")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Mevcut oturum açmış kullanıcının bilgilerini döner
    
    **Authorization header gerekli**: Bearer {access_token}
    """
    return current_user


@router.post("/change-password", summary="Şifre Değiştir")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kullanıcının şifresini değiştirir
    
    **Authorization header gerekli**: Bearer {access_token}
    """
    # Eski şifre kontrolü
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mevcut şifreniz hatalı"
        )
    
    # Yeni şifreyi hash'le ve kaydet
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Şifreniz başarıyla değiştirildi"}


@router.post("/logout", summary="Çıkış Yap")
def logout():
    """
    Çıkış yapar (Frontend'de token'ı siler)
    
    Not: Sunucu tarafında session yok, token frontend'de silinmeli
    """
    return {"message": "Başarıyla çıkış yapıldı"}


@router.post("/forgot-password", summary="Şifremi Unuttum")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Şifre sıfırlama e-postası gönderir
    
    Güvenlik nedeniyle her zaman aynı başarılı yanıtı döner
    """
    auth_service = AuthService(db)
    return auth_service.forgot_password(request.email)


@router.post("/reset-password", summary="Şifre Sıfırla")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Token ile şifreyi sıfırlar
    
    - **token**: E-posta ile gönderilen şifre sıfırlama token'ı
    - **new_password**: Yeni şifre (en az 8 karakter, büyük/küçük harf ve rakam içermeli)
    - **new_password_confirm**: Yeni şifre tekrarı
    """
    auth_service = AuthService(db)
    return auth_service.reset_password(request.token, request.new_password)


@router.get("/verify-reset-token/{token}", summary="Token Doğrula")
def verify_reset_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Şifre sıfırlama token'ının geçerliliğini kontrol eder
    """
    auth_service = AuthService(db)
    return auth_service.verify_reset_token(token)
