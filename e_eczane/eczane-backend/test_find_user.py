#!/usr/bin/env python3
"""
Kullanıcı bulma fonksiyonunu test eden script
"""

import os
import sys
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.utils.enums import UserType

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_find_user():
    """Kullanıcı bulma fonksiyonunu test et"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        auth_service = AuthService(db)
        
        # Test cases
        test_cases = [
            {
                "name": "Admin by email",
                "identifier": "admin@eczane.com",
                "user_type": UserType.ADMIN
            },
            {
                "name": "Hasta by email",
                "identifier": "test@hasta.com",
                "user_type": UserType.HASTA
            },
            {
                "name": "Hasta by TC No",
                "identifier": "12345678902",
                "user_type": UserType.HASTA
            },
            {
                "name": "Eczane by email",
                "identifier": "test@eczane.com",
                "user_type": UserType.ECZANE
            },
            {
                "name": "Eczane by Sicil No",
                "identifier": "TEST123456",
                "user_type": UserType.ECZANE
            },
            {
                "name": "Non-existent user",
                "identifier": "nonexistent@test.com",
                "user_type": UserType.HASTA
            }
        ]
        
        for case in test_cases:
            print(f"\n--- {case['name']} ---")
            user = auth_service._find_user_by_identifier(case['identifier'], case['user_type'])
            if user:
                print(f"✅ Kullanıcı bulundu: {user.email}")
            else:
                print("❌ Kullanıcı bulunamadı")
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_find_user()