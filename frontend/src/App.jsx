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

const API = "http://127.0.0.1:8000";

function KpiCard({ title, value, unit, sub }) {
  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value} <span style={styles.kpiUnit}>{unit}</span></div>
      {sub && <div style={styles.kpiSub}>{sub}</div>}
    </div>
  );
}

export default function App() {
  const [summary, setSummary] = useState(null);
  const [population, setPopulation] = useState([]);
  const [gdp, setGdp] = useState([]);
  const [energy, setEnergy] = useState([]);
  const [consumption, setConsumption] = useState([]);
  const [refreshMsg, setRefreshMsg] = useState("");

  useEffect(() => {
    axios.get(`${API}/api/summary`).then(r => setSummary(r.data));
    axios.get(`${API}/api/population`).then(r => setPopulation(r.data.data));
    axios.get(`${API}/api/gdp`).then(r => setGdp(r.data.data));
    axios.get(`${API}/api/energy`).then(r => setEnergy(r.data.data));
    axios.get(`${API}/api/consumption`).then(r => setConsumption(r.data.data));
  }, []);

  const handleRefresh = async () => {
    setRefreshMsg("更新中...");
    const r = await axios.post(`${API}/api/refresh`);
    setRefreshMsg(r.data.message);
    setTimeout(() => setRefreshMsg(""), 3000);
  };

  const years = population.map(d => d.year);

  const populationChart = {
    labels: years,
    datasets: [
      { label: "出生率 (‰)", data: population.map(d => d.birth_rate), borderColor: "#4CAF50", tension: 0.3, yAxisID: "y" },
      { label: "死亡率 (‰)", data: population.map(d => d.death_rate), borderColor: "#f44336", tension: 0.3, yAxisID: "y" },
    ],
  };

  const gdpChart = {
    labels: gdp.map(d => d.year),
    datasets: [
      { label: "GDP 成長率 (%)", data: gdp.map(d => d.gdp_growth), backgroundColor: "#2196F3", borderRadius: 6 },
    ],
  };

  const energyLineChart = {
    labels: energy.map(d => d.year),
    datasets: [
      { label: "再生能源佔比 (%)", data: energy.map(d => d.renewable_pct), borderColor: "#4CAF50", backgroundColor: "rgba(76,175,80,0.1)", fill: true, tension: 0.3 },
      { label: "燃煤佔比 (%)", data: energy.map(d => d.coal_pct), borderColor: "#FF9800", backgroundColor: "rgba(255,152,0,0.1)", fill: true, tension: 0.3 },
      { label: "核能佔比 (%)", data: energy.map(d => d.nuclear_pct), borderColor: "#9C27B0", backgroundColor: "rgba(156,39,176,0.1)", fill: true, tension: 0.3 },
    ],
  };

  const latestEnergy = energy[energy.length - 1];
  const energyDonut = latestEnergy ? {
    labels: ["再生能源", "燃煤", "核能", "其他"],
    datasets: [{
      data: [
        latestEnergy.renewable_pct,
        latestEnergy.coal_pct,
        latestEnergy.nuclear_pct,
        parseFloat((100 - latestEnergy.renewable_pct - latestEnergy.coal_pct - latestEnergy.nuclear_pct).toFixed(1)),
      ],
      backgroundColor: ["#4CAF50", "#FF9800", "#9C27B0", "#607D8B"],
    }],
  } : null;

  const cpiChart = {
    labels: consumption.map(d => d.year),
    datasets: [
      { label: "CPI 年增率 (%)", data: consumption.map(d => d.cpi_growth), borderColor: "#FF5722", backgroundColor: "rgba(255,87,34,0.1)", fill: true, tension: 0.3 },
    ],
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🇹🇼 Taiwan Pulse</h1>
          <p style={styles.subtitle}>台灣總體發展儀表板｜2015–2023</p>
        </div>
        <button onClick={handleRefresh} style={styles.refreshBtn}>
          🔄 手動更新資料
        </button>
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

      {/* Charts Row 1 */}
      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>👥 人口出生率 vs 死亡率</h3>
          <Line data={populationChart} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>📈 GDP 年成長率</h3>
          <Bar data={gdpChart} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={styles.chartRow}>
        <div style={{ ...styles.chartBox, flex: 2 }}>
          <h3 style={styles.chartTitle}>⚡ 能源結構趨勢</h3>
          <Line data={energyLineChart} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>
        <div style={{ ...styles.chartBox, flex: 1 }}>
          <h3 style={styles.chartTitle}>⚡ 2023 能源佔比</h3>
          {energyDonut && <Doughnut data={energyDonut} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />}
        </div>
      </div>

      {/* Charts Row 3 */}
      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>🛒 CPI 通膨率趨勢</h3>
          <Line data={cpiChart} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>📊 人均 GDP 趨勢</h3>
          <Line data={{
            labels: gdp.map(d => d.year),
            datasets: [{ label: "人均 GDP (USD)", data: gdp.map(d => d.gdp_per_capita), borderColor: "#3F51B5", tension: 0.3 }]
          }} options={{ responsive: true }} />
        </div>
      </div>

      <div style={styles.footer}>資料來源：內政部統計年報、主計總處、台灣能源局 | Taiwan Pulse © 2024</div>
    </div>
  );
}

const styles = {
  page: { background: "#0f172a", minHeight: "100vh", padding: "24px", fontFamily: "sans-serif", color: "#e2e8f0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  title: { margin: 0, fontSize: "28px", fontWeight: 700 },
  subtitle: { margin: "4px 0 0", color: "#94a3b8", fontSize: "14px" },
  refreshBtn: { background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px" },
  refreshMsg: { background: "#1e293b", color: "#4ade80", padding: "8px 16px", borderRadius: "6px", marginBottom: "12px", fontSize: "13px" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  kpiCard: { background: "#1e293b", borderRadius: "12px", padding: "20px", textAlign: "center" },
  kpiTitle: { color: "#94a3b8", fontSize: "13px", marginBottom: "8px" },
  kpiValue: { fontSize: "28px", fontWeight: 700, color: "#f1f5f9" },
  kpiUnit: { fontSize: "14px", color: "#94a3b8" },
  kpiSub: { color: "#64748b", fontSize: "12px", marginTop: "4px" },
  chartRow: { display: "flex", gap: "16px", marginBottom: "16px" },
  chartBox: { flex: 1, background: "#1e293b", borderRadius: "12px", padding: "20px" },
  chartTitle: { margin: "0 0 16px", fontSize: "15px", color: "#f1f5f9" },
  footer: { textAlign: "center", color: "#475569", fontSize: "12px", marginTop: "24px" },
};