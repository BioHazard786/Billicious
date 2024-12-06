import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  description: string;
  createdAt: Date;
  notes: string;
};

type Action = {
  setDescription: (description: string) => void;
  setCreatedAt: (createdAt: Date) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
};

const initialState: State = {
  description: "",
  createdAt: new Date(),
  notes: "",
};

const usePaymentDetailsTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    ...initialState,
    setDescription: (description) => set({ description: description }),
    setCreatedAt: (createdAt) => set({ createdAt: createdAt }),
    setNotes: (notes) => set({ notes: notes }),
    reset: () => set(initialState),
  }),
  shallow,
);

const usePaymentDetailsTabStore = createSelectors(
  usePaymentDetailsTabStoreBase,
);

export default usePaymentDetailsTabStore;
