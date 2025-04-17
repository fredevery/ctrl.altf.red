import { create } from "zustand";

type State = {
    transitioning: boolean;
}

type Action = {
    setTransitioning: (value: boolean) => void;
}
export const useGlobalState = create<State & Action>((set) => ({
    transitioning: false,
    setTransitioning: (value: boolean) => set({ transitioning: value }),
}));