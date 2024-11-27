import SettleUp from "@/components/settleUp/settle-up";
import { getUser } from "@/server/actions";
import { fetchAllBalances } from "@/server/fetchHelpers";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const Page = async ({ params }: { params: { slug: string } }) => {
  const queryClient = new QueryClient();
  const user = await getUser();
  const groupId = params.slug;

  await queryClient.prefetchQuery({
    queryKey: ["settleUp", user?.id, groupId],
    queryFn: () => fetchAllBalances(groupId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettleUp />
    </HydrationBoundary>
  );
};

export default Page;
