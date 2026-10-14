"""
Migration script to add location columns (mahalle, ilce, il) to hastalar table.
Run this script once to apply the database changes.
"""
import sys
sys.path.insert(0, '.')

from sqlalchemy import text
from app.core.database import engine

def add_location_columns():
    """Add mahalle, ilce, il columns to hastalar table if they don't exist"""
    
    with engine.connect() as conn:
        # Check if columns exist and add them if not
        columns_to_add = [
            ("mahalle", "VARCHAR(100)"),
            ("ilce", "VARCHAR(100)"),
            ("il", "VARCHAR(100)")
        ]
        
        for column_name, column_type in columns_to_add:
            try:
                # Check if column exists
                result = conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'hastalar' AND column_name = '{column_name}'
                """))
                
                if result.fetchone() is None:
                    # Column doesn't exist, add it
                    conn.execute(text(f"""
                        ALTER TABLE hastalar 
                        ADD COLUMN {column_name} {column_type}
                    """))
                    print(f"✅ Added column: {column_name}")
                    
                    # Create index for the column
                    conn.execute(text(f"""
                        CREATE INDEX IF NOT EXISTS ix_hastalar_{column_name} 
                        ON hastalar ({column_name})
                    """))
                    print(f"   Created index: ix_hastalar_{column_name}")
                else:
                    print(f"ℹ️  Column already exists: {column_name}")
                    
            except Exception as e:
                print(f"❌ Error adding column {column_name}: {e}")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    print("🔄 Running migration: Add location columns to hastalar table\n")
    add_location_columns()
