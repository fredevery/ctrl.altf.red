"use client";

import { useEffect, useState } from "react";

export function useWindowResize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
  });

  useEffect(() => {
    const windowRef =
      typeof window !== "undefined"
        ? window
        : {
            innerWidth: 0,
            innerHeight: 0,
            addEventListener: () => {},
            removeEventListener: () => {},
          };

    function updateSize() {
      setSize({
        width: windowRef.innerWidth,
        height: windowRef.innerHeight,
        centerX: windowRef.innerWidth / 2,
        centerY: windowRef.innerHeight / 2,
      });
    }

    windowRef.addEventListener("resize", updateSize);
    updateSize();

    return () => {
      windowRef.removeEventListener("resize", updateSize);
    };
  }, []);

  return size;
}
