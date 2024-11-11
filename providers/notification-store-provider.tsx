"use client";

import { Notifications } from "@/lib/types";
import {
  createNotificationStore,
  NotificationStore,
  NotificationStoreContext,
} from "@/store/notification-store";
import { useRef } from "react";

export const NotificationStoreProvider = ({
  children,
  notifications,
}: {
  children: React.ReactNode;
  notifications: Notifications;
}) => {
  const storeRef = useRef<NotificationStore>();
  if (!storeRef.current) {
    storeRef.current = createNotificationStore(notifications);
  }

  return (
    <NotificationStoreContext.Provider value={storeRef.current}>
      {children}
    </NotificationStoreContext.Provider>
  );
};
