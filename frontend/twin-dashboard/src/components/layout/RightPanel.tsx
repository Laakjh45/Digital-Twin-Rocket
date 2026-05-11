import React from "react";
import Plot from "react-plotly.js";

export default function RightPanel({
  selectedSensor,
  latestData,
  historyData,
}: any) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>
        {selectedSensor ? "Sensor Insight" : "Overview"}
      </h3>

      {!selectedSensor ? (
        <div>System running normally</div>
      ) : (
        <>
          {latestData.map((d: any, i: number) => (
            <div key={i} style={styles.row}>
              <span>{d.field}</span>
              <strong>{d.value.toFixed(2)}</strong>
            </div>
          ))}

          <Plot
            data={historyData}
            layout={{
              paper_bgcolor: "#020617",
              plot_bgcolor: "#020617",
              font: { color: "#fff" },
            }}
            style={{ height: 250 }}
          />
        </>
      )}
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

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
  },
};