import sqlite3
import os

# 資料庫檔案路徑
DB_PATH = os.path.join(os.path.dirname(__file__), "taiwan.db")

def get_connection():
    """取得資料庫連線"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化資料庫，建立所有資料表"""
    conn = get_connection()
    cursor = conn.cursor()

    # 人口資料表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS population (
            year INTEGER PRIMARY KEY,
            total INTEGER,
            birth_rate REAL,
            death_rate REAL,
            growth_rate REAL
        )
    """)

    # GDP 資料表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS gdp (
            year INTEGER PRIMARY KEY,
            gdp_usd REAL,
            gdp_growth REAL,
            gdp_per_capita REAL
        )
    """)

    # 能源資料表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS energy (
            year INTEGER PRIMARY KEY,
            total_TWh REAL,
            renewable_TWh REAL,
            renewable_pct REAL,
            coal_pct REAL,
            nuclear_pct REAL
        )
    """)

    # 消費資料表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS consumption (
            year INTEGER PRIMARY KEY,
            household_consumption REAL,
            cpi REAL,
            cpi_growth REAL
        )
    """)

    conn.commit()
    conn.close()
    print("✅ 資料庫初始化完成")
    