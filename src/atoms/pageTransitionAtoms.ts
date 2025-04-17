import { atom, useAtom } from "jotai";
export type TransitionPage = {
  children: React.ReactNode;
  pathname: string;
};

export enum PAGE_STATES {
  EXIT = "EXIT",
  EXIT_COMPLETE = "EXIT_COMPLETE",
  ENTER = "ENTER",
  COMPLETE = "COMPLETE",
  IDLE = "IDLE",
}

export const pageTransitionAtom = atom(false);
export const pageTransitionStateAtom = atom(PAGE_STATES.IDLE);
export const newPageAtom = atom<TransitionPage | null>(null);
export const currentPageAtom = atom<TransitionPage | null>(null);

type CallbackFunction = () => void;

const callbacks = {
  onExitCallback: () => {},
  onEnterCallback: () => {},
  onCompleteCallback: () => {},
  onIdleCallback: () => {},
  onExitCompleteCallback: () => {},
};

export const usePageTransitionState = () => {
  const [pageTransitionState, setPageTransitionState] = useAtom(
    pageTransitionStateAtom
  );

  const getters = {
    state: pageTransitionState,
    states: PAGE_STATES,
    isExit: () => pageTransitionState === PAGE_STATES.EXIT,
    isExitComplete: () => pageTransitionState === PAGE_STATES.EXIT_COMPLETE,
    isEnter: () => pageTransitionState === PAGE_STATES.ENTER,
    isIdle: () => pageTransitionState === PAGE_STATES.IDLE,
    isComplete: () => pageTransitionState === PAGE_STATES.COMPLETE,
  };

  const actions = {
    set: (newState: PAGE_STATES) => {
      switch (newState) {
        case PAGE_STATES.EXIT:
          actions.setToExit();
          break;
        case PAGE_STATES.EXIT_COMPLETE:
          actions.setToExitComplete();
          break;
        case PAGE_STATES.ENTER:
          actions.setToEnter();
          break;
        case PAGE_STATES.IDLE:
          actions.setToIdle();
          break;
        case PAGE_STATES.COMPLETE:
          actions.setToComplete();
          break;
        default:
          throw new Error("Invalid state");
      }
    },
    setToExit: () => {
      setPageTransitionState(PAGE_STATES.EXIT);
      callbacks.onExitCallback();
    },
    setToExitComplete: () => {
      setPageTransitionState(PAGE_STATES.EXIT_COMPLETE);
      console.log("onExitComplete", callbacks.onExitCompleteCallback);
      callbacks.onExitCompleteCallback();
    },
    setToEnter: () => {
      setPageTransitionState(PAGE_STATES.ENTER);
      callbacks.onEnterCallback();
    },
    setToIdle: () => {
      setPageTransitionState(PAGE_STATES.IDLE);
      callbacks.onIdleCallback();
    },
    setToComplete: () => {
      setPageTransitionState(PAGE_STATES.COMPLETE);
      callbacks.onCompleteCallback();
    },
    onExit: (callback: CallbackFunction) =>
      (callbacks.onExitCallback = callback),
    onExitComplete: (callback: CallbackFunction) => {
      console.log("onExitComplete", callback);
      callbacks.onExitCompleteCallback = callback;
    },
    onEnter: (callback: CallbackFunction) =>
      (callbacks.onEnterCallback = callback),
    onComplete: (callback: CallbackFunction) =>
      (callbacks.onCompleteCallback = callback),
    onIdle: (callback: CallbackFunction) =>
      (callbacks.onIdleCallback = callback),
  };

  return {
    ...getters,
    ...actions,
  };
};
