from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.utils.enums import UserType


# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")




async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    JWT token'dan mevcut kullanıcıyı al
    
    Args:
        token: Authorization header'dan alınan JWT token
        db: Database session
    
    Returns:
        User: Mevcut kullanıcı
    
    Raises:
        HTTPException: Token geçersiz veya kullanıcı bulunamadı
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulaması başarısız",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Token'ı decode et
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
    
    # Kullanıcıyı database'den al
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if user is None:
        raise credentials_exception
    
    # Kullanıcı aktif mi kontrol et
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kullanıcı hesabı pasif durumda"
        )
    
    return user




def require_role(*allowed_roles: UserType):
    """
    Belirli rollere izin veren decorator
    
    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(current_user: User = Depends(require_role(UserType.ADMIN))):
            ...
    
    Args:
        allowed_roles: İzin verilen roller
    
    Returns:
        Dependency function
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.user_type not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bu işlem için yetkiniz yok. Gerekli rol: {', '.join([r.value for r in allowed_roles])}"
            )
        return current_user
    
    return role_checker




# Specific role dependencies
async def get_current_hasta(current_user: User = Depends(require_role(UserType.HASTA))) -> User:
    """Sadece hasta kullanıcılar için"""
    return current_user




async def get_current_eczane(current_user: User = Depends(require_role(UserType.ECZANE))) -> User:
    """Sadece eczane kullanıcıları için"""
    return current_user




async def get_current_admin(current_user: User = Depends(require_role(UserType.ADMIN))) -> User:
    """Sadece admin kullanıcıları için"""
    return current_user




# Optional current user (token olmadan da çalışır)
async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional: Token varsa kullanıcıyı döner, yoksa None döner
    Public endpoint'ler için kullanılır
    """
    if token is None:
        return None
    
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None





