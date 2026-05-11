import React, { useState, useEffect, useRef } from "react";
import { Box, Radar, Grid3X3, ZoomIn, ZoomOut, Locate, RefreshCcw, Play, Pause, Focus, Layers, AlertTriangle, Bell, Search,
  ChevronRight, Cpu, Activity, Gauge, Settings, Eye, X, SkipBack, SkipForward, StepBack, StepForward, Radio, Square, Timer 
} from "lucide-react";
import { styles } from "./TopControls.styles";

type Props = {
  mode: string;
  setMode: (v: string) => void;
  stepBack: () => void;
  stepForward: () => void;
  playbackTime: Date | null;
  jumpToLive: () => void;
  historyLength: number;
  historyIndex: number | null;
  setHistoryIndex: (v: number) => void;
  viewMode: "live" | "paused" | "timeline" | "playback";
  setViewMode: (v: "live" | "paused" | "timeline" | "playback") => void;
  onPauseToggle: () => void;
  seconds: number;
  currentOffset: number;
  connectionStatus: "connecting" | "connected" | "disconnected";
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  focus: (sensor: string) => void;
  selectedSensor: string | null;
  isFocusMode?: boolean;
  isResetActive?: boolean;
  focusNext?: () => void;
  focusPrev?: () => void;
};

