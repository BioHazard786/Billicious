"use client";

import { userGroup } from "@/lib/types";
import {
  createUserGroupsDataStore,
  UserGroupsDataStore,
  UserGroupsDataStoreContext,
} from "@/store/user-groups-data-store";
import { useRef } from "react";

export const UserGroupsDataStoreProvider = ({
  children,
  userGroups,
}: {
  children: React.ReactNode;
  userGroups: userGroup[];
}) => {
  const storeRef = useRef<UserGroupsDataStore>();
  if (!storeRef.current) {
    storeRef.current = createUserGroupsDataStore(userGroups);
  }

  return (
    <UserGroupsDataStoreContext.Provider value={storeRef.current}>
      {children}
    </UserGroupsDataStoreContext.Provider>
  );
};
