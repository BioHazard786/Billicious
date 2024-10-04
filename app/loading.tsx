import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
      <Loader className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default Loading;
