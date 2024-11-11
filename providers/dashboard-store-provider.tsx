"use client";

import { TGroupData } from "@/lib/types";
import {
  DashboardStore,
  DashboardStoreContext,
  createDashboardStore,
} from "@/store/dashboard-store";
import useSplitEquallyTabStore from "@/store/split-equally-tab-store";
import { useRef } from "react";

export const DashboardStoreProvider = ({
  children,
  initialGroupData,
}: {
  children: React.ReactNode;
  initialGroupData: TGroupData;
}) => {
  const setInitialDraweeState = useSplitEquallyTabStore.getState().reset;
  const storeRef = useRef<DashboardStore>();
  if (!storeRef.current) {
    storeRef.current = createDashboardStore(initialGroupData);
    setInitialDraweeState(initialGroupData.members);
  }
  // else {
  //   storeRef.current.setState(initialGroupData, true);
  // }

  return (
    <DashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </DashboardStoreContext.Provider>
  );
};
