"""Test database connection and add sample medicines"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from sqlalchemy import text

print("Testing database connection...")
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"✅ Database connection OK: {result.fetchone()}")
except Exception as e:
    print(f"❌ Database error: {e}")
    sys.exit(1)

# Now run seed
print("\nRunning seed data...")
from app.scripts.seed_data import main
main()
