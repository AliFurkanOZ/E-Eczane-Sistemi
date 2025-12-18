"""
Migration script to add ilce and il columns to eczaneler table.
Run this script once after deploying the new code if you have an existing database.

Usage:
    cd e_eczane/eczane-backend
    python -m app.scripts.migrate_eczane_location
"""

from sqlalchemy import text
from app.core.database import engine


def migrate():
    """Add ilce and il columns to eczaneler table if they don't exist."""
    
    with engine.connect() as conn:
        # Check if columns exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'eczaneler' 
            AND column_name IN ('ilce', 'il')
        """))
        existing_columns = [row[0] for row in result]
        
        # Add ilce column if not exists
        if 'ilce' not in existing_columns:
            print("Adding 'ilce' column to eczaneler table...")
            conn.execute(text("""
                ALTER TABLE eczaneler 
                ADD COLUMN ilce VARCHAR(100)
            """))
            conn.execute(text("""
                CREATE INDEX ix_eczaneler_ilce ON eczaneler(ilce)
            """))
            print("Successfully added 'ilce' column.")
        else:
            print("'ilce' column already exists.")
        
        # Add il column if not exists
        if 'il' not in existing_columns:
            print("Adding 'il' column to eczaneler table...")
            conn.execute(text("""
                ALTER TABLE eczaneler 
                ADD COLUMN il VARCHAR(100)
            """))
            conn.execute(text("""
                CREATE INDEX ix_eczaneler_il ON eczaneler(il)
            """))
            print("Successfully added 'il' column.")
        else:
            print("'il' column already exists.")
        
        conn.commit()
        print("Migration completed successfully!")


if __name__ == "__main__":
    migrate()
