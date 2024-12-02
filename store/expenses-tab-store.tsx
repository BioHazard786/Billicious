import { DateRange } from "react-day-picker";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import createSelectors from "./selectors";

type State = {
  categoryChartDateRange: DateRange | undefined;
  expensesDateRange: DateRange | undefined;
  timelineChartYear: string | undefined;
};

type Action = {
  setCategoryChartDateRange: (
    dateRange: State["categoryChartDateRange"],
  ) => void;
  setExpensesDateRange: (dateRange: State["expensesDateRange"]) => void;
  setTimelineChartYear: (dateRange: State["timelineChartYear"]) => void;
  reset: () => void;
};

const initialState: State = {
  categoryChartDateRange: undefined,
  timelineChartYear: undefined,
  expensesDateRange: undefined,
};

const useExpensesTabStoreBase = createWithEqualityFn<State & Action>(
  (set) => ({
    ...initialState,
    setCategoryChartDateRange: (dateRange) =>
      set({ categoryChartDateRange: dateRange }),
    setExpensesDateRange: (dateRange) => set({ expensesDateRange: dateRange }),
    setTimelineChartYear: (year) => set({ timelineChartYear: year }),
    reset: () => set(initialState),
  }),
  shallow,
);

const useExpensesTabStore = createSelectors(useExpensesTabStoreBase);

export default useExpensesTabStore;
