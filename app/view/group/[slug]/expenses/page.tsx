import CategoryChart from "@/components/expenses/category-chart";
import Expenses from "@/components/expenses/expenses";
import AmountSpentChart from "@/components/expenses/timeline-chart";

const Page = async () => {
  return (
    <div className="grid h-full w-full grid-cols-1 gap-3 overflow-x-hidden p-3 pb-[5.25rem] pt-16 lg:h-dvh lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:pb-3 lg:pl-[4.2rem]">
      <AmountSpentChart />
      <CategoryChart />
      <Expenses />
    </div>
  );
};

export default Page;
