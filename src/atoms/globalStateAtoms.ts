"use client";

import { atom, useAtom } from "jotai";

// type CallbackFunction
export const mousePositionAtom = atom({ x: 0, y: 0 });

const callbacks: {
  mouseMove: CallableFunction[];
} = {
  mouseMove: [],
};

let windowListenerActive = false;
export const useGlobalState = () => {
  const [mousePosition, setMousePosition] = useAtom(mousePositionAtom);

  const getters = {
    mousePosition,
  };

  const actions = {
    setMousePosition,
    onMouseMove: (callback: CallableFunction) =>
      callbacks.mouseMove.push(callback),
    offMouseMove: (callback: CallableFunction) => {
      const callbackIndex = callbacks.mouseMove.findIndex(
        storedCallback => storedCallback === callback
      );
      callbacks.mouseMove.splice(callbackIndex, 1);
    },
  };

  if (!windowListenerActive) {
    window.addEventListener("mousemove", event => {
      callbacks.mouseMove.forEach(callback => callback(event));
    });
    windowListenerActive = true;
  }

  return {
    ...getters,
    ...actions,
  };
};
