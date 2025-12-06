#!/usr/bin/env python3
"""
Login fonksiyonunu test eden script
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import UserLogin
from app.utils.enums import UserType

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_login_service():
    """Login fonksiyonunu test et"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        auth_service = AuthService(db)
        
        # Test cases
        test_cases = [
            {
                "name": "Admin Login",
                "login_data": UserLogin(
                    identifier="admin@eczane.com",
                    password="Admin123!",
                    user_type=UserType.ADMIN
                )
            },
            {
                "name": "Hasta Login",
                "login_data": UserLogin(
                    identifier="test@hasta.com",
                    password="Test123!",
                    user_type=UserType.HASTA
                )
            },
            {
                "name": "Eczane Login",
                "login_data": UserLogin(
                    identifier="test@eczane.com",
                    password="Test123!",
                    user_type=UserType.ECZANE
                )
            },
            {
                "name": "Wrong Password",
                "login_data": UserLogin(
                    identifier="admin@eczane.com",
                    password="WrongPassword!",
                    user_type=UserType.ADMIN
                )
            }
        ]
        
        for case in test_cases:
            print(f"\n--- {case['name']} ---")
            try:
                token = auth_service.login(case['login_data'])
                print(f"✅ Başarılı")
                print(f"  Access Token: {token.access_token[:20]}...")
                print(f"  User Type: {token.user_type}")
                print(f"  User ID: {token.user_id}")
            except Exception as e:
                print(f"❌ Hata: {e}")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_login_service()