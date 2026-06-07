import pandas as pd
from database import get_connection, init_db

# ─────────────────────────────────────────
# 人口資料（來源：內政部統計年報整理）
# ─────────────────────────────────────────
def fetch_population():
    print("📥 載入人口資料...")
    rows = [
        {"year": 2015, "total": 23492074, "birth_rate": 9.1, "death_rate": 7.0, "growth_rate": 0.21},
        {"year": 2016, "total": 23539588, "birth_rate": 8.9, "death_rate": 7.3, "growth_rate": 0.18},
        {"year": 2017, "total": 23571227, "birth_rate": 8.3, "death_rate": 7.4, "growth_rate": 0.13},
        {"year": 2018, "total": 23588932, "birth_rate": 7.7, "death_rate": 7.3, "growth_rate": 0.06},
        {"year": 2019, "total": 23603121, "birth_rate": 7.5, "death_rate": 7.5, "growth_rate": 0.04},
        {"year": 2020, "total": 23561236, "birth_rate": 7.0, "death_rate": 7.3, "growth_rate": -0.21},
        {"year": 2021, "total": 23375314, "birth_rate": 6.6, "death_rate": 8.2, "growth_rate": -0.79},
        {"year": 2022, "total": 23264640, "birth_rate": 6.3, "death_rate": 8.9, "growth_rate": -0.47},
        {"year": 2023, "total": 23174217, "birth_rate": 6.1, "death_rate": 8.4, "growth_rate": -0.39},
    ]
    conn = get_connection()
    cursor = conn.cursor()
    for row in rows:
        cursor.execute("""
            INSERT OR REPLACE INTO population (year, total, birth_rate, death_rate, growth_rate)
            VALUES (?, ?, ?, ?, ?)
        """, (row["year"], row["total"], row["birth_rate"], row["death_rate"], row["growth_rate"]))
    conn.commit()
    conn.close()
    print(f"  ✅ 人口資料寫入 {len(rows)} 筆")

# ─────────────────────────────────────────
# GDP 資料（來源：主計總處、World Bank 整理）
# ─────────────────────────────────────────
def fetch_gdp():
    print("📥 載入 GDP 資料...")
    rows = [
        {"year": 2015, "gdp_usd": 523.0, "gdp_growth": 1.47, "gdp_per_capita": 22288},
        {"year": 2016, "gdp_usd": 530.5, "gdp_growth": 2.17, "gdp_per_capita": 22540},
        {"year": 2017, "gdp_usd": 579.3, "gdp_growth": 3.31, "gdp_per_capita": 24577},
        {"year": 2018, "gdp_usd": 607.7, "gdp_growth": 2.79, "gdp_per_capita": 25759},
        {"year": 2019, "gdp_usd": 611.4, "gdp_growth": 3.06, "gdp_per_capita": 25909},
        {"year": 2020, "gdp_usd": 668.5, "gdp_growth": 3.36, "gdp_per_capita": 28383},
        {"year": 2021, "gdp_usd": 775.2, "gdp_growth": 6.53, "gdp_per_capita": 33170},
        {"year": 2022, "gdp_usd": 761.4, "gdp_growth": 2.45, "gdp_per_capita": 32756},
        {"year": 2023, "gdp_usd": 746.0, "gdp_growth": 1.31, "gdp_per_capita": 32167},
    ]
    conn = get_connection()
    cursor = conn.cursor()
    for row in rows:
        cursor.execute("""
            INSERT OR REPLACE INTO gdp (year, gdp_usd, gdp_growth, gdp_per_capita)
            VALUES (?, ?, ?, ?)
        """, (row["year"], row["gdp_usd"], row["gdp_growth"], row["gdp_per_capita"]))
    conn.commit()
    conn.close()
    print(f"  ✅ GDP 資料寫入 {len(rows)} 筆")

