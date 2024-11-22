import { Spinner } from "@/components/ui/spinner";

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center [@supports(height:100dvh)]:h-dvh">
      <Spinner
        loadingSpanClassName="bg-muted-foreground"
        className="size-6 md:size-7 lg:size-8"
      />
    </div>
  );
};

export default Loading;
