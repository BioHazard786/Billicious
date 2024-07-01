import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="grid h-full w-full grid-cols-1 gap-3 overflow-hidden p-3 md:grid-cols-2 lg:grid-cols-3 lg:pl-[4.2rem]">
      <Skeleton className="h-[160px] w-full rounded-xl" />
      <Skeleton className="h-[160px] w-full rounded-xl" />
      <Skeleton className="h-[400px] w-full rounded-xl md:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-[630px]" />
      <Skeleton className="h-[400px] w-full rounded-xl md:col-span-2 lg:h-[458px]" />
    </div>
  );
};

export default Loading;
