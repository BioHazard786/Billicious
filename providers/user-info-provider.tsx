"use client";

import { User } from "@/lib/types";
import useUserInfoStore from "@/store/user-info-store";
import { ReactNode } from "react";

export default function UserInfoStoreProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  useUserInfoStore.setState({
    user,
  });
  return children;
}
