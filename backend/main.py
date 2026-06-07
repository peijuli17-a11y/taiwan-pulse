from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from database import init_db
from etl import run_etl
import sqlite3
import os

app = FastAPI(title="Taiwan Pulse API")

# 允許前端跨域存取
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "taiwan.db")

def query_db(sql, params=()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(sql, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ────────────────────────────────
# API 端點
# ────────────────────────────────

@app.get("/")
def root():
    return {"message": "Taiwan Pulse API is running 🇹🇼"}

@app.get("/api/population")
def get_population():
    data = query_db("SELECT * FROM population ORDER BY year")
    return {"data": data}

@app.get("/api/gdp")
def get_gdp():
    data = query_db("SELECT * FROM gdp ORDER BY year")
    return {"data": data}

@app.get("/api/energy")
def get_energy():
    data = query_db("SELECT * FROM energy ORDER BY year")
    return {"data": data}

@app.get("/api/consumption")
def get_consumption():
    data = query_db("SELECT * FROM consumption ORDER BY year")
    return {"data": data}

@app.get("/api/summary")
def get_summary():
    """最新一年各指標摘要，用於 KPI 卡片"""
    pop = query_db("SELECT * FROM population ORDER BY year DESC LIMIT 1")
    gdp = query_db("SELECT * FROM gdp ORDER BY year DESC LIMIT 1")
    energy = query_db("SELECT * FROM energy ORDER BY year DESC LIMIT 1")
    consumption = query_db("SELECT * FROM consumption ORDER BY year DESC LIMIT 1")
    return {
        "population": pop[0] if pop else {},
        "gdp": gdp[0] if gdp else {},
        "energy": energy[0] if energy else {},
        "consumption": consumption[0] if consumption else {},
    }

@app.post("/api/refresh")
def manual_refresh():
    """手動觸發 ETL 更新"""
    try:
        run_etl()
        return {"status": "success", "message": "資料更新完成"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ────────────────────────────────
# 啟動時初始化 + 定時排程
# ────────────────────────────────

@app.on_event("startup")
def startup_event():
    init_db()
    run_etl()
    # 每天凌晨 2 點自動更新
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_etl, "cron", hour=2, minute=0)
    scheduler.start()
    print("⏰ 排程器啟動，每天 02:00 自動更新資料")