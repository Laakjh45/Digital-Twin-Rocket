import React, { useState } from "react";
import Plot from "react-plotly.js";

type Props = {
  selectedSensor: string | null;
  latestData: any[];
  historyData: any;
};

const timeRanges = ["1H", "6H", "12H", "24H"];

export default function SensorPanel({
  selectedSensor,
  latestData,
  historyData,
}: Props) {
  const [range, setRange] = useState("1H");

  return (
    <div style={styles.panel}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>
          {selectedSensor ? `${selectedSensor}` : "Sensor Analytics"}
        </div>

        <div style={styles.tabs}>
          {timeRanges.map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              style={{
                ...styles.tab,
                ...(range === t ? styles.activeTab : {}),
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {!selectedSensor ? (
        <div style={styles.empty}>Select a sensor to view analytics</div>
      ) : (
        <>
          {/* LIVE METRICS STRIP */}
          <div style={styles.metricsRow}>
            {latestData?.map((d: any, i: number) => (
              <div
                key={i}
                style={styles.metricCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(96,165,250,0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 0 10px rgba(96,165,250,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={styles.metricLabel}>{d.field}</span>
                <strong style={styles.metricValue}>
                  {d.value.toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          {/* GRAPH */}
          <div style={styles.graphContainer}>
            <Plot
              data={historyData || []}
              layout={{
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                font: { color: "#e2e8f0" },
                margin: { t: 10, l: 40, r: 20, b: 40 },
                xaxis: {
                  gridcolor: "#1f2933",
                  zeroline: false,
                },
                yaxis: {
                  gridcolor: "#1f2933",
                  zeroline: false,
                },
              }}
              config={{
                displayModeBar: false,
                responsive: true,
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: 500,
    letterSpacing: 0.3,
  },

  tabs: {
    display: "flex",
    gap: 6,
  },

  tab: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.05)",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  activeTab: {
    background: "rgba(96,165,250,0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(96,165,250,0.3)",
  },

  metricsRow: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },

  metricCard: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "rgba(30,41,59,0.4)",
    border: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    minWidth: 75,
    transition: "all 0.2s ease",
  },

  metricLabel: {
    fontSize: 10,
    color: "#94a3b8",
  },

  metricValue: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: 500,
  },

  graphContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(10,15,25,0.9), rgba(10,15,25,0.7))",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
    padding: 6,
  },

  empty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: 13,
  },
};