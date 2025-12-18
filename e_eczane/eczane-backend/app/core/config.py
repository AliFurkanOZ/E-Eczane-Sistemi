from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict
from typing import List, Union


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True
    )
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Email Settings
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@e-eczane.com"
    MAIL_FROM_NAME: str = "E-Eczane Sistemi"
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:5174"
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v


settings = Settings()


