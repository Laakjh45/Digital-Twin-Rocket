import React, { useEffect, useState, useRef, useMemo } from "react";
import { getLatest, getHistory, getAllLatest } from "../api/backend";
import UniversalTwinScene from "../components/Scene/UniversalTwinScene";
import TopControls from "../components/layout/TopControls";
import LeftPanel from "../components/layout/LeftPanel";
import RightPanel from "../components/layout/RightPanel";
import BottomPanel from "../components/layout/BottomPanel";
import type { TwinDefinition } from "../core/TwinRegistry";

type Props = {
  twin: TwinDefinition;
};

function UniversalTwinDashboard({twin}: Props) {
  const twinId = twin.id;
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [latestData, setLatestData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [allSensorData, setAllSensorData] = useState<any>({});
  const [mode, setMode] = useState("sensor");
  const [frozenData, setFrozenData] = useState<any>({});
  const [historyBuffer, setHistoryBuffer] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  type ViewMode = "live" | "paused" | "timeline" | "playback";
  type Alert = {
    type: "alert";
    severity: string;
    sensor: string;
    message: string;
    status?: string;
    time: number;
  };

  type Notification = {
    type: "notification";
    sensor?: string;
    message: string;
    time: number;
  };

  const [viewMode, setViewMode] = useState<ViewMode>("live");
  const [isHydrated, setIsHydrated] = useState(false);
  const seconds = historyBuffer.length > 1 ? Math.floor((historyBuffer[historyBuffer.length - 1].time.getTime() - historyBuffer[0].time.getTime()) /1000) : 0;
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const sceneRef = useRef<any>(null);
  const handleZoomIn = () => {sceneRef.current?.zoomIn();};
  const handleZoomOut = () => {sceneRef.current?.zoomOut();};
  const handleResetView = () => {sceneRef.current?.resetView();};
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const handleFocus = (sensor: string) => {
    if (!sceneRef.current) return;
    if (sceneRef.current.isFocusMode) {
      sceneRef.current.exitFocus();
    } else {
      sceneRef.current.focusOnSensor(sensor);
    }
  };
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const handleSensorClick = (sensor: string) => {
    if (!sceneRef.current) return;
    setSelectedSensor(sensor);
    requestAnimationFrame(() => {
      sceneRef.current?.focusOnSensor(sensor, { fromSensorClick: true });
    });
  };

  const sensorList = useMemo(() => {
    return Object.keys(allSensorData).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [allSensorData]);

  const focusNext = () => {
    if (!selectedSensor) return;
    const i = sensorList.indexOf(selectedSensor);
    const next = sensorList[(i + 1 + sensorList.length) % sensorList.length];
    setSelectedSensor(next);
    sceneRef.current?.focusOnSensor(next, { fromSensorClick: true });
  };

  const focusPrev = () => {
    if (!selectedSensor) return;
    const i = sensorList.indexOf(selectedSensor);
    const prev = sensorList[(i - 1 + sensorList.length) % sensorList.length];
    setSelectedSensor(prev);
    sceneRef.current?.focusOnSensor(prev, { fromSensorClick: true });
  };

  const progress =
  historyIndex !== null && historyBuffer.length > 1
    ? Math.max(
        0,
        Math.min(
          100,
          ((historyBuffer[historyIndex].time.getTime() -
            historyBuffer[0].time.getTime()) /
            (historyBuffer[historyBuffer.length - 1].time.getTime() -
              historyBuffer[0].time.getTime())) *
            100
        )
      )
    : 100;

  const currentOffset = historyIndex !== null && historyBuffer.length > 0 ? Math.floor((historyBuffer[historyBuffer.length - 1].time.getTime() -
    historyBuffer[historyIndex].time.getTime()) / 1000): 0;

  useEffect(() => {
    if (viewMode !== "playback") return;
    let active = true;
    const interval = setInterval(() => {
      if (!active) return;
      setHistoryIndex((prev) => {
        if (prev === null) return historyBuffer.length - 1;
        const next = Math.min(prev + 1, historyBuffer.length - 1);
        if (next >= historyBuffer.length - 1) {
          setViewMode("timeline");
        }
        return next;
      });
    }, 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "playback") return;
    if (viewMode === "timeline" && historyIndex !== null) {
      return;
    }
    if (viewMode === "live" && historyIndex !== null) {
      setHistoryIndex(null);
    }
  }, [viewMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setViewMode((prev) => (prev === "playback" ? "timeline" : prev));
        setHistoryIndex((prev) => {
          if (prev === null) return historyBuffer.length - 1;
          return Math.max(prev - 1, 0);
        });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setViewMode((prev) => (prev === "playback" ? "timeline" : prev));
        setHistoryIndex((prev) => {
          if (prev === null) return historyBuffer.length - 1;
          return Math.min(prev + 1, historyBuffer.length - 1);
        });
      } 
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [historyBuffer.length]);

  useEffect(() => {
    const saved = localStorage.getItem(`historyBuffer_${twinId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const revived = parsed.map((item: any) => ({
          ...item,
          time: new Date(item.time),
        }));
        setHistoryBuffer(revived);
      } catch (e) {
        console.warn("Failed to load historyBuffer");
      }
    }
    setIsHydrated(true);
  }, [twinId]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(`historyBuffer_${twinId}`, JSON.stringify(historyBuffer));
  }, [historyBuffer, isHydrated, twinId]);

  const stepBack = () => {
    if (viewMode === "playback") {
      setViewMode("timeline");
    }
    setHistoryIndex((prev) => {
      if (prev === null) return historyBuffer.length - 1;
      return Math.max(prev - 1, 0);
    });
  };

  const stepForward = () => {
    if (viewMode === "playback") {
      setViewMode("timeline");
    }
    setHistoryIndex((prev) => {
      if (prev === null) return historyBuffer.length - 1;
      return Math.min(prev + 1, historyBuffer.length - 1);
    });
  };

  const jumpToLive = () => {
    setViewMode("live");
    setHistoryIndex(null);
    setFrozenData({});
  };

  const handlePauseToggle = () => {
    if (viewMode === "live") {
      const index = historyBuffer.length - 1;
      if (index >= 0) {
        setHistoryIndex(index);
        setFrozenData(historyBuffer[index]?.data);
      }
      setViewMode("paused");
    } 
    else if (viewMode === "paused") {
      setViewMode("live");
      setHistoryIndex(null);
    }
  };

  const playbackTime =
    historyIndex !== null
      ? historyBuffer[historyIndex]?.time
      : null;

  useEffect(() => {
    if (!isHydrated) return;
    const fetch = async () => {
      try {
        const data = await getAllLatest(twinId);
        setConnectionStatus("connected");
        setAllSensorData(data);
        setHistoryBuffer((prev) => {
          let base = prev;
          if (prev.length === 0) {
            const saved = localStorage.getItem(`historyBuffer_${twinId}`);
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                base = parsed.map((item: any) => ({
                  ...item,
                  time: new Date(item.time),
                }));
              } catch {
                base = [];
              }
            }
          }
          const now = new Date();
          const updated = [...base, { data, time: now }];
          const THIRTY_MIN = 30 * 60 * 1000;
          return updated.filter(
            (item) => now.getTime() - item.time.getTime() <= THIRTY_MIN
          );
        });
      } catch (err) {
        console.warn("Backend not reachable");
        setConnectionStatus("disconnected");
      }
    };
    fetch();
    const i = setInterval(fetch, 1000);
    return () => clearInterval(i);
  }, [twinId, isHydrated]);

  useEffect(() => {
    if (!selectedSensor) {
      setIsFocusMode(false);
    }
  }, [selectedSensor]);

  useEffect(() => {
    if (!selectedSensor) return;
    getHistory(twinId, selectedSensor, 5).then((res) => {
      const grouped: any = {};
      res.data.forEach((item: any) => {
        if (!grouped[item.field]) grouped[item.field] = [];
        grouped[item.field].push(item);
      });
      const traces = Object.keys(grouped).map((f) => ({
        x: grouped[f].map((d: any) => d.time),
        y: grouped[f].map((d: any) => d.value),
        type: "scatter",
        mode: "lines",
        name: f,
      }));
      setHistoryData(traces);
    });
  }, [twinId, selectedSensor]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryTimeout: any;
    let retryDelay = 1000;

    const connect = () => {
      setConnectionStatus("connecting");
      ws = new WebSocket(`ws://localhost:8000/ws/${twinId}`);

      ws.onopen = () => {
        setConnectionStatus("connected");
        retryDelay = 1000;
        getAllLatest(twinId).then((data) => {
          setAllSensorData(data);
        });
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "data") setAllSensorData(msg.payload);
        if (msg.type === "alert") setAlerts((prev) => [msg, ...prev].slice(0, 50));
        if (msg.type === "notification") setNotifications((prev) => [msg, ...prev].slice(0, 50));
      };

      ws.onerror = () => ws?.close();

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        retryTimeout = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 10000);
      };
    };

    connect();

    return () => {
      ws?.close();
      clearTimeout(retryTimeout);
    };
  }, [twinId]);

  useEffect(() => {
    if (!selectedSensor) return;
    const fetch = () =>
      getLatest(twinId, selectedSensor).then((res) => setLatestData(res.data));
    fetch();
    const i = setInterval(fetch, 2000);
    return () => clearInterval(i);
  }, [twinId, selectedSensor]);

  let displayData = allSensorData;
  if (viewMode === "paused") {
    displayData = frozenData || allSensorData;
  } else if (historyIndex !== null && historyBuffer[historyIndex]) {
    displayData = historyBuffer[historyIndex].data;
  }

  return (
    <div style={styles.container}>
      <TopControls {...{
        mode, setMode, stepBack, stepForward, playbackTime,
        jumpToLive, historyLength: historyBuffer.length,
        historyIndex, setHistoryIndex, viewMode, setViewMode,
        onPauseToggle: handlePauseToggle, seconds, currentOffset,
        connectionStatus, zoomIn: handleZoomIn, zoomOut: handleZoomOut,
        resetView: handleResetView, focus: handleFocus,
        selectedSensor, isFocusMode, isResetActive,
        focusNext, focusPrev
      }} />

      <div style={styles.main}>
        <LeftPanel allSensorData={displayData} />

        <div style={styles.center}>
          <UniversalTwinScene
            twin={twin}
            mode={mode}
            onSensorClick={handleSensorClick}
            selectedSensor={selectedSensor}
            latestData={latestData}
            allSensorData={displayData}
            ref={sceneRef}
            setIsFocusMode={setIsFocusMode}
            setIsResetActive={setIsResetActive}
          />
        </div>

        <RightPanel
          selectedSensor={selectedSensor}
          latestData={latestData}
          historyData={historyData}
        />
      </div>

      <BottomPanel />
    </div>
  );
}

export default UniversalTwinDashboard;

const styles: any = {
  container: {
    height: "100vh",
    width: "100%",
    background: "radial-gradient(circle at center, #0b1220 0%, #020617 100%)",
    color: "#e6edf3",
    fontFamily: "Inter, sans-serif",
  },
  main: {
    display: "grid",
    gridTemplateColumns: "260px 1fr 340px",
    gap: "12px",
    height: "calc(100% - 120px)",
    padding: "60px 12px 12px",
  },
  center: {
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #1f2933",
    background: "rgba(2,6,23,0.8)",
  },
};