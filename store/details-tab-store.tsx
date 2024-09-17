import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  billName: string;
  createdAt?: Date;
  notes: string;
};

type Action = {
  setBillName: (billName: string) => void;
  setCreatedAt: (creation_date?: Date) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
};

const useDetailsTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    billName: "",
    createdAt: new Date(),
    notes: "",
    setBillName: (billName) => set({ billName: billName }),
    setCreatedAt: (creation_date) => set({ createdAt: creation_date }),
    setNotes: (notes) => set({ notes: notes }),
    reset: () => set({ billName: "", createdAt: new Date(), notes: "" }),
  }),
  shallow,
);

const useDetailsTabStore = createSelectors(useDetailsTabStoreBase);

export default useDetailsTabStore;
