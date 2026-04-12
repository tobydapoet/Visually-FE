import { useState, useEffect, useRef } from "react";

interface Options {
  estimatedMs?: number;
}

export function useProgressBar({ estimatedMs = 3000 }: Options = {}) {
  const [progress, setProgress] = useState<number>(0);

  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  function start() {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const p = 90 * (1 - Math.exp(-elapsed / estimatedMs));
      setProgress(Math.round(p));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function done() {
    cancelAnimationFrame(rafRef.current);
    setProgress(100);
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { progress, start, done, reset };
}
