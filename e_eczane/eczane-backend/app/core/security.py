from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Düz şifreyi hash'lenmiş şifre ile karşılaştır
    
    Args:
        plain_password: Kullanıcının girdiği düz şifre
        hashed_password: Database'deki hash'lenmiş şifre
    
    Returns:
        bool: Şifreler eşleşiyorsa True
    """
    return pwd_context.verify(plain_password, hashed_password)




def get_password_hash(password: str) -> str:
    """
    Düz şifreyi hash'le
    
    Args:
        password: Hash'lenecek düz şifre
    
    Returns:
        str: Hash'lenmiş şifre
    """
    return pwd_context.hash(password)




def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    JWT access token oluştur
    
    Args:
        data: Token'a eklenecek veriler (user_id, email, role vb.)
        expires_delta: Token'ın geçerlilik süresi
    
    Returns:
        str: JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt




def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    JWT token'ı decode et ve içindeki veriyi al
    
    Args:
        token: Decode edilecek JWT token
    
    Returns:
        Dict: Token içindeki veriler veya None
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None




def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    JWT refresh token oluştur (7 günlük)
    
    Args:
        data: Token'a eklenecek veriler
    
    Returns:
        str: JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_password_reset_token(email: str) -> str:
    """
    Şifre sıfırlama token'ı oluştur (1 saatlik)
    
    Args:
        email: Kullanıcının email adresi
    
    Returns:
        str: JWT password reset token
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    to_encode = {
        "email": email,
        "exp": expire,
        "type": "password_reset"
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Şifre sıfırlama token'ını doğrula
    
    Args:
        token: Doğrulanacak JWT token
    
    Returns:
        str: Token geçerliyse email adresi, değilse None
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        if payload.get("type") != "password_reset":
            return None
        
        email = payload.get("email")
        return email
        
    except JWTError:
        return None





