import React, { useEffect, useState } from "react";

type Props = {
  active: boolean;
  onComplete: () => void;
};

export default function TransitionOverlay({ active, onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "expand" | "fade">("idle");

  useEffect(() => {
    if (!active) return;

    setPhase("expand");

    const t1 = setTimeout(() => {
      setPhase("fade");
    }, 500);

    const t2 = setTimeout(() => {
      onComplete();
      setPhase("idle");
    }, 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  if (!active && phase === "idle") return null;

  return (
    <div
      style={{
        ...styles.overlay,
        ...(phase === "expand" ? styles.expand : {}),
        ...(phase === "fade" ? styles.fade : {}),
      }}
    />
  );
}

const styles: any = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle at center, #020617, #000)",
    zIndex: 9999,
    transform: "scale(0.2)",
    opacity: 0,
    borderRadius: "24px",
    transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
  },

  expand: {
    transform: "scale(1)",
    opacity: 1,
    borderRadius: "0px",
  },

  fade: {
    opacity: 0,
  },
};