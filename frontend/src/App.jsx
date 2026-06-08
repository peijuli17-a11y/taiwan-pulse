import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend
);

const API = "https://taiwan-pulse.onrender.com";

function KpiCard({ title, value, unit, sub }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value} <span style={styles.kpiUnit}>{unit}</span></div>
      {sub && <div style={styles.kpiSub}>{sub}</div>}
    </div>
  );
}

function YearSelector({ years, selected, onChange }) {
  return (
    <div style={styles.yearSelector}>
      <span style={styles.yearLabel}>選擇年份：</span>
      {years.map(y => (
        <button
          key={y}
          onClick={() => onChange(y)}
          style={{ ...styles.yearBtn, ...(selected === y ? styles.yearBtnActive : {}) }}
        >
          {y}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [summary, setSummary] = useState(null);
  const [population, setPopulation] = useState([]);
  const [gdp, setGdp] = useState([]);
  const [energy, setEnergy] = useState([]);
  const [consumption, setConsumption] = useState([]);
  const [cpiMode, setCpiMode] = useState("growth");
  const [refreshMsg, setRefreshMsg] = useState("");
  const [selectedEnergyYear, setSelectedEnergyYear] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [yearRange, setYearRange] = useState([2015, 2024]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    axios.get(`${API}/api/summary`).then(r => setSummary(r.data));
    axios.get(`${API}/api/population`).then(r => setPopulation(r.data.data));
    axios.get(`${API}/api/gdp`).then(r => setGdp(r.data.data));
    axios.get(`${API}/api/energy`).then(r => {
      const d = r.data.data;
      setEnergy(d);
      if (d.length > 0) setSelectedEnergyYear(d[d.length - 1].year);
    });
    axios.get(`${API}/api/consumption`).then(r => setConsumption(r.data.data));
    setLastUpdated(new Date().toLocaleString("zh-TW"));
  };

  const handleRefresh = async () => {
    setRefreshMsg("🔄 更新中，請稍候...");
    try {
      const r = await axios.post(`${API}/api/refresh`);
      setRefreshMsg(`✅ ${r.data.message}`);
      loadData();
    } catch {
      setRefreshMsg("❌ 更新失敗，請稍後再試");
    }
    setTimeout(() => setRefreshMsg(""), 4000);
  };

  // 能源甜甜圈：依選擇年份
  const selectedEnergy = energy.find(d => d.year === selectedEnergyYear);
  const energyDonut = selectedEnergy ? {
    labels: ["再生能源", "燃煤", "核能", "其他"],
    datasets: [{
      data: [
        selectedEnergy.renewable_pct,
        selectedEnergy.coal_pct,
        selectedEnergy.nuclear_pct,
        parseFloat((100 - selectedEnergy.renewable_pct - selectedEnergy.coal_pct - selectedEnergy.nuclear_pct).toFixed(1)),
      ],
      backgroundColor: ["#4CAF50", "#FF9800", "#9C27B0", "#607D8B"],
      borderWidth: 0,
    }],
  } : null;

  const populationChart = {
    labels: population.map(d => d.year),
    datasets: [
      { label: "出生率 (‰)", data: population.map(d => d.birth_rate), borderColor: "#4CAF50", tension: 0.3, pointRadius: 4 },
      { label: "死亡率 (‰)", data: population.map(d => d.death_rate), borderColor: "#f44336", tension: 0.3, pointRadius: 4 },
    ],
  };

  const gdpChart = {
    labels: gdp.map(d => d.year),
    datasets: [
      { label: "GDP 成長率 (%)", data: gdp.map(d => d.gdp_growth), backgroundColor: gdp.map(d => d.gdp_growth >= 0 ? "#2196F3" : "#f44336"), borderRadius: 6 },
    ],
  };

  const energyLineChart = {
    labels: energy.map(d => d.year),
    datasets: [
      { label: "再生能源 (%)", data: energy.map(d => d.renewable_pct), borderColor: "#4CAF50", backgroundColor: "rgba(76,175,80,0.1)", fill: true, tension: 0.3 },
      { label: "燃煤 (%)", data: energy.map(d => d.coal_pct), borderColor: "#FF9800", backgroundColor: "rgba(255,152,0,0.1)", fill: true, tension: 0.3 },
      { label: "核能 (%)", data: energy.map(d => d.nuclear_pct), borderColor: "#9C27B0", backgroundColor: "rgba(156,39,176,0.1)", fill: true, tension: 0.3 },
    ],
  };

  const filteredConsumption = consumption.filter(
    d => d.year >= yearRange[0] && d.year <= yearRange[1]
  );

  const cpiChart = {
  labels: filteredConsumption.map(d => d.year),
  datasets: [
    {
      label: cpiMode === "growth" ? "CPI 年增率 (%)" : "CPI 指數",
      data: filteredConsumption.map(d =>
        cpiMode === "growth" ? d.cpi_growth : d.cpi
      ),
      borderColor: "#FF5722",
      backgroundColor: "rgba(255,87,34,0.15)",
      fill: true,
      tension: 0.3,
      pointRadius: 4,
    },
  ],
};
        borderColor: "#FF5722",
        backgroundColor: "rgba(255,87,34,0.15)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const gdpPerCapitaChart = {
    labels: gdp.map(d => d.year),
    datasets: [
      { label: "人均 GDP (USD)", data: gdp.map(d => d.gdp_per_capita), borderColor: "#3F51B5", backgroundColor: "rgba(63,81,181,0.1)", fill: true, tension: 0.3 },
    ],
  };

  const chartOpts = (title) => ({
    responsive: true,
    plugins: { legend: { position: "top", labels: { color: "#cbd5e1" } }, title: { display: false } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  });

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🇹🇼 Taiwan Pulse</h1>
          <p style={styles.subtitle}>台灣總體發展儀表板｜資料來源：內政部、主計總處、World Bank</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <button onClick={handleRefresh} style={styles.refreshBtn}>🔄 手動更新資料</button>
          {lastUpdated && <div style={styles.lastUpdated}>上次更新：{lastUpdated}</div>}
        </div>
      </div>
      {refreshMsg && <div style={styles.refreshMsg}>{refreshMsg}</div>}

      {/* KPI Cards */}
      {summary && (
        <div style={styles.kpiRow}>
          <KpiCard title="總人口" value={(summary.population.total / 1e6).toFixed(2)} unit="百萬人" sub={`${summary.population.year} 年`} />
          <KpiCard title="GDP" value={summary.gdp.gdp_usd} unit="十億美元" sub={`成長率 ${summary.gdp.gdp_growth}%`} />
          <KpiCard title="再生能源佔比" value={summary.energy.renewable_pct} unit="%" sub={`${summary.energy.year} 年`} />
          <KpiCard title="CPI 年增率" value={summary.consumption.cpi_growth} unit="%" sub={`${summary.consumption.year} 年`} />
        </div>
      )}

      {/* Row 1 */}
      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>👥 人口出生率 vs 死亡率</h3>
          <Line data={populationChart} options={chartOpts()} />
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>📈 GDP 年成長率</h3>
          <Bar data={gdpChart} options={chartOpts()} />
        </div>
      </div>

      {/* Row 2 - Energy */}
      <div style={styles.chartRow}>
        <div style={{ ...styles.chartBox, flex: 2 }}>
          <h3 style={styles.chartTitle}>⚡ 能源結構趨勢</h3>
          <Line data={energyLineChart} options={chartOpts()} />
        </div>
        <div style={{ ...styles.chartBox, flex: 1 }}>
          <h3 style={styles.chartTitle}>⚡ 能源佔比</h3>
          <YearSelector
            years={energy.map(d => d.year)}
            selected={selectedEnergyYear}
            onChange={setSelectedEnergyYear}
          />
          {energyDonut && (
            <>
              <Doughnut data={energyDonut} options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1" } } } }} />
              <p style={styles.donutNote}>
                再生能源 {selectedEnergy.renewable_pct}% ｜ 燃煤 {selectedEnergy.coal_pct}% ｜ 核能 {selectedEnergy.nuclear_pct}%
              </p>
            </>
          )}
        </div>
      </div>

      {/* Row 3 */}
      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>🛒 CPI 通膨率趨勢</h3>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              value={yearRange[0]}
              onChange={(e) => setYearRange([+e.target.value, yearRange[1]])}
              style={{ width: "70px", marginRight: "5px" }}
            />
            -
            <input
              type="number"
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], +e.target.value])}
              style={{ width: "70px", marginLeft: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <button onClick={() => setCpiMode("growth")}>通膨率</button>
            <button onClick={() => setCpiMode("index")}>CPI 指數</button>
          </div>
          <Line data={cpiChart} options={chartOpts()} />
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>💰 人均 GDP 趨勢</h3>
          <Line data={gdpPerCapitaChart} options={chartOpts()} />
        </div>
      </div>

      <div style={styles.footer}>
        資料來源：內政部戶政司 Open API、World Bank、台灣能源局統計 ｜ Taiwan Pulse © 2024
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0f172a", minHeight: "100vh", padding: "24px", fontFamily: "sans-serif", color: "#e2e8f0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" },
  title: { margin: 0, fontSize: "28px", fontWeight: 700 },
  subtitle: { margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" },
  refreshBtn: { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px" },
  lastUpdated: { color: "#64748b", fontSize: "11px", marginTop: "6px" },
  refreshMsg: { background: "#1e293b", color: "#4ade80", padding: "8px 16px", borderRadius: "6px", marginBottom: "12px", fontSize: "13px" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  kpiCard: { background: "#1e293b", borderRadius: "12px", padding: "20px", textAlign: "center" },
  kpiTitle: { color: "#94a3b8", fontSize: "13px", marginBottom: "8px" },
  kpiValue: { fontSize: "28px", fontWeight: 700, color: "#f1f5f9" },
  kpiUnit: { fontSize: "14px", color: "#94a3b8" },
  kpiSub: { color: "#64748b", fontSize: "12px", marginTop: "4px" },
  chartRow: { display: "flex", gap: "16px", marginBottom: "16px" },
  chartBox: { flex: 1, background: "#1e293b", borderRadius: "12px", padding: "20px" },
  chartTitle: { margin: "0 0 12px", fontSize: "15px", color: "#f1f5f9" },
  yearSelector: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px", alignItems: "center" },
  yearLabel: { color: "#94a3b8", fontSize: "12px" },
  yearBtn: { background: "#334155", color: "#94a3b8", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px" },
  yearBtnActive: { background: "#3b82f6", color: "#fff" },
  donutNote: { textAlign: "center", color: "#94a3b8", fontSize: "11px", marginTop: "8px" },
  footer: { textAlign: "center", color: "#475569", fontSize: "12px", marginTop: "24px" },
};