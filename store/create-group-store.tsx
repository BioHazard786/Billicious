import { PermanentUser } from "@/lib/types";
import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  temporaryMemberNames: string[];
  permanentMembers: PermanentUser[];
};

type Action = {
  addTemporaryMemberName: (name: string) => void;
  removeTemporaryMemberName: (name: string) => void;
  addPermanentMember: (user: PermanentUser) => void;
  removePermanentMember: (username: string) => void;
  reset: () => void;
};

const initialState = {
  temporaryMemberNames: [],
  permanentMembers: [],
};

const useCreateGroupBase = createWithEqualityFn<State & Action>(
  (set) => ({
    ...initialState,
    addTemporaryMemberName: (name) =>
      set(
        produce((state: State) => {
          state.temporaryMemberNames.push(name);
        }),
      ),
    removeTemporaryMemberName: (name) =>
      set(
        produce((state: State) => {
          state.temporaryMemberNames = state.temporaryMemberNames.filter(
            (item) => item !== name,
          );
        }),
      ),
    addPermanentMember: (user) =>
      set(
        produce((state: State) => {
          state.permanentMembers.push(user);
        }),
      ),
    removePermanentMember: (username_to_remove) =>
      set(
        produce((state: State) => {
          state.permanentMembers = state.permanentMembers.filter(
            ({ username }) => username !== username_to_remove,
          );
        }),
      ),
    reset: () => set(initialState),
  }),
  shallow,
);

const useCreateGroup = createSelectors(useCreateGroupBase);

export default useCreateGroup;
