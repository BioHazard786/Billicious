import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  activeTab: number;
  direction: number;
  isAnimating: boolean;
};

type Action = {
  setActiveTab: (tabIndex: number) => void;
  setDirection: (direction: number) => void;
  setIsAnimating: (animationStatus: boolean) => void;
};

const useAddBillStore = createWithEqualityFn<State & Action>(
  (set) => ({
    activeTab: 0,
    direction: 0,
    isAnimating: false,
    setActiveTab: (tabIndex) => set({ activeTab: tabIndex }),
    setDirection: (direction) => set({ direction: direction }),
    setIsAnimating: (animationStatus) => set({ isAnimating: animationStatus }),
  }),
  shallow,
);

export default useAddBillStore;
