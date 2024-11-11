"use client";

import { User } from "@/lib/types";
import {
  createUserStore,
  UserStore,
  UserStoreContext,
} from "@/store/user-info-store";
import { useRef } from "react";

export const UserInfoStoreProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) => {
  const storeRef = useRef<UserStore>();
  if (!storeRef.current) {
    storeRef.current = createUserStore(user);
  } else {
    const currentState = storeRef.current.getState();
    const actions = Object.entries(currentState)
      .filter(([_, value]) => typeof value === "function")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    storeRef.current.setState({ user, ...actions }, true);
  }

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      {children}
    </UserStoreContext.Provider>
  );
};
