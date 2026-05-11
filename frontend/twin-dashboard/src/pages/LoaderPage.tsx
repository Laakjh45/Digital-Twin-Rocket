import React, { useEffect, useState, } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

type Props = {
  onFinish: () => void;
};

const stages = [
  "Initializing Core Systems",
  "Loading Twin Engine",
  "Connecting Telemetry",
  "Calibrating Sensors",
  "Launching Interface",
];

export default function LoaderPage({ onFinish }: Props) {
  const [progress, setProgress] = useState(0);
  const [init, setInit] = useState(false);
  const [bitrate, setBitrate] = useState(0);
  const [done, setDone] = useState(false);
  const stageIndex = Math.min(
    Math.floor((progress / 100) * stages.length),
    stages.length - 1
  );

  // Logic: Dynamic progress with "stalls" and "bursts"
  useEffect(() => {
    let active = true;
    const updateProgress = () => {
        if (!active) return;
        setBitrate(Math.random() * 100);
        setProgress((prev) => {
        if (prev >= 100) {
            if (!done) {
                setDone(true);
                onFinish?.();
            }
            return 100;
        }
        const slowDown = prev > 80 ? 0.3 : 1;
        if (prev > 95) return 100;
        const next = Math.min(prev + Math.random() * 10 * slowDown, 100);
        return next;
        });
        setTimeout(updateProgress, Math.random() * 400 + 100);
    };
    const id = setTimeout(updateProgress, 500);
    return () => {
        active = false;
        clearTimeout(id);
    };
    }, [onFinish]);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div style={styles.container}>
      {/* Overlay Grid / Scanlines */}
      <div style={styles.scanline} />
      <div style={styles.cornerTL} />
      <div style={styles.cornerTR} />
      <div style={styles.cornerBL} />
      <div style={styles.cornerBR} />

      {init && (
        <Particles
          id="tsparticles"
          options={{
            particles: {
              number: { value: 40 },
              size: { value: { min: 1, max: 2 } },
              move: {
                enable: true,
                speed: 0.5,
                direction: "top",
                outModes: "out"
              },
              opacity: { value: 0.3 },
              links: {
                enable: true,
                distance: 150,
                opacity: 0.1,
                color: "#6366f1"
              },
            },
          }}
        />
      )}

      {/* Pulsing Ambient Light */}
      <motion.div
        style={styles.glow}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div style={styles.center}>
        <div style={styles.logoRow}>
          <motion.div
            style={styles.logoWrap}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <img src="/assets/logos/sac-logo.png" style={styles.logoImg} alt="SAC Logo" />
          </motion.div>

          <motion.div
            style={styles.divider}
            animate={{ height: ["0px", "160px", "160px"] }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />

          <motion.div
            style={styles.logoWrap}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <img src="/assets/logos/isro_logo.svg" style={styles.logoImg} alt="ISRO Logo" />
          </motion.div>
        </div>

        {/* Data Readout Aesthetics */}
        <motion.div style={styles.titleContainer}>
          <div style={styles.bracket}>[</div>
          <motion.div style={styles.title}>DIGITAL TWIN PLATFORM</motion.div>
          <div style={styles.bracket}>]</div>
        </motion.div>

        <div style={styles.statusBox}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stageIndex}
              style={styles.stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <span style={styles.prefix}>&gt;</span> {stages[stageIndex]}...
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress System */}
        <div style={styles.progressContainer}>
          <div style={styles.progressTrack}>
            <motion.div
                style={styles.progressFill}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.25 }}
            >
                <motion.div
                style={styles.dataStream}
                animate={{ x: ["0%", "400%"] }}
                transition={{
                    ease: "linear",
                    duration: 1.2,
                    repeat: Infinity,
                }}
                />
            </motion.div>
            <motion.div
                style={styles.progressLead}
                animate={{ left: `calc(${Math.min(progress, 99)}% - 5px)`}}
                transition={{ ease: "linear", duration: 0.25 }}
            />
          </div>
          <div style={styles.dataRow}>
            <span style={styles.percent}>{Math.floor(progress)}% COMPLETE</span>
            <span style={styles.bitrate}>
              {bitrate.toFixed(2)} KB/S
            </span>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ●
        </motion.span> SYSTEM STATUS: OPTIMAL | SECURE_LINK: ACTIVE
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    height: "100vh",
    background: `radial-gradient(circle at 50% 50%, #0b1220 0%, #020617 70%, #000 100%),
                   radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.6) 100%)`,
    color: "#e6edf3",
    fontFamily: "'Share Tech Mono', monospace",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  scanline: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%)",
    backgroundSize: "100% 4px",
    zIndex: 10,
    pointerEvents: "none",
  },

  glow: {
    position: "absolute",
    width: "800px",
    height: "800px",
    background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
    filter: "blur(120px)",
  },

  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  bracket: {
    color: "#6366f1",
    fontSize: "24px",
    fontWeight: "300",
  },

  title: {
    fontSize: "18px",
    letterSpacing: "8px",
    textShadow: "0 0 10px rgba(99,102,241,0.5)",
  },

  statusBox: {
    height: "20px",
    marginBottom: "30px",
  },

  prefix: {
    color: "#6366f1",
    marginRight: "8px",
  },

  stage: {
    fontSize: "13px",
    color: "#94a3b8",
    textTransform: "uppercase",
    textAlign: "center",
  },

  progressContainer: {
    width: "400px",
    margin: "0 auto",
  },

  progressTrack: {
    position: "relative",
    height: "2px",
    background: "rgba(255,255,255,0.05)",
    marginBottom: "12px",
    overflow: "hidden",
  },

  progressFill: {
    position: "relative",
    height: "100%",
    background: "#6366f1",
    boxShadow: "0 0 15px #6366f1",
    overflow: "hidden",
  },

  progressLead: {
    position: "absolute",
    top: "-4px",
    width: "10px",
    height: "10px",
    background: "#fff",
    borderRadius: "50%",
    filter: "blur(4px)",
  },

  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9px",
    color: "#475569",
    letterSpacing: "1px",
  },

  logoRow: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: "10px", 
    marginBottom: "40px" 
  },
  
  logoWrap: { 
    width: "720px", 
    height: "360px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center" 
  },

  logoImg: { 
    maxWidth: "100%", 
    maxHeight: "100%", 
    objectFit: "contain" 
  },

  divider: { 
    width: "1px", 
    background: "linear-gradient(to bottom, transparent, #6366f1, transparent)" 
  },
  
  footer: { 
    position: "absolute", 
    bottom: "30px", 
    fontSize: "10px", 
    color: "#475569", 
    letterSpacing: "2px" 
  },

  cornerTL: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderTop: "1px solid rgba(99,102,241,0.3)",
    borderLeft: "1px solid rgba(99,102,241,0.3)",
  },

  cornerTR: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderTop: "1px solid rgba(99,102,241,0.3)",
    borderRight: "1px solid rgba(99,102,241,0.3)",
  },

  cornerBL: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 40,
    height: 40,
    borderBottom: "1px solid rgba(99,102,241,0.3)",
    borderLeft: "1px solid rgba(99,102,241,0.3)",
  },

  cornerBR: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderBottom: "1px solid rgba(99,102,241,0.3)",
    borderRight: "1px solid rgba(99,102,241,0.3)",
  },

  dataStream: {
    position: "absolute",
    top: 0,
    left: "-30%",
    width: "30%",
    height: "100%",
    background: "linear-gradient(to right, transparent, #ffffff, transparent)",
    filter: "blur(1px)",
    opacity: 0.5,
  },
};