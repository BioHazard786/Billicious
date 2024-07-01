"use client";

import { TGroupData } from "@/lib/types";
import {
  DashboardStore,
  DashboardStoreContext,
  createDashboardStore,
} from "@/store/dashboard-store";
import { useRef } from "react";

export const DashboardStoreProvider = ({
  children,
  initialGroupData,
}: {
  children: React.ReactNode;
  initialGroupData: TGroupData;
}) => {
  const storeRef = useRef<DashboardStore>();
  if (!storeRef.current) {
    storeRef.current = createDashboardStore(initialGroupData);
  }

  return (
    <DashboardStoreContext.Provider value={storeRef.current}>
      {children}
    </DashboardStoreContext.Provider>
  );
};
