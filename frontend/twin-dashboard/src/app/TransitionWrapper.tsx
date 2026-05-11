import React, { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
};

export default function TransitionWrapper({ children }: Props) {
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase] = useState<"idle" | "fadeIn" | "fadeOut">("idle");
  
  // Track the children to see if they actually changed
  const lastChildrenRef = useRef(children);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 1. Hard skip for the very first mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 2. Skip if children haven't actually changed (prevents accidental triggers)
    if (lastChildrenRef.current === children) {
      return;
    }

    lastChildrenRef.current = children;
    let timeout: NodeJS.Timeout;

    // Use a micro-task to avoid the cascading render warning
    const frame = requestAnimationFrame(() => {
      setPhase("fadeOut");

      timeout = setTimeout(() => {
        setDisplayed(children);
        setPhase("fadeIn");
      }, 220);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (timeout) clearTimeout(timeout);
    };
  }, [children]);

  return (
    <div
      style={{
        ...styles.container,
        ...(phase === "fadeIn" ? styles.fadeIn : {}),
        ...(phase === "fadeOut" ? styles.fadeOut : {}),
      }}
    >
      {displayed}
    </div>
  );
}

const styles: any = {
  container: {
    height: "100%",
    width: "100%",
    transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
    opacity: 1,
  },
  fadeIn: {
    opacity: 1,
    transform: "scale(1)",
    filter: "blur(0px)",
  },
  fadeOut: {
    opacity: 0,
    transform: "scale(0.96)",
    filter: "blur(6px)",
  },
};
