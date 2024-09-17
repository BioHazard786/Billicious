import { TMembers } from "@/lib/types";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  drawees: string[];
};

type Action = {
  addDrawees: (draweeIndex: string) => void;
  removeDrawees: (draweeIndex: string) => void;
  reset: (groupMembers: TMembers[]) => void;
};

const useSplitEquallyTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    drawees: [],
    addDrawees: (draweeIndex) =>
      set((state) => ({
        drawees: [...state.drawees, draweeIndex],
      })),
    removeDrawees: (draweeIndex) =>
      set((state) => ({
        drawees: state.drawees.filter((index) => index !== draweeIndex),
      })),
    reset: (groupMembers) =>
      set(() => ({
        drawees: groupMembers.map(({ memberIndex }) => memberIndex),
      })),
  }),
  shallow,
);

const useSplitEquallyTabStore = createSelectors(useSplitEquallyTabStoreBase);

export default useSplitEquallyTabStore;
