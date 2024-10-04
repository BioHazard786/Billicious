"use client";
import { createContext, ReactNode } from "react";

// Create a context with a default value of 'false'
export const AppleDeviceContext = createContext<{
  isAppleDevice: boolean;
}>({
  isAppleDevice: false,
});

// Create a provider component
export const AppleDeviceProvider = ({
  isAppleDevice,
  children,
}: {
  isAppleDevice: boolean;
  children: ReactNode;
}) => {
  return (
    <AppleDeviceContext.Provider value={{ isAppleDevice }}>
      {children}
    </AppleDeviceContext.Provider>
  );
};
