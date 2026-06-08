| 層級 | 技術 |
|------|------|
| 資料來源 | 內政部戶政司 Open API、World Bank API、台灣能源局 |
| ETL | Python + pandas + requests |
| 資料庫 | SQLite |
| 後端 | FastAPI + APScheduler |
| 前端 | React + Chart.js |
| 部署 | Render.com（前後端分離部署） |

---

## Data Pipeline / ETL

ETL Pipeline 分為四個模組，每模組對應一個資料主題：

- **人口模組**：串接內政部戶政司 Open API，抓取歷年全台出生數、死亡數、總人口，計算出生率與死亡率
- **GDP 模組**：串接 World Bank REST API，取得台灣 GDP 總量、年成長率、人均 GDP
- **能源模組**：整合台灣能源局歷年統計，計算再生能源、燃煤、核能各類發電佔比
- **消費模組**：串接 World Bank API 取得 CPI 指數與年增率

所有資料經 pandas 清理後寫入 SQLite 資料庫，具備備援靜態資料機制，確保 API 失敗時系統仍可正常運作。

---

## 資料更新機制

| 機制 | 說明 |
|------|------|
| 自動排程 | APScheduler 每日凌晨 02:00 自動執行 ETL |
| 手動觸發 | 前端「手動更新資料」按鈕，呼叫 `POST /api/refresh` |
| 啟動更新 | 後端服務啟動時自動執行一次完整 ETL |

---

## 視覺化設計

| 圖表 | 說明 |
|------|------|
| KPI 卡片 × 4 | 總人口、GDP、再生能源佔比、CPI 年增率 |
| 折線圖 | 出生率 vs 死亡率、能源結構趨勢、CPI 趨勢、人均 GDP |
| 長條圖 | GDP 年成長率（正負值雙色顯示） |
| 甜甜圈圖 | 能源佔比（支援年份選擇器，可切換 2015–2024） |

---

## 部署資訊

- **後端 API**：https://taiwan-pulse.onrender.com
- **前端儀表板**：https://taiwan-pulse-frontend.onrender.com
- **原始碼**：https://github.com/peijuli17-a11y/taiwan-pulse