import React from "react";
import AnimatedNumber from "../common/AnimatedNumber";

export default function LeftPanel({ allSensorData }: any) {
  const total = Object.keys(allSensorData).length;

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>System Health</h3>

      <div style={styles.health}>
        <AnimatedNumber value={92} />%
        <span>Healthy</span>
      </div>

      <div style={styles.row}>
        <span>Sensors</span>
        <strong>{total}</strong>
      </div>

      <div style={styles.row}>
        <span>Status</span>
        <strong style={{ color: "#22c55e" }}>Operational</strong>
      </div>
    </div>
  );
}

const styles: any = {
  panel: {
    background: "rgba(20,25,30,0.7)",
    border: "1px solid #1f2933",
    borderRadius: 12,
    padding: 16,
  },

  title: { color: "#60a5fa", marginBottom: 12 },

  health: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 16,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
  },
};