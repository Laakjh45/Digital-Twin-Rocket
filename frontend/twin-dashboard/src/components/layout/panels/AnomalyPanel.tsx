import React, { useState } from "react";
import Plot from "react-plotly.js";

const anomalyData = [
  { time: "T+28s", label: "Temp Spike", severity: "critical" },
  { time: "T+35s", label: "Pressure Drop", severity: "warning" },
  { time: "T+42s", label: "Minor Vibration", severity: "info" },
];

const colors: any = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#60a5fa",
};

export default function AnomalyPanel() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? anomalyData
      : anomalyData.filter((a) => a.severity === filter);

  return (
    <div style={styles.panel}>
      {/* HEADER (FILTER ONLY) */}
      <div style={styles.header}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.dropdown}
        >
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* GRAPH */}
      <div style={styles.graphWrap}>
        <Plot
          data={[
            {
              x: ["Critical", "Warning", "Info"],
              y: [
                anomalyData.filter((a) => a.severity === "critical").length,
                anomalyData.filter((a) => a.severity === "warning").length,
                anomalyData.filter((a) => a.severity === "info").length,
              ],
              type: "bar",
              marker: {
                color: [
                  colors.critical,
                  colors.warning,
                  colors.info,
                ],
                opacity: 0.9,
              },
            },
          ]}
          layout={{
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            margin: { t: 10, l: 20, r: 10, b: 30 },
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

      {/* ALERT LIST */}
      <div style={styles.list}>
        {filtered.map((a, i) => (
          <div
            key={i}
            style={{
              ...styles.item,
              borderLeft: `3px solid ${colors[a.severity]}`,
              background:
                a.severity === "critical"
                  ? "rgba(239,68,68,0.08)"
                  : "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 10px rgba(96,165,250,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={styles.time}>{a.time}</span>
            <span style={styles.label}>{a.label}</span>
          </div>
        ))}
      </div>
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
    marginBottom: 10,
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
    height: 110,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    background: "rgba(10,15,25,0.7)",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflowY: "auto",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    fontSize: 11,
    borderRadius: 6,
    transition: "all 0.2s ease",
  },

  time: {
    color: "#94a3b8",
    minWidth: 45,
  },

  label: {
    color: "#e2e8f0",
  },
};