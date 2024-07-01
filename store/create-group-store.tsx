import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  memberNames: string[];
  groupNameError: string;
  memberNameError: string;
};

type Action = {
  setMemberNames: (newMemberNames: State["memberNames"]) => void;
  setGroupNameError: (error: State["groupNameError"]) => void;
  setMemberNameError: (error: State["memberNameError"]) => void;
  setCreateGroupState: (
    newMembersName: string[],
    groupNameError: string,
    memberNameError: string,
  ) => void;
};

const useCreateGroup = createWithEqualityFn<State & Action>(
  (set) => ({
    memberNames: ["Me"],
    groupNameError: "",
    memberNameError: "",
    setMemberNames: (newMemberNames: string[]) =>
      set({ memberNames: newMemberNames }),
    setGroupNameError: (error: string) => set({ groupNameError: error }),
    setMemberNameError: (error: string) => set({ memberNameError: error }),
    setCreateGroupState: (
      newMembersName: string[],
      groupNameError: string,
      memberNameError: string,
    ) =>
      set({
        memberNames: newMembersName,
        groupNameError: groupNameError,
        memberNameError: memberNameError,
      }),
  }),
  shallow,
);

export default useCreateGroup;
