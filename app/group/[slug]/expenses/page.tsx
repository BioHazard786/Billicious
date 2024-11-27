import Expenses from "@/components/expenses/expenses";
import { getUser } from "@/server/actions";
import { fetchTransactions } from "@/server/fetchHelpers";
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
    queryKey: ["expenses", user?.id, params.slug],
    queryFn: () => fetchTransactions(groupId, 1),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Expenses />
    </HydrationBoundary>
  );
};

export default Page;
