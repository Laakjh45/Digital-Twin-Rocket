import React, { useEffect, useState } from "react";

export default function AnimatedNumber({ value }: any) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = display;
    const end = value;
    const step = () => {
      start += (end - start) * 0.1;
      if (Math.abs(end - start) < 0.5) {
        setDisplay(end);
        return;
      }
      setDisplay(start);
      requestAnimationFrame(step);
    };
    step();
  }, [value]);

  return <>{Math.round(display)}</>;
}