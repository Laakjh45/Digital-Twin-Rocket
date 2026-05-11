import type { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
    header: {
        position: "absolute", top: 0, width: "100%", height: 70,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px",
        background: "linear-gradient(to right, #050a0f, #0b1220)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        zIndex: 50,
        gap: 20,
    },

    left: { display: "flex", gap: 10, alignItems: "center" },
    logo: { fontSize: 18 },

    mainTitle: { fontSize: 14, fontWeight: 700, letterSpacing: 1 },
    subTitle: { fontSize: 10, opacity: 0.6, letterSpacing: 1 },

    searchWrap: {
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(255,255,255,0.04)",
        padding: "6px 12px",
        borderRadius: 10,
        width: 230,
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)"
    },

    search: { background: "transparent", border: "none", outline: "none", color: "#fff", width: "100%" },
    searchHint: { fontSize: 10, opacity: 0.4 },

    center: { display: "flex", gap: 24, alignItems: "center" },

    statusSlot: {
        width: 90,
        display: "flex",
        justifyContent: "center"
    },

    metric: { fontSize: 12, display: "flex", gap: 4 },
    metricLabel: { opacity: 0.5 },

    liveWrap: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.05)"
    },

    liveDot: {
        width: 8, height: 8, borderRadius: "50%",
        animation: "pulse 3s infinite"
    },

    liveText: { fontSize: 11, fontWeight: 600 },

    right: { display: "flex", gap: 12, alignItems: "center" },

    commandBtn: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
        transition: "0.2s",
        userSelect: "none",
    },

    commandBtnHover: {
        transform: "translateY(-1px)",
        background: "rgba(59,130,246,0.15)",
        border: "1px solid rgba(59,130,246,0.4)",
        boxShadow: "0 0 12px rgba(59,130,246,0.4)"
    },

    connection: {
        fontSize: 10,
        color: "#22c55e",
        letterSpacing: 1
    },

    time: { fontSize: 12, opacity: 0.7 },

    icon: {
        position: "relative",
        padding: 8,
        background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        borderRadius: 10,
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(6px)",
        transition: "0.2s"
    },

    iconHover: {
        boxShadow: "0 0 15px rgba(59,130,246,0.5)",
        transform: "translateY(-1px)",
        background: "rgba(59,130,246,0.15)",
    },

    //   alertBadge:{
    //     position:"absolute",
    //     top:-5,
    //     right:-5,
    //     background:"#ef4444",
    //     fontSize:9,
    //     padding:"2px 5px",
    //     borderRadius:10
    //   },

    //   blueDot:{
    //     position:"absolute",
    //     top:-3,
    //     right:-3,
    //     width:8,height:8,
    //     background:"#3b82f6",
    //     borderRadius:"50%"
    //   },

    //   panel:{
    //     position:"absolute",
    //     top:75,right:10,width:300,
    //     background:"rgba(15,23,42,0.95)",
    //     border:"1px solid rgba(255,255,255,0.08)",
    //     borderRadius:12,
    //     padding:10,
    //     backdropFilter:"blur(10px)",
    //     boxShadow:"0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(59,130,246,0.08)",
    //     zIndex: 100,
    //     transform:"translateY(0)",
    //     animation:"slideFade 0.25s ease"
    //   },

    dockWrapper: {
        position: "absolute",
        top: 75,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 60,
    },

    dock: {
        display: "flex",
        flexDirection: "row",
        gap: 14,
        padding: "10px 20px",
        background: "rgba(10,15,20,0.95)",
        borderRadius: 14,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "all 0.25s ease",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6)"
    },

    open: {
        opacity: 1,
        transform: "translateY(0px)"
    },

    closed: {
        opacity: 0,
        transform: "translateY(-10px)",
        pointerEvents: "none"
    },

    group: { display: "flex", flexDirection: "row", gap: 8 },
    divider: { width: 1, height: 22, background: "#222" },

    btnWrap: { position: "relative" },

    btn: {
        width: 24, height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        background: "#1a1a1a",
        cursor: "pointer",
        border: "1px solid transparent",
        transition: "0.15s",
        userSelect: "none",
    },

    hover: { background: "#2a2a2a", transform: "scale(1.08)" },
    active: { background: "#1d4ed8" },

    tooltip: {
        position: "absolute",
        top: "120%",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#000",
        padding: "4px 8px",
        fontSize: 11,
        borderRadius: 4,
        whiteSpace: "nowrap",
        zIndex: 100,
    },

    contextBar: {
        position: "absolute",
        top: 70,
        width: "100%",
        height: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(10,15,20,0.95)",
        zIndex: 40,
    },

    contextLeft: { display: "flex", gap: 10, alignItems: "center" },
    contextType: { fontSize: 10, opacity: 0.5 },
    contextName: { fontSize: 13, fontWeight: 600 },
    contextCenter: { display: "flex", gap: 20 },
    contextStat: { display: "flex", gap: 6, fontSize: 12 },
    contextLabel: { opacity: 0.5 },

    clearBtn: {
        background: "#1f2937",
        border: "none",
        padding: "4px 10px",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 11
    },

    activeHover: {
        border: "1px solid #3b82f6",
        boxShadow: "0 0 10px rgba(59,130,246,0.6)"
    },

    //   pingBlue:{
    //     position:"absolute",
    //     top:-2,
    //     right:-2,
    //     width:8,
    //     height:8,
    //     background:"#3b82f6",
    //     borderRadius:"50%",
    //     boxShadow:"0 0 8px #3b82f6",
    //     animation:"pulse 5s infinite"
    //   },

    //   pingRed:{
    //     position:"absolute",
    //     top:-2,
    //     right:-2,
    //     width:8,
    //     height:8,
    //     background:"#ef4444",
    //     borderRadius:"50%",
    //     boxShadow:"0 0 8px #ef4444",
    //     animation:"pulse 5s infinite"
    //   },

    itemHover: {
        background: "rgba(255,255,255,0.06)",
        transform: "translateY(-2px)"
    },

    commandActive: {
        background: "rgba(59,130,246,0.25)",
        border: "1px solid rgba(59,130,246,0.6)",
  boxShadow: "0 0 15px rgba(59,130,246,0.6)"
    },

    badge: {
        position: "absolute",
        top: -6,
        right: -6,
        background: "#3b82f6",
        fontSize: 9,
        padding: "2px 5px",
        borderRadius: 10,
        color: "#fff"
    },

    badgeRed: {
        position: "absolute",
        top: -6,
        right: -6,
        background: "#ef4444",
        fontSize: 9,
        padding: "2px 5px",
        borderRadius: 10,
        color: "#fff"
    },

    emptyState: {
        fontSize: 12,
        opacity: 0.5,
        padding: 20,
        textAlign: "center"
    },

    itemTime: {
        fontSize: 10,
        opacity: 0.5
    },

    panelTitle: {
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 1,
        opacity: 0.8
    },

    closeBtn: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "rgba(255,255,255,0.05)",
        transition: "all 0.2s ease"
    },

    closeBtnHover: {
        background: "rgba(239,68,68,0.2)",
        boxShadow: "0 0 10px rgba(239,68,68,0.5)",
        transform: "scale(1.1)"
    },

    itemText: {
        fontSize: 12,
        fontWeight: 500
    },

    iconWrap: {
        position: "relative",
        display: "flex",
        alignItems: "center"
    },

    iconTooltip: {
        position: "absolute",
        bottom: "-22px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 10,
        background: "#000",
        padding: "3px 6px",
        borderRadius: 4,
        opacity: 0.9,
        pointerEvents: "none"
    },

    card: {
        display: "flex",
        gap: 10,
        padding: "10px",
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)"
    },

    cardDanger: {
        border: "1px solid rgba(239,68,68,0.4)",
        boxShadow: "0 0 12px rgba(239,68,68,0.2)",
        animation: "alertGlow 2s infinite"
    },

    cardInfo: {
        border: "1px solid rgba(59,130,246,0.3)"
    },

    cardIcon: {
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        background: "rgba(255,255,255,0.05)"
    },

    cardContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column"
    },

    cardTitle: {
        fontSize: 12,
        fontWeight: 600
    },

    cardMeta: {
        fontSize: 10,
        opacity: 0.6,
        display: "flex",
        gap: 6
    },

    cardAction: {
        opacity: 0.4,
        cursor: "pointer"
    },
    panelNew: {
        position: "absolute",
        top: 75,
        right: 10,
        width: 340,
        background: "linear-gradient(180deg, rgba(15,20,35,0.95), rgba(10,15,25,0.95))",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        overflow: "hidden",
        borderTop: "2px solid #3b82f6",
        zIndex: 100,
    },

    panelTop: {
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(90deg, rgba(59,130,246,0.08), transparent)"
    },

    panelSub: {
        fontSize: 11,
        opacity: 0.5
    },

    panelActions: {
        display: "flex",
        gap: 6,
        alignItems: "center"
    },

    switchBtnNew: {
        fontSize: 11,
        padding: "4px 10px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.05)",
        border: "none",
        cursor: "pointer",
        opacity: 0.6,
        transition: "all 0.2s ease"
    },

    switchBtnHover: {
        background: "rgba(255,255,255,0.08)",
        opacity: 1,
        boxShadow: "0 0 12px rgba(59,130,246,0.8)",
        transform: "scale(1.05)"
    },

    switchActiveNew: {
        background: "linear-gradient(135deg,#3b82f6,#2563eb)",
        color: "#fff",
        boxShadow: "0 0 10px rgba(59,130,246,0.6)",
        opacity: 1
    },

    panelList: {
        maxHeight: 320,
        overflowY: "auto",
        padding: 12,
        background: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)"
    },

    itemNew: {
        display: "flex",
        gap: 12,
        padding: "12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        marginBottom: 8,
        alignItems: "center",
        border: "1px solid rgba(255,255,255,0.04)",
        transition: "all 0.2s ease",
        cursor: "pointer",
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        boxShadow: "0 0 8px currentColor"
    },

    panelFooterNew: {
        padding: 10,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        justifyContent: "flex-end"
    },

    clearBtnNew: {
        fontSize: 11,
        padding: "6px 12px",
        borderRadius: 8,
        background: "rgba(239,68,68,0.15)",
        color: "#ef4444",
        border: "none",
        cursor: "pointer"
    },

    itemUnread: {
        border: "1px solid rgba(59,130,246,0.6)",
        background: "rgba(59,130,246,0.08)",
        boxShadow: "0 0 10px rgba(59,130,246,0.2)"
    },

    itemUnreadAlert: {
        border: "1px solid rgba(239,68,68,0.7)",
        background: "rgba(239,68,68,0.08)",
        boxShadow: "0 0 10px rgba(239,68,68,0.25)"
    },

    viewMore: {
        fontSize: 11,
        opacity: 0.6,
        padding: "8px",
        textAlign: "center",
        cursor: "pointer"
    },

    modePill: {
        fontSize: 10,
        padding: "4px 10px",
        borderRadius: 20,
        background: "rgba(59,130,246,0.15)",
        border: "1px solid rgba(59,130,246,0.4)",
        letterSpacing: 1,
        fontWeight: 600,
        width: 90,
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "all 0.2s ease",
    },

    mid: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    metricGroup: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    liveGroup: {
        display: "flex",
        alignItems: "center",
        gap: 6,
    },

    timelineWrapper: {
        position: "absolute",
        top: "100%",
        left: "45%",
        width: "250px",
        marginTop: "4px",
        background: "rgba(2,6,23,0.95)",
        border: "1px solid #1f2933",
        borderRadius: "12px",
        padding: "6px 10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 10,
        
    },

    timelineHeader: {
        fontSize: "8px",
        opacity: 0.4,
        marginBottom: "2px",
        letterSpacing: "0.1em",
    },

    slider: {
        width: "100%",
        cursor: "pointer",
        height: "4px",
        appearance: "none",
        background: "linear-gradient(to right, #3b82f6, #1d4ed8)",
        borderRadius: "4px",
        outline: "none",
        transition: "all 0.2s ease",
    },

    timelineRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },

    timelineTrack: {
        flex: 1,
        position: "relative",
        userSelect: "none",
    },

    timeText: {
        fontSize: "11px",
        color: "#94a3b8",
        width: "40px",
        textAlign: "center",
        pointerEvents: "none",
        userSelect: "none",
    },

    currentLabel: {
        position: "absolute",
        top: "-18px",
        transform: "translateX(-50%)",
        fontSize: "10px",
        color: "#f59e0b",
        pointerEvents: "none",
        userSelect: "none",
    },
    track: {
  position: "absolute",
  height: "3px",
  width: "100%",
  background: "linear-gradient(to right, #111827, #1f2937)",
  borderRadius: "6px",
  top: "50%",
  transform: "translateY(-50%)",
},

progressBar: {
  position: "absolute",
  height: "4px",
  background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
  borderRadius: "6px",
  top: "50%",
  transform: "translateY(-50%)",
  boxShadow: "0 0 12px rgba(59,130,246,0.7)",
},

dot2: {
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "#0ea5e9", // 🔥 better color (cyan-blue)
  border: "0.5px solid #fafafa",
  boxShadow: "0 0 8px rgba(14,165,233,0.8)",
  pointerEvents: "none",
  zIndex: 2,
  
},
range: {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "100%",
  height: "16px",   // thinner but usable
  opacity: 0,
  cursor: "pointer",
},
tickLeft: {
  position: "absolute",
  left: 0,
  top: "50%",
  width: "2px",
  height: "8px",
  background: "#64748b",
  transform: "translateY(-50%)"
},
tickRight: {
  position: "absolute",
  right: 0,
  top: "50%",
  width: "2px",
  height: "8px",
  background: "#64748b",
  transform: "translateY(-50%)"
},

};