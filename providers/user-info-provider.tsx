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
    storeRef.current.setState({ user });
  }

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      {children}
    </UserStoreContext.Provider>
  );
};
