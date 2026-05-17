import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from app.config import DATABASE_URL

def get_conn():
    return psycopg2.connect(DATABASE_URL)

if __name__ == "__main__":
    conn = get_conn()
    print("✅ DB Connected!")
    conn.close()