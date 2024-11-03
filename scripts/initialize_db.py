# initialize_db.py

import os
import psycopg2
from dotenv import load_dotenv

def initialize_database(conn):
    with conn.cursor() as cursor:
        # Enable pgvector extension (if needed in future)
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")

        # Create videos table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS videos (
                video_id VARCHAR PRIMARY KEY,
                title TEXT,
                description TEXT,
                published_at TIMESTAMP
            );
        """)

        # Create segments table with start, duration, text fields
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS segments (
                segment_id SERIAL PRIMARY KEY,
                video_id VARCHAR REFERENCES videos(video_id),
                start FLOAT,
                duration FLOAT,
                text TEXT
            );
        """)

    conn.commit()
    print("Database initialized successfully with updated schema.")

def main():
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL:
        raise ValueError("DATABASE_URL not found in environment variables.")

    conn = psycopg2.connect(DATABASE_URL)

    try:
        initialize_database(conn)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
