import sqlite3
import os
from datetime import datetime
from logger import get_logger

logger = get_logger("DatabaseCore")

DB_PATH = os.path.join(os.path.dirname(__file__), "lumina_master.db")

def init_master_db():
    """Initializes schema tables if they do not exist."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # User Profile Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Biometric Embeddings Matrix
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS face_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                embedding TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Health Metrics Log (Heart Rate, Mood, Anxiety)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS health_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                timestamp TEXT NOT NULL,
                heart_rate REAL,
                mood TEXT,
                anxiety_level TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Cached Smart Schedule Meetings Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scheduled_meetings (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                location TEXT,
                priority TEXT DEFAULT 'NORMAL'
            )
        """)
        
        conn.commit()
        logger.info("SQLite database schema checked and initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize SQLite database at {DB_PATH}: {e}", exc_info=True)
    finally:
        if 'conn' in locals():
            conn.close()

def log_health_metrics(username: str, heart_rate: float, mood: str, anxiety: str):
    """Safely logs heart rate, mood, and anxiety for a recognized user."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        user_row = cursor.fetchone()
        
        if not user_row:
            cursor.execute("INSERT INTO users (username) VALUES (?)", (username,))
            conn.commit()
            cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
            user_row = cursor.fetchone()
            
        if user_row:
            user_id = user_row[0]
            now = datetime.now().isoformat()
            cursor.execute("""
                INSERT INTO health_analytics (user_id, timestamp, heart_rate, mood, anxiety_level)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, now, heart_rate, mood, anxiety))
            conn.commit()
            logger.info(f"Logged biological metrics for user '{username}' (HR: {heart_rate}, Mood: {mood}).")
    except Exception as e:
        logger.error(f"Failed to log health metrics for user '{username}': {e}", exc_info=True)
    finally:
        if 'conn' in locals():
            conn.close()

def get_historical_trends(username: str):
    """Retrieves up to 50 historical health analytics entries for a user."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT timestamp, heart_rate, mood, anxiety_level 
            FROM health_analytics 
            JOIN users ON users.id = health_analytics.user_id
            WHERE users.username = ? ORDER BY timestamp DESC LIMIT 50
        """, (username,))
        rows = cursor.fetchall()
        return [{"timestamp": r[0], "heart_rate": r[1], "mood": r[2], "anxiety": r[3]} for r in rows]
    except Exception as e:
        logger.error(f"Failed to fetch historical trends for user '{username}': {e}", exc_info=True)
        return []
    finally:
        if 'conn' in locals():
            conn.close()