# ─────────────────────────────────────────
# 能源資料（來源：台灣能源局統計整理）
# ─────────────────────────────────────────
def fetch_energy():
    print("📥 載入能源資料...")
    rows = [
        {"year": 2015, "total_TWh": 249.8, "renewable_TWh": 14.2, "coal_pct": 36.5, "nuclear_pct": 16.6},
        {"year": 2016, "total_TWh": 252.1, "renewable_TWh": 15.1, "coal_pct": 37.2, "nuclear_pct": 15.8},
        {"year": 2017, "total_TWh": 260.3, "renewable_TWh": 16.8, "coal_pct": 38.1, "nuclear_pct": 14.2},
        {"year": 2018, "total_TWh": 264.5, "renewable_TWh": 19.2, "coal_pct": 37.9, "nuclear_pct": 12.4},
        {"year": 2019, "total_TWh": 263.8, "renewable_TWh": 21.5, "coal_pct": 37.1, "nuclear_pct": 12.7},
        {"year": 2020, "total_TWh": 261.2, "renewable_TWh": 24.8, "coal_pct": 35.8, "nuclear_pct": 13.1},
        {"year": 2021, "total_TWh": 272.4, "renewable_TWh": 28.1, "coal_pct": 36.2, "nuclear_pct": 10.9},
        {"year": 2022, "total_TWh": 275.6, "renewable_TWh": 33.4, "coal_pct": 35.1, "nuclear_pct": 8.3},
        {"year": 2023, "total_TWh": 271.3, "renewable_TWh": 38.9, "coal_pct": 33.8, "nuclear_pct": 6.5},
    ]
    conn = get_connection()
    cursor = conn.cursor()
    for row in rows:
        renewable_pct = round(row["renewable_TWh"] / row["total_TWh"] * 100, 2)
        cursor.execute("""
            INSERT OR REPLACE INTO energy (year, total_TWh, renewable_TWh, renewable_pct, coal_pct, nuclear_pct)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (row["year"], row["total_TWh"], row["renewable_TWh"], renewable_pct, row["coal_pct"], row["nuclear_pct"]))
    conn.commit()
    conn.close()
    print(f"  ✅ 能源資料寫入 {len(rows)} 筆")

# ─────────────────────────────────────────
# 消費資料（來源：主計總處 CPI 統計整理）
# ─────────────────────────────────────────
def fetch_consumption():
    print("📥 載入消費資料...")
    rows = [
        {"year": 2015, "household_consumption": 9823.4, "cpi": 96.8, "cpi_growth": -0.3},
        {"year": 2016, "household_consumption": 10012.1, "cpi": 97.2, "cpi_growth": 1.4},
        {"year": 2017, "household_consumption": 10234.5, "cpi": 98.0, "cpi_growth": 0.6},
        {"year": 2018, "household_consumption": 10521.3, "cpi": 98.8, "cpi_growth": 1.3},
        {"year": 2019, "household_consumption": 10724.8, "cpi": 99.6, "cpi_growth": 0.6},
        {"year": 2020, "household_consumption": 10456.2, "cpi": 100.0, "cpi_growth": -0.2},
        {"year": 2021, "household_consumption": 10823.7, "cpi": 101.9, "cpi_growth": 2.0},
        {"year": 2022, "household_consumption": 11342.6, "cpi": 105.7, "cpi_growth": 2.9},
        {"year": 2023, "household_consumption": 11687.4, "cpi": 108.2, "cpi_growth": 2.5},
    ]
    conn = get_connection()
    cursor = conn.cursor()
    for row in rows:
        cursor.execute("""
            INSERT OR REPLACE INTO consumption (year, household_consumption, cpi, cpi_growth)
            VALUES (?, ?, ?, ?)
        """, (row["year"], row["household_consumption"], row["cpi"], row["cpi_growth"]))
    conn.commit()
    conn.close()
    print(f"  ✅ 消費資料寫入 {len(rows)} 筆")

# ─────────────────────────────────────────
# 執行全部 ETL
# ─────────────────────────────────────────
def run_etl():
    print("\n🚀 開始執行 ETL Pipeline...\n")
    init_db()
    fetch_population()
    fetch_gdp()
    fetch_energy()
    fetch_consumption()
    print("\n🎉 ETL Pipeline 完成！\n")

if __name__ == "__main__":
    run_etl()