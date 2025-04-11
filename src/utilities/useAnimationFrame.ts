import { useEffect, useRef } from "react";

type FrameResult = {
  stop: boolean;
};

export function useAnimationFrame(
  callback: (deltaTime: number) => FrameResult | void
) {
  console.log("----");
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);
  const animate = (time: number) => {
    let frameResult = { stop: false };
    if (previousTimeRef.current !== 0) {
      const deltaTime = time - previousTimeRef.current;
      frameResult = callback(deltaTime) || { stop: false };
    }
    previousTimeRef.current = time;
    if (!frameResult.stop) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  });
}
