import React from "react";

const insights = [
  {
    type: "risk",
    title: "Pressure Instability Risk",
    desc: "Fluctuations detected near operational threshold",
  },
  {
    type: "trend",
    title: "Thermal Drift Increasing",
    desc: "Temperature rising steadily over last cycle",
  },
  {
    type: "efficiency",
    title: "Fuel Efficiency Stable",
    desc: "No abnormal consumption patterns detected",
  },
];

const stylesMap: any = {
  risk: {
    border: "#ef4444",
    glow: "rgba(239,68,68,0.2)",
  },
  trend: {
    border: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
  },
  efficiency: {
    border: "#22c55e",
    glow: "rgba(34,197,94,0.2)",
  },
};

export default function InsightsPanel() {
  return (
    <div style={styles.panel}>
      <div style={styles.list}>
        {insights.map((item, i) => (
          <InsightCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

/* CARD */
function InsightCard({ type, title, desc }: any) {
  const theme = stylesMap[type];

  return (
    <div
      style={{
        ...styles.card,
        borderLeft: `3px solid ${theme.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 12px ${theme.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={styles.title}>{title}</div>
      <div style={styles.desc}>{desc}</div>
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

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },

  card: {
    background: "rgba(30,41,59,0.35)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 10,
    transition: "all 0.2s ease",
  },

  title: {
    fontSize: 12,
    color: "#e2e8f0",
    fontWeight: 500,
    marginBottom: 4,
  },

  desc: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 1.4,
  },
};