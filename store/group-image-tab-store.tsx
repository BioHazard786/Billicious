import { create } from "zustand";
import createSelectors from "./selectors";

type State = {
  files: (File & { preview: string })[];
};

type Action = {
  setFiles: (files: State["files"]) => void;
  reset: () => void;
};

const initialState = {
  files: [],
};

const useGroupImageTabStoreBase = create<State & Action>((set) => ({
  ...initialState,
  setFiles: (files) => set({ files }),
  reset: () => set(initialState),
}));

const useGroupImageTabStore = createSelectors(useGroupImageTabStoreBase);

export default useGroupImageTabStore;
