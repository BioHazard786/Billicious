import { TMembers } from "@/lib/types";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  drawees: string[];
};

type Action = {
  addDrawees: (draweeIndex: string) => void;
  removeDrawees: (draweeIndex: string) => void;
  reset: (groupMembers: TMembers[]) => void;
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
    reset: (groupMembers) =>
      set(() => ({
        drawees: groupMembers.map(({ memberIndex }) => memberIndex),
      })),
  }),
  shallow,
);

export default useSplitTabStore;
