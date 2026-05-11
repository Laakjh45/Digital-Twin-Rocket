import React from "react";
import Plot from "react-plotly.js";

const events = [
  { t: 0, time: "T+0s", label: "Ignition", type: "info" },
  { t: 12, time: "T+12s", label: "Stage Separation", type: "normal" },
  { t: 28, time: "T+28s", label: "Temp Spike", type: "warning" },
  { t: 35, time: "T+35s", label: "Pressure Drop", type: "warning" },
];

const colors: any = {
  info: "#60a5fa",
  normal: "#94a3b8",
  warning: "#f59e0b",
};

export default function TimelinePanel() {
  return (
    <div style={styles.panel}>
      {/* GRAPH */}
      <div style={styles.graphWrap}>
        <Plot
          data={[
            {
              x: [0, 10, 20, 30, 40],
              y: [1, 2, 1.5, 3, 2.5],
              type: "scatter",
              mode: "lines",
              line: { color: "#60a5fa", width: 2 },
            },

            // Event markers
            {
              x: events.map((e) => e.t),
              y: events.map(() => 1.5),
              mode: "markers",
              type: "scatter",
              marker: {
                size: 8,
                color: events.map((e) => colors[e.type]),
              },
              hoverinfo: "none",
            },
          ]}
          layout={{
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            margin: { t: 10, l: 20, r: 10, b: 25 },

            xaxis: {
              title: "",
              gridcolor: "rgba(255,255,255,0.05)",
              tickfont: { size: 10 },
            },

            yaxis: {
              visible: false,
            },
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* EVENT LIST */}
      <div style={styles.list}>
        {events.map((e, i) => (
          <div
            key={i}
            style={{
              ...styles.item,
              borderLeft: `3px solid ${colors[e.type]}`,
            }}
            onMouseEnter={(el) => {
              el.currentTarget.style.background =
                "rgba(96,165,250,0.08)";
            }}
            onMouseLeave={(el) => {
              el.currentTarget.style.background = "transparent";
            }}
          >
            <span style={styles.time}>{e.time}</span>
            <span style={styles.label}>{e.label}</span>
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

  graphWrap: {
    height: 120,
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
    transition: "all 0.2s ease",
    borderRadius: 6,
  },

  time: {
    color: "#94a3b8",
    minWidth: 45,
  },

  label: {
    color: "#e2e8f0",
  },
};