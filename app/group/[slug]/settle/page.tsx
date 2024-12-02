import { getAllBalancesFromDB } from "@/app/api/(transactions)/utils";
import SettleUp from "@/components/settleUp/settle-up";
import { db } from "@/database/dbConnect";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const fetchAllBalances = async (groupId: string) => {
  return await db.transaction((transaction) =>
    getAllBalancesFromDB(transaction, groupId),
  );
};

const Page = async ({ params }: { params: { slug: string } }) => {
  const queryClient = new QueryClient();
  const groupId = params.slug;

  await queryClient.prefetchQuery({
    queryKey: ["settleUp", groupId],
    queryFn: () => fetchAllBalances(groupId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettleUp />
    </HydrationBoundary>
  );
};

export default Page;
