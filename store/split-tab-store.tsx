import { TMembers } from "@/lib/types";
import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  drawees: { draweeId: string; draweeName: string }[];
};

type Action = {
  addDrawees: (draweeId: string, draweeName: string) => void;
  removeDrawees: (draweeId: string) => void;
  setInitialDraweeState: (groupMembers: TMembers[]) => void;
};

const useSplitTabStore = createWithEqualityFn<State & Action>(
  (set) => ({
    drawees: [],
    addDrawees: (draweeId, draweeName) =>
      set(
        produce((state: State) => {
          state.drawees.push({
            draweeId: draweeId,
            draweeName: draweeName,
          });
        }),
      ),
    removeDrawees: (draweeId) =>
      set((state) => ({
        drawees: state.drawees.filter((drawee) => drawee.draweeId !== draweeId),
      })),
    setInitialDraweeState: (groupMembers) =>
      set(() => ({
        drawees: groupMembers.map(({ memberId, name }) => ({
          draweeId: memberId,
          draweeName: name,
        })),
      })),
  }),
  shallow,
);

export default useSplitTabStore;