export default function TopControls({mode, setMode, stepBack, stepForward, playbackTime, jumpToLive, historyLength, historyIndex, setHistoryIndex, viewMode, setViewMode, onPauseToggle, seconds, currentOffset, connectionStatus, zoomIn, zoomOut, resetView, focus, selectedSensor, isFocusMode, isResetActive, focusNext, focusPrev, }: Props) {
  type SelectedType = {
    type: string;
    name: string;
    value: string;
    status: string;
  } | null;

  const [selected, setSelected] = useState<SelectedType>(null);
  const [dockOpen, setDockOpen] = useState(true);
  const [time, setTime] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"notif" | "alert">("notif");
  const [search, setSearch] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [cmdHover, setCmdHover] = useState(false);
  const isLive = viewMode === "live";
  const [timelineHover, setTimelineHover] = useState(false);
  const timeLabel = viewMode === "live" ? "LIVE": playbackTime? new Date(playbackTime).toLocaleTimeString(): "--";
  const [isDragging, setIsDragging] = useState(false);
  const holdRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const effectiveIndex = historyIndex !== null ? historyIndex : historyLength - 1;

  const startHold = (fn: () => void) => {
    fn();
    let timeout = setTimeout(() => {
      holdRef.current = setInterval(fn, 80);
    }, 200); // delay
    holdRef.current = timeout as any;
  };

  const stopHold = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  };
  
  type LogItem = {
    text: string;
    time: string;
    danger?: boolean;
    seen?: boolean;
  };
  const MAX_LIVE = 20;
  const MAX_LOG = 100;

  const [notifState, setNotifState] = useState({
    live: [] as LogItem[],
    log: [] as LogItem[],
  });

  const [alertState, setAlertState] = useState({
    live: [] as LogItem[],
    log: [] as LogItem[],
  });
  const [notifMode, setNotifMode] = useState<"live"|"log">("live");
  const [alertMode, setAlertMode] = useState<"live"|"log">("live"); 
    
  const pushLog = (type: "notif" | "alert", item: LogItem) => {
    const updatedItem = {
        ...item,
        seen: false
    };

    if (type === "notif") {
        setNotifState(prev => ({
        live: [updatedItem, ...prev.live].slice(0, MAX_LIVE),
        log: [updatedItem, ...prev.log].slice(0, MAX_LOG),
        }));
    }

    if (type === "alert") {
        setAlertState(prev => ({
        live: [updatedItem, ...prev.live].slice(0, MAX_LIVE),
        log: [updatedItem, ...prev.log].slice(0, MAX_LOG),
        }));
    }
  };

  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/live");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected (TopPanel)");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "alert" || msg.type === "notification") {
        const item = {
          text: msg.message,
          time: new Date(msg.time * 1000).toLocaleTimeString(),
          danger: msg.type === "alert", // alerts = red
          seen: false
        };

        if (msg.type === "notification") {
          pushLog("notif", item);
        }

        if (msg.type === "alert") {
          pushLog("alert", item);
        }
      }
    };

    ws.onclose = () => {
      console.log("WS disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const fetchLogs = () => {
      fetch("http://localhost:8000/events/history?twin_id=rocket_1")
        .then((res) => res.json())
        .then((data) => {

          const notifLogs: LogItem[] = [];
          const alertLogs: LogItem[] = [];

          data.events.forEach((e: any) => {
            const item = {
              text: e.message,
              time: new Date(e.time).toLocaleTimeString(),
              danger: e.type === "alert",
              seen: true
            };

            if (e.type === "notification") notifLogs.push(item);
            if (e.type === "alert") alertLogs.push(item);
          });

          setNotifState(prev => ({ ...prev, log: notifLogs }));
          setAlertState(prev => ({ ...prev, log: alertLogs }));
        });
    };

    fetchLogs();

    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
      }));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(()=>{
    localStorage.setItem("notifLog", JSON.stringify(notifState.log));
  },[notifState.log]);

  useEffect(() => {
    localStorage.setItem("alertLog", JSON.stringify(alertState.log));
  }, [alertState.log]);

  useEffect(() => {
    const savedAlerts = localStorage.getItem("alertLog");
    if (savedAlerts) {
        setAlertState(prev => ({
        ...prev,
        log: JSON.parse(savedAlerts)
        }));
    }
  }, []);

  // useEffect(()=>{
  //   const interval = setInterval(()=>{
  //       const newNotif = {
  //       text:"Auto system update",
  //       time:new Date().toLocaleTimeString(),
  //       seen:false
  //       };
  //       pushLog("notif", newNotif);

  //   }, 8000);

  //   return ()=>clearInterval(interval);
  // },[]);

  useEffect(()=>{
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const isInsidePanel = target.closest(".panel");
    const isIconClick = target.closest(".iconWrap");

    if (!isInsidePanel && !isIconClick) {
      setPanelOpen(false);
    }
  };

  document.addEventListener("click", handleClick);
  return ()=>document.removeEventListener("click", handleClick);
},[]);

  useEffect(()=>{
    const handler = (e:any)=>{
        if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="k"){
        e.preventDefault();
        inputRef.current?.focus();
        }
    };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  },[]);

  // useEffect(()=>{
  //   const interval = setInterval(()=>{
  //       const newAlert = {
  //       text:"Critical threshold exceeded",
  //       time:new Date().toLocaleTimeString(),
  //       danger:true,
  //       seen:false,
  //       };
  //       pushLog("alert", newAlert);
  //   }, 12000);

  //   return ()=>clearInterval(interval);
  // },[]);

  const notifUnread = notifState.live.filter(i => !i.seen).length;
  const alertUnread = alertState.live.filter(i => !i.seen).length;
  

  return (
    <>
      {/* 🔷 HEADER */}
      <div style={styles.header}>

        {/* LEFT */}
        <div style={styles.left}>
          <div style={styles.logo}>🚀</div>
          <div>
            <div style={styles.mainTitle}>DIGITAL TWIN DASHBOARD</div>
            <div style={styles.subTitle}>
              PSLV TWIN • LIVE • ORBITAL MODE
            </div>
          </div>
        </div>
        <div style={styles.mid}>
          {/* SEARCH */}
          <div style={styles.searchWrap}>
            <Search size={14} />
            <input
              ref={inputRef}
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search or run command..."
              style={styles.search}
            />
            <div style={styles.searchHint}>⌘K</div>
          </div>

          {/* CENTER */}
          <div style={styles.center}>
            <div style={styles.liveGroup}>
              <div style={styles.statusSlot}>
                <LiveStatus viewMode={viewMode}/>
              </div>
              <div style={styles.modePill}>
               {mode?.toUpperCase() || "SENSOR"}
              </div>
            </div>
            <div style={styles.metricGroup}>
              <Metric label="FPS" value="60" />
              <Metric label="LAT" value="120ms" />
              <Metric label="HEALTH" value="92%" good />
              <Metric label="DATA" value="1.2MB/s" />
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div style={styles.right}>

          {/* COMMAND */}
          <div
            style={{
                ...styles.commandBtn,
                ...(cmdHover ? styles.commandBtnHover : {}),
                ...(dockOpen ? styles.commandActive : {})
            }}
            onMouseEnter={()=>setCmdHover(true)}
            onMouseLeave={()=>setCmdHover(false)}
            onClick={()=>setDockOpen(!dockOpen)}
          >
            COMMAND <ChevronRight size={14}/>
          </div>

          {/* CONNECTION */}
          <div style={{
            ...styles.connection,
            color:
              connectionStatus === "connected"
                ? "#22c55e"
                : connectionStatus === "connecting"
                ? "#eab308"
                : "#ef4444"
          }}>
            ● {connectionStatus.toUpperCase()}
          </div>

          {/* TIME */}
          <div style={styles.time}>
            <div>
              {time} <span style={{ opacity: 0.5 }}>IST</span>
            </div>
            <div style={{ color: "#f59e0b", fontSize: "12px" }}>
              {timeLabel}
            </div>
          </div>

          {/* NOTIF */}
          <Icon
            label="Messages"
            active={panelOpen && panelTab==="notif"}
            color="#3b82f6"
            onClick={()=>{
                setPanelOpen(prev => {
                    if (prev && panelTab === "notif") {
                    return false;
                    }
                    setPanelTab("notif");
                    return true;
                });
            }}
          >
            <Bell size={16}/>
            {notifUnread > 0 && (
                <span style={styles.badge}>{notifUnread}</span>
            )}
          </Icon>

          {/* ALERT */}
          <Icon
            label="Alerts"
            active={panelOpen && panelTab==="alert"}
            color="#ef4444"
            onClick={()=>{
                setPanelOpen(prev => {
                    if (prev && panelTab === "alert") {
                    return false;
                    }
                    setPanelTab("alert");
                    return true;
                });
            }}
          >
            <AlertTriangle size={16}/>
            {alertUnread > 0 && (
                <span style={styles.badgeRed}>{alertUnread}</span>
            )}
          </Icon>
        </div>
      </div>

      {/* CONTEXT BAR */}
      {selected && (
        <div style={styles.contextBar}>
          <div style={styles.contextLeft}>
            <span style={styles.contextType}>{selected.type}</span>
            <span style={styles.contextName}>{selected.name}</span>
          </div>

          <div style={styles.contextCenter}>
            <ContextStat label="VALUE" value={selected.value} />
            <ContextStat
              label="STATUS"
              value={selected.status}
              danger={selected.status === "HIGH"}
            />
          </div>

          <button style={styles.clearBtn} onClick={()=>setSelected(null)}>
            Clear
          </button>
        </div>
      )}

      {/* PANELS */}
      {panelOpen && (
        <NotificationPanel
            type={panelTab}
            onClose={()=>{
                setPanelOpen(false);
            }}
            data={panelTab === "notif" ? notifState : alertState}
            mode={panelTab === "notif" ? notifMode : alertMode}
            setMode={panelTab === "notif" ? setNotifMode : setAlertMode}
            onClear={()=>{
                if(panelTab==="notif"){
                    setNotifState(prev=>({
                        ...prev,
                        live: []
                    }));
                }

                if(panelTab==="alert"){
                    setAlertState(prev=>({
                        ...prev,
                        live: []
                    }));
                }
            }}

            onItemClick={(index:number)=>{
                if(panelTab==="notif"){
                    setNotifState(prev=>({
                        ...prev,
                        live: prev.live.map((item,i)=>
                            i===index ? {...item, seen:true} : item
                        ),
                        log: prev.log.map((item,i)=>
                            i===index ? {...item, seen:true} : item
                        ),
                    }));
                }

                if(panelTab==="alert"){
                    setAlertState(prev=>({
                        ...prev,
                        live: prev.live.map((item,i)=>
                            i===index ? {...item, seen:true} : item
                        ),
                        log: prev.log.map((item,i)=>
                            i===index ? {...item, seen:true} : item
                        ),
                    }));
                }
            }}

            onMarkAllRead={()=>{
                if(panelTab==="notif"){
                    setNotifState(prev=>({
                        ...prev,
                        live: prev.live.map(i=>({...i, seen:true})),
                        log: prev.log.map(i=>({...i, seen:true}))
                    }));
                }

                if(panelTab==="alert"){
                    setAlertState(prev=>({
                        ...prev,
                        live: prev.live.map(i=>({...i, seen:true})),
                        log: prev.log.map(i=>({...i, seen:true}))
                    }));
                }
            }}
        />
      )}

      {/* DOCK */}
      <div style={styles.dockWrapper}>
        <div style={{
          ...styles.dock,
          ...(dockOpen ? styles.open : styles.closed)
        }}>
          <Group>
            <IconBtn 
              icon={<Box size={16}/>} 
              label="Material" 
              active={mode==="material"} 
              onClick={()=>setMode("material")}
            />
            <IconBtn 
              icon={<Radar size={16}/>} 
              label="Sensor" 
              active={mode==="sensor"} 
              onClick={()=>setMode("sensor")}
            />
            <IconBtn 
              icon={<Grid3X3 size={16}/>} 
              label="Wireframe" 
              active={mode==="wireframe"} 
              onClick={()=>setMode("wireframe")}
            />
            <IconBtn
              icon={<Activity size={16}/>}
              label="Heatmap"
              active={mode === "heatmap"}
              onClick={() => setMode("heatmap")}
            />
          </Group>

          <Divider/>

          <Group>
            <IconBtn icon={<ZoomIn size={16}/>} label="Zoom In" onClick={zoomIn}/>
            <IconBtn icon={<ZoomOut size={16}/>} label="Zoom Out" onClick={zoomOut}/>
            <IconBtn icon={<Locate size={16}/>} label="Reset" active={isResetActive} onClick={resetView}/>
            <IconBtn icon={<Focus size={16}/>} label="Focus" active={isFocusMode} onClick={() => {if (selectedSensor) {focus(selectedSensor);}}}/>
            {isFocusMode && selectedSensor && (
              <>
                <IconBtn
                  icon={<ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />}
                  label="Previous Sensor"
                  onClick={() => focusPrev?.()}
                />
                <IconBtn
                  icon={<ChevronRight size={16} />}
                  label="Next Sensor"
                  onClick={() => focusNext?.()}
                />
              </>
            )}
            <IconBtn icon={<Eye size={16}/>} label="Visibility"/>
          </Group>

          <Divider/>

          <Group>
            <IconBtn
              icon={<RefreshCcw size={16}/>} label="Reset Timeline" style={viewMode === "live" ? { opacity: 0.3, pointerEvents: "none" } : {}}
              onClick={() => {
                if (viewMode === "live") return;
                setViewMode("timeline");
                setHistoryIndex(historyLength - 1);
              }}
            />
            <IconBtn
              icon={
                viewMode === "live"
                  ? <Pause size={16}/>       // pause live
                  : viewMode === "paused"
                  ? <Play size={16}/>        // resume live
                  : viewMode === "timeline"
                  ? <Timer size={16}/>       // timeline
                  : <Square size={16}/>      // playback stop
              }
              label={
                viewMode === "live"
                  ? "Pause"
                  : viewMode === "paused"
                  ? "Resume"
                  : "Pause"
              }
              onClick={() => {
                if (viewMode === "live") {
                  onPauseToggle(); // live → paused
                } 
                else if (viewMode === "paused") {
                  onPauseToggle(); // paused → live
                }
                else if (viewMode === "timeline") {
                  setViewMode("paused");
                }
                else if (viewMode === "playback") {
                  setViewMode("paused");
                }
              }}
              active={viewMode === "paused"}
              style={
                viewMode !== "live"
                  ? {
                      background: "#1f2937",
                      border: "1px solid #6b7280"
                    }
                  : {}
              }
            />
            <IconBtn icon={<StepBack size={16}/>} label="Step Back" 
              onMouseDown={() => startHold(stepBack)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(stepBack)}
              onTouchEnd={stopHold}
              active={viewMode !== "live"} 
              style={viewMode === "live" ? { opacity: 0.3, pointerEvents: "none" } : {}}/>
            <IconBtn
              icon={viewMode === "playback" ? <Pause size={16}/> : <SkipForward size={16}/>}
              label={viewMode === "playback" ? "Pause Playback" : "Play Playback"}
              onClick={() => {
                if (viewMode === "live") return;
                if (viewMode !== "playback") {
                  if (historyIndex === null) {
                    setHistoryIndex(historyLength - 1);
                  }
                  setViewMode("playback");
                } else {
                  setViewMode("timeline");
                }
              }}
              active={viewMode === "playback"}
              style={{
                ...(viewMode === "playback" ? { borderColor: "#f59e0b" } : {}),
                ...(viewMode === "live" ? { opacity: 0.3, pointerEvents: "none" } : {})
              }}
            />
            <IconBtn icon={<StepForward size={16}/>} label="Step Forward" 
              onMouseDown={() => startHold(stepForward)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(stepForward)}
              onTouchEnd={stopHold}
              active={viewMode !== "live"} 
              style={viewMode === "live" ? { opacity: 0.3, pointerEvents: "none" } : {}}/>
            <IconBtn icon={<Radio size={16}/>} label="Go Live" onClick={jumpToLive} 
              style={ isLive
                  ? {background: "#7c2d12",
                      border: "1px solid #f97316",
                      boxShadow: "0 0 10px rgba(249,115,22,0.6)"}
                  : { border: "1px solid #444"}
              }
            />
            <IconBtn icon={<Settings size={16}/>} label="Settings"/>
          </Group>
            {viewMode !== "live" && historyLength > 0 && (
              <div style={styles.timelineWrapper}
                onMouseEnter={() => setTimelineHover(true)}
                onMouseLeave={() => setTimelineHover(false)}
              >
                <div style={styles.timelineHeader}>
                  TIMELINE (LAST 30 MINUTES)
                </div>
                <div style={styles.timelineRow}>
                  {/* LEFT: total */}
                  <span style={styles.timeText}>
                    -{seconds}s
                  </span>

                  {/* TRACK */}
                  <div style={styles.timelineTrack}>
                    <div style={styles.track} />
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${
                          historyLength > 1
                            ? (effectiveIndex / (historyLength - 1)) * 100
                            : 100
                        }%`,
                      }}
                    />
                    {timelineHover && (
                      <div
                        style={{
                          ...styles.dot2,
                          left: `${
                            historyLength > 1
                              ? (effectiveIndex / (historyLength - 1)) * 100
                              : 100
                          }%`,
                          transform: isDragging
                            ? "translate(-50%, -50%) scale(1.4)"
                            : "translate(-50%, -50%) scale(1)",
                        }}
                      />
                    )}
                    <input
                      type="range"
                      min={0}
                      max={Math.max(historyLength - 1, 0)}
                      value={
                        historyIndex !== null
                          ? historyIndex
                          : Math.max(historyLength - 1, 0)
                      }
                      onInput={(e) => {
                        const val = Number((e.target as HTMLInputElement).value);
                        setHistoryIndex(val);
                        setViewMode("timeline");
                      }}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchEnd={() => setIsDragging(false)}
                      style={styles.range}
                    />
                    <div style={styles.tickLeft}/>
                    <div style={styles.tickRight}/>
                    {/* CURRENT POSITION */}
                    {timelineHover && historyLength > 0 && (
                      <div
                        style={{
                          ...styles.currentLabel,
                          left: `${
                            historyLength > 1
                              ? (effectiveIndex / (historyLength - 1)) * 100
                              : 100
                          }%`,
                        }}
                      >
                        -{currentOffset}s
                      </div>
                    )}
                  </div>

                  {/* RIGHT: LIVE */}
                  <span style={styles.timeText}>NOW</span>
                </div>
              </div>
            )}
          <Divider/>

          <Group>
            <IconBtn icon={<Cpu size={16}/>} label="CPU"/>
            <IconBtn icon={<Activity size={16}/>} label="Activity"/>
            <IconBtn icon={<Gauge size={16}/>} label="Performance"/>
            <IconBtn icon={<Layers size={16}/>} label="Layers"/>
          </Group>
        </div>
        
      </div>
    </>
  );
}

/* COMPONENTS */

function Icon({children, onClick, label, active, color}: any){
  const [hover, setHover] = useState(false);

  return (
    <div
      style={styles.iconWrap}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      onClick={(e)=>{
        e.stopPropagation();
        onClick();
      }}
    >
      <div style={{
        ...styles.icon,
        ...(hover ? styles.iconHover : {}),
        ...(active && {
            boxShadow:`0 0 12px ${color}`,
            border:`1px solid ${color}`,
            background:`${color}22`
          })
        }}>
        {children}
      </div>

      {hover && (
        <div style={styles.iconTooltip}>
          {label}
        </div>
      )}
    </div>
  )
}

function Item({text, danger, time}: any){
  return (
    <div style={{
      ...styles.card,
      ...(danger ? styles.cardDanger : styles.cardInfo)
    }}>

      {/* ICON */}
      <div style={styles.cardIcon}>
        {danger ? <AlertTriangle size={14}/> : <Bell size={14}/>}
      </div>

      {/* CONTENT */}
      <div style={styles.cardContent}>
        <div style={styles.cardTitle}>{text}</div>

        <div style={styles.cardMeta}>
          <span>{danger ? "CRITICAL" : "INFO"}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>

      {/* RIGHT ACTION */}
      <div style={styles.cardAction}>
        <X size={12}/>
      </div>
    </div>
  )
}

function Group({children}: any){ return <div style={styles.group}>{children}</div> }
function Divider(){ return <div style={styles.divider}/> }

function IconBtn({icon, label, active, onClick, style, onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd}: any){
  const [h,setH]=useState(false)
  return (
    <div style={styles.btnWrap}
      onMouseEnter={()=>setH(true)}
      onMouseLeave={()=>setH(false)}
    >
      <div style={{
        ...styles.btn,
        ...style,
        ...(active?styles.active:{}),
        ...(h?styles.hover:{}),
        ...(active && h ? styles.activeHover : {})
        }} 
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          onMouseUp?.(e);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          onMouseLeave?.(e);
        }}
        onTouchStart={(e) => {
          onTouchStart?.(e);
        }}
        onTouchEnd={(e) => {
          onTouchEnd?.(e);
        }}
        onClick={onClick}
      >
        {icon}
      </div>
      {h && (
        <div style={{
            ...styles.tooltip,
            transition:"0.15s",
            opacity: h ? 1 : 0
        }}>
            {label}
        </div>
      )}
    </div>
  )
}

function Metric({label,value,good}: any){
  return <div style={styles.metric}>
    <span style={styles.metricLabel}>{label}</span>
    <span style={{color: good?"#22c55e":""}}>{value}</span>
  </div>
}

function LiveStatus({ viewMode }: any) {
  let label = "LIVE";
  let color = "#22c55e";

  if (viewMode === "paused") {
    label = "PAUSED";
    color = "#ef4444";
  } else if (viewMode === "timeline") {
    label = "TIMELINE";
    color = "#eab308";
  } else if (viewMode === "playback") {
    label = "PLAYBACK";
    color = "#f59e0b";
  }

  return (
    <div style={styles.liveWrap}>
      <div style={{
        ...styles.liveDot,
        background: color
      }} />
      <span style={styles.liveText}>{label}</span>
    </div>
  );
}

function ContextStat({ label, value, danger }: any) {
  return (
    <div style={styles.contextStat}>
      <span style={styles.contextLabel}>{label}</span>
      <span style={{
        color: danger ? "#ef4444" : "#22c55e",
        fontWeight: 500
      }}>
        {value}
      </span>
    </div>
  );
}

function NotificationPanel({ type, onClose, data, mode, setMode, onClear, onItemClick, onMarkAllRead,}: any) {
  const isNotif = type === "notif";
  const [hoverBtn, setHoverBtn] = useState<string | null>(null);
  const [closeHover, setCloseHover] = useState(false);
  const list = mode === "live" ? data.live : data.log;
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  useEffect(()=>{
    listRef.current?.scrollTo({ top: 0 });
  }, [type, mode]);

  return (
    <div
        style={{
            ...styles.panelNew,
            borderTop: `2px solid ${isNotif ? "#3b82f6" : "#ef4444"}`
        }}
        className="panel"
        onMouseDown={(e)=>e.stopPropagation()}
    >
      {/* HEADER */}
      <div style={styles.panelTop}>
        <div>
          <div style={styles.panelTitle}>
            {isNotif ? "Notifications" : "Alerts"}
          </div>
          <div style={styles.panelSub}>
            {mode === "live" ? "Recent activity" : "History logs"}
          </div>
        </div>

        <div style={styles.panelActions}>
          <button
            onMouseEnter={()=>setHoverBtn("live")}
            onMouseLeave={()=>setHoverBtn(null)}
            style={{
                ...styles.switchBtnNew,
                ...(hoverBtn==="live" && styles.switchBtnHover),
                ...(mode==="live" && styles.switchActiveNew)
            }}
            onClick={()=>setMode("live")}
          >
            Live
          </button>

          <button
            onMouseEnter={()=>setHoverBtn("log")}
            onMouseLeave={()=>setHoverBtn(null)}
            style={{
                ...styles.switchBtnNew,
                ...(hoverBtn==="log" && styles.switchBtnHover),
                ...(mode==="log" && styles.switchActiveNew)
            }}
            onClick={()=>setMode("log")}
          >
            Logs
          </button>

          <div
            onMouseEnter={()=>setCloseHover(true)}
            onMouseLeave={()=>setCloseHover(false)}
            onClick={onClose}
            style={{
                ...styles.closeBtn,
                ...(closeHover && styles.closeBtnHover)
            }}
            >
            <X size={16}/>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div ref={listRef} style={styles.panelList}>

        {list.length === 0 && (
          <div style={styles.emptyState}>
            Nothing here yet
          </div>
        )}

        {list.map((item:any, i:number)=>(
          <div key={i} 
          onMouseEnter={()=>setHovered(i)}
          onMouseLeave={()=>setHovered(null)}
          onClick={()=>onItemClick(i)}
          style={{
            ...styles.itemNew,
            ...(hovered===i && styles.itemHover),
            ...(!item.seen && (item.danger ? styles.itemUnreadAlert : styles.itemUnread))}}>
            <div style={{
              ...styles.dot,
              background: item.danger ? "#ef4444" : "#3b82f6"
            }}/>

            <div style={{flex:1}}>
              <div style={styles.itemText}>{item.text}</div>
              <div style={styles.itemTime}>{item.time}</div>
            </div>
          </div>
        ))}

        {mode === "log" && list.length >= 100 && (
          <div style={styles.viewMore}>
            View older logs →
          </div>
        )}
      </div>

      {/* FOOTER */}
      {mode === "live" && (
        <div style={styles.panelFooterNew}>
          <button style={styles.clearBtnNew} onClick={onClear}>
            Clear all
          </button>
          <button
            style={{
                ...styles.clearBtnNew,
                background:"rgba(59,130,246,0.15)",
                color:"#3b82f6"
            }}
            onClick={onMarkAllRead}
          >
            Mark all read
          </button>
        </div>
      )}
    </div>
  );
}