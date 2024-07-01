import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type State = {
  billName: string;
  creationDate?: Date;
  notes: string;
};

type Action = {
  setBillName: (billName: string) => void;
  setCreationDate: (creation_date?: Date) => void;
  setNotes: (notes: string) => void;
};

const useDetailstabStore = createWithEqualityFn<State & Action>(
  (set) => ({
    billName: "",
    creationDate: new Date(),
    notes: "",
    setBillName: (billName) => set({ billName: billName }),
    setCreationDate: (creation_date) => set({ creationDate: creation_date }),
    setNotes: (notes) => set({ notes: notes }),
  }),
  shallow,
);

export default useDetailstabStore;
