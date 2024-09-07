import { TMembers } from "@/lib/types";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  drawees: string[];
  draweeAmount: { [key: string]: number };
  currentSelectedTab: "equally" | "amount" | "percent" | "weights";
};

type Action = {
  addDrawees: (draweeIndex: string) => void;
  removeDrawees: (draweeIndex: string) => void;
  setDraweeAmount: (draweeAmount: State["draweeAmount"]) => void;
  setCurrentSelectedTab: (tabName: State["currentSelectedTab"]) => void;
  reset: (groupMembers: TMembers[]) => void;
};

const useSplitTabStore = createWithEqualityFn<State & Action>(
  (set) => ({
    drawees: [],
    draweeAmount: {},
    currentSelectedTab: "equally",
    addDrawees: (draweeIndex) =>
      set((state) => ({
        drawees: [...state.drawees, draweeIndex],
      })),
    removeDrawees: (draweeIndex) =>
      set((state) => ({
        drawees: state.drawees.filter((index) => index !== draweeIndex),
      })),
    setDraweeAmount: (draweeAmount) =>
      set((state) => ({
        draweeAmount: draweeAmount,
      })),
    setCurrentSelectedTab: (tabName) =>
      set(() => ({ currentSelectedTab: tabName })),
    reset: (groupMembers) =>
      set(() => ({
        drawees: groupMembers.map(({ memberIndex }) => memberIndex),
      })),
  }),
  shallow,
);

export default useSplitTabStore;
