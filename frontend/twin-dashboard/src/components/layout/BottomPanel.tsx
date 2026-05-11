"use client";

import { PanelGroup, Panel, PanelResizeHandle, } from "react-resizable-panels";
import { useState } from "react";
import SensorPanel from "./panels/SensorPanel";
import MetricsPanel from "./panels/MetricsPanel";
import TimelinePanel from "./panels/TimelinePanel";
import AnomalyPanel from "./panels/AnomalyPanel";
import InsightsPanel from "./panels/InsightsPanel";

export default function BottomPanel(props: any) {
  const [collapsed, setCollapsed] = useState<any>({
    metrics: false,
    timeline: false,
    anomaly: false,
    insights: false,
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <PanelGroup direction="horizontal">

          {/* MAIN PANEL */}
          <Panel defaultSize={45} minSize={30}>
            <SensorPanel {...props} />
          </Panel>
          <Resize />

          {/* METRICS */}
          {collapsed.metrics ? (
            <Rail
              label="📊"
              onClick={() => toggle("metrics")}
            />
          ) : (
            <Panel defaultSize={18} minSize={10}>
              <Closable title="Metrics" onClose={() => toggle("metrics")}>
                <MetricsPanel />
              </Closable>
            </Panel>
          )}

          <Resize />

          {/* TIMELINE */}
          {collapsed.timeline ? (
            <Rail label="⏱" onClick={() => toggle("timeline")} />
          ) : (
            <Panel defaultSize={18} minSize={10}>
              <Closable title="Timeline" onClose={() => toggle("timeline")}>
                <TimelinePanel />
              </Closable>
            </Panel>
          )}

          <Resize />

          {/* ANOMALY */}
          {collapsed.anomaly ? (
            <Rail label="⚠" onClick={() => toggle("anomaly")} />
          ) : (
            <Panel defaultSize={18} minSize={10}>
              <Closable title="Anomalies" onClose={() => toggle("anomaly")}>
                <AnomalyPanel />
              </Closable>
            </Panel>
          )}

          <Resize />

          {/* INSIGHTS */}
          {collapsed.insights ? (
            <Rail label="🧠" onClick={() => toggle("insights")} />
          ) : (
            <Panel defaultSize={14} minSize={8}>
              <Closable title="Insights" onClose={() => toggle("insights")}>
                <InsightsPanel />
              </Closable>
            </Panel>
          )}

        </PanelGroup>
      </div>
    </div>
  );

  function toggle(key: string) {
    setCollapsed((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }
}

/* CLOSE WRAPPER */
function Closable({ title, children, onClose }: any) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <span>{title}</span>
        <button onClick={onClose} style={styles.closeBtn}>×</button>
      </div>
      <div style={styles.panelBody}>{children}</div>
    </div>
  );
}

/* COLLAPSED RAIL */
function Rail({ label, onClick }: any) {
  return (
    <div onClick={onClick} style={styles.rail}>
      <span style={styles.railInner}>{label}</span>
    </div>
  );
}

function Resize() {
  const [hover, setHover] = useState(false);
  return (
    <PanelResizeHandle
      style={{
        width: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "col-resize",
        background: "transparent",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          width: 2,
          height: "60%",
          borderRadius: 2,
          background: hover
            ? "linear-gradient(to bottom, #60a5fa, #3b82f6)"
            : "rgba(255,255,255,0.08)",
          boxShadow: hover
            ? "0 0 8px rgba(96,165,250,0.6)"
            : "none",
          transition: "all 0.2s ease",
        }}
      />
    </PanelResizeHandle>
  );
}

/* STYLES */
const styles: any = {
  wrapper: {
    padding: "0 12px 12px",
  },

  container: {
    height: 320,
    borderRadius: 10,
    overflow: "hidden",
    background: "linear-gradient(180deg, rgba(10,15,25,0.9), rgba(10,15,25,0.7))",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },

  panel: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "rgba(15,20,30,0.9)",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    transition: "all 0.25s ease",
  },

  panelHeader: {
    padding: "6px 10px",
    fontSize: 12,
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "#60a5fa",
    letterSpacing: 0.3,
  },

  panelBody: {
    flex: 1,
    overflow: "hidden",
  },

  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    transition: "0.2s",
  },

  rail: {
    width: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(15,20,30,0.95)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  railInner: {
    writingMode: "vertical-rl",
    fontSize: 12,
    color: "#60a5fa",
    opacity: 0.8,
  },

  resize: {
    width: 4,
    background: "transparent",
    cursor: "col-resize",
    position: "relative",
  },
};