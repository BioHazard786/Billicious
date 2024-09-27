// "use client";

// import LoadingAnimationDark from "@/public/LoadingAnimDark.json";
// import LoadingAnimationLight from "@/public/LoadingAnimLight.json";
// import Lottie from "lottie-react";
import { Loader } from "lucide-react";
// import { useTheme } from "next-themes";
// import { useMemo } from "react";

const Loading = () => {
  // const { resolvedTheme } = useTheme();

  // const animationData = useMemo(
  //   () =>
  //     resolvedTheme === "light" ? LoadingAnimationLight : LoadingAnimationDark,
  //   [resolvedTheme],
  // );

  return (
    <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
      {/* <Lottie animationData={animationData} loop={true} className="size-16" /> */}
      <Loader className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default Loading;
