import { Spinner } from "@/components/ui/spinner";

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner
        loadingSpanClassName="bg-muted-foreground"
        className="size-6 md:size-6 lg:size-7"
      />
    </div>
  );
};

export default Loading;
