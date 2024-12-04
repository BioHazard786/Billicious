import {
  fetchBillsCategoryWise,
  fetchBillsYearWise,
} from "@/app/api/(bills)/utils";
import { getGroupBillsFromDB } from "@/app/api/(groups)/utils";
import CategoryChart from "@/components/expenses/category-chart";
import Expenses from "@/components/expenses/expenses";
import TimelineChart from "@/components/expenses/timeline-chart";
import { db } from "@/database/dbConnect";
import { formatTransactionData } from "@/lib/utils";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const fetchBills = async (groupId: string) => {
  const bills = await db.transaction((transaction) =>
    getGroupBillsFromDB(transaction, groupId, 10, 1, undefined, undefined),
  );

  return formatTransactionData(bills);
};

const Page = async ({ params }: { params: { slug: string } }) => {
  const queryClient = new QueryClient();
  const groupId = params.slug;

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["categoryChart", groupId],
      queryFn: () => fetchBillsCategoryWise(groupId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["timelineChart", groupId],
      queryFn: () => fetchBillsYearWise(groupId),
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["expenses", groupId],
      queryFn: () => fetchBills(groupId),
      initialPageParam: 1,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="grid h-full w-full grid-cols-1 gap-3 overflow-x-hidden p-3 pb-[5.563rem] pt-[4.063rem] lg:h-dvh lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:pb-3 lg:pl-[4.313rem]">
        <TimelineChart />
        <CategoryChart />
        <Expenses />
      </div>
    </HydrationBoundary>
  );
};

export default Page;
