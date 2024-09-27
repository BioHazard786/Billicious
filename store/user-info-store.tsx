import { User } from "@/lib/types";
import { produce } from "immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  user: User;
};

type Action = {
  setAvatarUrl: (avatarUrl: string) => void;
  setFullName: (fullName: string) => void;
};

const useUserInfoStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    user: null,
    setAvatarUrl: (avatarUrl) =>
      set(
        produce((state: State) => {
          state.user!.avatar_url = avatarUrl;
        }),
      ),
    setFullName: (fullName) =>
      set(
        produce((state: State) => {
          state.user!.full_name = fullName;
        }),
      ),
  }),
  shallow,
);

const useUserInfoStore = createSelectors(useUserInfoStoreBase);

export default useUserInfoStore;
