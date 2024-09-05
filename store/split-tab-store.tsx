import { TMembers } from "@/lib/types";
import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  drawees: string[];
};

type Action = {
  addDrawees: (draweeIndex: string) => void;
  removeDrawees: (draweeIndex: string) => void;
  setInitialDraweeState: (groupMembers: TMembers[]) => void;
  reset: () => void;
};

const useSplitTabStore = createWithEqualityFn<State & Action>(
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
    setInitialDraweeState: (groupMembers) =>
      set(() => ({
        drawees: groupMembers.map(({ memberIndex }) => memberIndex),
      })),
    reset: () => set({ drawees: [] }),
  }),
  shallow,
);

export default useSplitTabStore;
