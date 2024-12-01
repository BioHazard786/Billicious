import { User } from "@/lib/types";
import { produce } from "immer";
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

type State = {
  user: User;
};

type Action = {
  setAvatarUrl: (avatarUrl: string) => void;
  setName: (name: string) => void;
  setUserName: (username: string) => void;
};

export type UserStore = ReturnType<typeof createUserStore>;

export const createUserStore = (user: User) => {
  return createStore<Action & State>()((set) => ({
    user: user,
    setAvatarUrl: (avatarUrl) =>
      set(
        produce((state: State) => {
          state.user!.avatar_url = avatarUrl;
        }),
      ),
    setName: (fullName) =>
      set(
        produce((state: State) => {
          state.user!.name = fullName;
        }),
      ),
    setUserName: (username) =>
      set(
        produce((state: State) => {
          state.user!.username = username;
        }),
      ),
  }));
};

export const UserStoreContext = createContext<UserStore | null>(null);

export default function useUserInfoStore<T>(
  selector: (state: Action & State) => T,
): T {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error("Missing UserStoreContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, shallow);
}
