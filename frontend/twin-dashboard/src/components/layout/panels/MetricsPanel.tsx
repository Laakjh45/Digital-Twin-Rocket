import React, { useState } from "react";
import Plot from "react-plotly.js";

const metrics = ["Temperature", "Pressure", "Velocity"];

export default function MetricsPanel() {
  const [activeMetric, setActiveMetric] = useState("Temperature");
  const metricColors: any = {
    Temperature: "#ef4444",
    Pressure: "#3b82f6",
    Velocity: "#22c55e",
  };

  return (
    <div style={styles.panel}>
      {/* 🔹 HEADER */}
      <div style={styles.header}>
        <select
          value={activeMetric}
          onChange={(e) => setActiveMetric(e.target.value)}
          style={styles.dropdown}
        >
          {metrics.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* 🔹 GRAPH */}
      <div style={styles.graphWrap}>
        <Plot
          data={[
            {
              x: ["Stage 1", "Stage 2", "Stage 3"],
              y: [70, 85, 60],
              type: "bar",
              marker: {
                color: "#60a5fa",
                opacity: 0.85,
              },
              hoverinfo: "y",
            },
          ]}
          layout={{
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#cbd5f5" },
            margin: { t: 10, l: 30, r: 10, b: 30 },

            xaxis: {
              showgrid: false,
              tickfont: { size: 10 },
            },

            yaxis: {
              showgrid: true,
              gridcolor: "rgba(255,255,255,0.05)",
              tickfont: { size: 10 },
            },
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* 🔹 STATS */}
      <div style={styles.stats}>
        <Stat label="Average" value="72°C" />
        <Stat label="Min" value="60°C" />
        <Stat label="Max" value="90°C" />
        <Stat label="Spread" value="30°C" />
      </div>
    </div>
  );
}

/* 🔹 STAT COMPONENT */
function Stat({ label, value }: any) {
  return (
    <div
      style={{
        ...styles.statBox,
        borderLeft: `3px solid ${
          label === "Max"
            ? "#ef4444"
            : label === "Min"
            ? "#22c55e"
            : "#60a5fa"
        }`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 0 12px rgba(96,165,250,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span style={styles.statLabel}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

const styles: any = {
  panel: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: 12,
    background: "rgba(15,20,30,0.9)",
  },

  header: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 13,
    color: "#60a5fa",
    letterSpacing: 0.3,
  },

  dropdown: {
    background: "rgba(30,41,59,0.6)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 6,
    color: "#e2e8f0",
    fontSize: 11,
    padding: "4px 6px",
    cursor: "pointer",
  },

  graphWrap: {
    height: 130,
    marginBottom: 10,
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },

  statBox: {
    background: "rgba(30,41,59,0.35)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: 8,
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease",
  },

  statLabel: {
    fontSize: 10,
    color: "#94a3b8",
  },

  statValue: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: 500,
  },
};