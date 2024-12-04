import { userGroup } from "@/lib/types";
import { produce } from "immer";
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

type State = {
  userGroupsData: userGroup[];
};

type Action = {
  deleteUserGroup: (groupId: string) => void;
  addUserGroups: (userGroups: userGroup[]) => void;
};

export type UserGroupsDataStore = ReturnType<typeof createUserGroupsDataStore>;

export const createUserGroupsDataStore = (userGroupsData: userGroup[]) => {
  return createStore<Action & State>()((set) => ({
    userGroupsData: userGroupsData,
    addUserGroups: (userGroups) => set({ userGroupsData: userGroups }),
    deleteUserGroup: (groupId) =>
      set(
        produce((state: State) => {
          state.userGroupsData = state.userGroupsData.filter(
            (group) => group.groupId !== groupId,
          );
        }),
      ),
  }));
};

export const UserGroupsDataStoreContext =
  createContext<UserGroupsDataStore | null>(null);

export default function useUserGroupsDataStore<T>(
  selector: (state: Action & State) => T,
): T {
  const store = useContext(UserGroupsDataStoreContext);
  if (!store) throw new Error("Missing UserStoreContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, shallow);
}
