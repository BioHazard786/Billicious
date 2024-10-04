import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  memberNames: string[];
};

type Action = {
  addMemberName: (name: string) => void;
  removeMemberName: (name: string) => void;
  reset: () => void;
};

const useCreateGroupBase = createWithEqualityFn<State & Action>(
  (set) => ({
    memberNames: [],
    addMemberName: (name) =>
      set(
        produce((state: State) => {
          state.memberNames.push(name);
        }),
      ),
    removeMemberName: (name) =>
      set(
        produce((state: State) => {
          state.memberNames = state.memberNames.filter((item) => item !== name);
        }),
      ),
    reset: () => set(() => ({ memberNames: [] })),
  }),
  shallow,
);

const useCreateGroup = createSelectors(useCreateGroupBase);

export default useCreateGroup;
