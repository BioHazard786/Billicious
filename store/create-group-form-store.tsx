import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  activeTab: number;
  direction: number;
  isAnimating: boolean;
};

type Action = {
  setActiveTab: (tabIndex: number) => void;
  setDirection: (direction: number) => void;
  setIsAnimating: (animationStatus: boolean) => void;
  reset: () => void;
};

const initialState: State = {
  activeTab: 0,
  direction: 0,
  isAnimating: false,
};

const useCreateGroupFormStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    ...initialState,
    setActiveTab: (tabIndex) => set({ activeTab: tabIndex }),
    setDirection: (direction) => set({ direction: direction }),
    setIsAnimating: (animationStatus) => set({ isAnimating: animationStatus }),
    reset: () => set(initialState),
  }),
  shallow,
);

const useCreateGroupFormStore = createSelectors(useCreateGroupFormStoreBase);

export default useCreateGroupFormStore;
