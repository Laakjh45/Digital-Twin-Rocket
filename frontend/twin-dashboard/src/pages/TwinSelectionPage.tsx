import React, { useRef, useState } from "react";
import RocketPreview from "../components/preview/RocketPreview.tsx";
import { twins } from "../core/TwinRegistry";
import type { TwinDefinition } from "../core/TwinRegistry";

type Props = {
  onSelect: (twin: TwinDefinition) => void;
};

export default function TwinSelectionPage({ onSelect }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.bgAmbient} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>DIGITAL TWIN HUB</div>

        <div style={styles.headerSub}>
          Select a system to initialize
        </div>
      </div>

      {/* Dynamic Grid */}
      <div style={styles.grid}>
        {twins.map((twin) => (
          <InteractiveCard
            key={twin.id}
            twin={twin}
            onClick={() => {
              if (twin.enabled) {
                onSelect(twin);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

//INTERACTIVE TWIN CARD

function InteractiveCard({
  twin,
  onClick,
}: {
  twin: TwinDefinition;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<any>({});
  const PreviewComponent = twin.previewComponent;

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current || !twin.enabled) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = -(y - rect.height / 2) / 18;
    const rotateY = (x - rect.width / 2) / 18;

    setStyle({
      transform: `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.04)
      `,
      background: `
        radial-gradient(
          circle at ${x}px ${y}px,
          rgba(56,189,248,0.22),
          transparent 60%
        )
      `,
    });
  };

  const reset = () => {
    setStyle({
      transform: "rotateX(0deg) rotateY(0deg) scale(1)",
      background: "transparent",
    });
  };

  return (
    <div
      ref={ref}
      style={{
        ...styles.card,
        ...(twin.enabled
          ? {}
          : styles.disabledCard),
        ...style,
      }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
    >
      <div style={styles.cardInner}>
        {/* Preview */}
        <div style={styles.preview}>
          <PreviewComponent modelPath={twin.modelPath} />
        </div>

        {/* Content */}
        <div>
          <div style={styles.title}>
            {twin.name}
          </div>
          <div style={styles.desc}>
            {twin.description}
          </div>
        </div>

        {/* Status */}
        <div
          style={{
            ...styles.status,
            color: twin.enabled
              ? "#22c55e"
              : "#64748b",
          }}
        >
          {twin.enabled
            ? "AVAILABLE"
            : "COMING SOON"}
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    height: "100vh",
    width: "100%",
    background: "radial-gradient(circle at 50% 40%, #020617 0%, #000 100%)",
    color: "#e6edf3",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  bgAmbient: {
    position: "absolute",
    width: "1000px",
    height: "1000px",
    background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
    filter: "blur(140px)",
  },

  header: {
    textAlign: "center",
    marginBottom: "60px",
    zIndex: 2,
  },

  headerTitle: {
    fontSize: "24px",
    letterSpacing: "4px",
    marginBottom: "10px",
  },

  headerSub: {
    fontSize: "12px",
    color: "#94a3b8",
    letterSpacing: "1px",
  },

  grid: {
    display: "flex",
    gap: "40px",
    perspective: "1200px",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "90%",
    maxWidth: "1500px",
    zIndex: 2,
  },

  card: {
    width: "320px",
    height: "260px",
    borderRadius: "22px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(25px)",
    cursor: "pointer",
    transition: "transform 0.25s ease, background 0.25s ease",
    transformStyle: "preserve-3d",
    boxShadow: "0 0 40px rgba(0,0,0,0.25)",
  },

  disabledCard: {
    opacity: 0.4,
    filter: "grayscale(0.4)",
    cursor: "default",
  },

  cardInner: {
    height: "100%",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  preview: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "140px",
    overflow: "hidden",
  },

  title: {
    fontSize: "17px",
    marginBottom: "6px",
  },

  desc: {
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },

  status: {
    fontSize: "11px",
    letterSpacing: "1.5px",
    marginTop: "10px",
  },
};