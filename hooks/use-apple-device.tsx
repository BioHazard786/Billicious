import { AppleDeviceContext } from "@/providers/apple-device-provider";
import { useContext } from "react";

export const useAppleDevice = () => {
  const context = useContext(AppleDeviceContext);
  if (context === undefined) {
    throw new Error(
      "useAppleDeviceContext must be used within a AppleDeviceProvider",
    );
  }
  return context;
};
