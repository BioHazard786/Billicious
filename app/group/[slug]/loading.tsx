// import { Skeleton } from "@/components/ui/skeleton";

// const Loading = () => {
//   return (
//     <div className="grid h-dvh w-full grid-cols-1 gap-3 overflow-hidden p-3 pt-[4.2rem] md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:pl-[4.2rem]">
//       <Skeleton className="h-[160px] w-full rounded-xl" />
//       <Skeleton className="h-[160px] w-full rounded-xl" />
//       <Skeleton className="h-[400px] w-full rounded-xl md:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-full" />
//       <Skeleton className="h-[400px] w-full rounded-xl md:col-span-2 lg:h-full" />
//     </div>
//   );
// };

// export default Loading;

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
