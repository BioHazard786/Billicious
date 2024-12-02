import {
  fetchBillsCategoryWise,
  fetchBillsYearWise,
} from "@/app/api/(bills)/utils";
import CategoryChart from "@/components/expenses/category-chart";
import Expenses from "@/components/expenses/expenses";
import TimelineChart from "@/components/expenses/timeline-chart";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const Page = async ({ params }: { params: { slug: string } }) => {
  const queryClient = new QueryClient();
  const groupId = params.slug;

  await queryClient.prefetchQuery({
    queryKey: ["categoryChart", groupId],
    queryFn: () => fetchBillsCategoryWise(groupId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["timelineChart", groupId],
    queryFn: () => fetchBillsYearWise(groupId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="grid h-full w-full grid-cols-1 gap-3 overflow-x-hidden p-3 pb-[5.25rem] pt-16 lg:h-dvh lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:pb-3 lg:pl-[4.2rem]">
        <TimelineChart />
        <CategoryChart />
        <Expenses />
      </div>
    </HydrationBoundary>
  );
};

export default Page;
