"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fetchBillCategories } from "@/server/fetchHelpers";
import useExpensesTabStore from "@/store/expenses-tab-store";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useParams } from "next/navigation";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { DateRangePicker } from "../ui/date-range-picker";
import NoContent from "../ui/no-content";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

let chartData = [
  { category: "Default", amount: 0 },
  { category: "Transport", amount: 0 },
  { category: "Lodging", amount: 0 },
  { category: "Shopping", amount: 0 },
  { category: "Entertain", amount: 0 },
  { category: "Food", amount: 0 },
  { category: "Drinks", amount: 0 },
  { category: "Snacks", amount: 0 },
  { category: "Tickets", amount: 0 },
  { category: "Others", amount: 0 },
];

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type billCategoriesDataType = {
  category: string;
  amount: number;
};

const CategoryChart = () => {
  const { slug: groupId } = useParams();

  const categoryDateRange = useExpensesTabStore.use.categoryChartDateRange();
  const setCategoryDateRange =
    useExpensesTabStore.use.setCategoryChartDateRange();

  const { data, isLoading, isRefetching, refetch } = useQuery<
    billCategoriesDataType[]
  >({
    queryKey: ["categoryChart", groupId as string],
    queryFn: () =>
      fetchBillCategories({
        groupId: groupId as string,
        from: categoryDateRange?.from,
        to: categoryDateRange?.to,
      }),
    select: (originalData) =>
      chartData.map((chData) => {
        const originalDataEntry = originalData.find(
          (ogData) => ogData.category === chData.category,
        );
        return {
          category: chData.category,
          amount: Number(originalDataEntry?.amount) || 0,
        };
      }),
  });

  const handleFiltering = async () => {
    if (!categoryDateRange) return toast.error("Select a date range to filter");
    if (!categoryDateRange?.to) categoryDateRange.to = new Date();
    await refetch();
  };

  return (
    <Card className="order-2 lg:order-3">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>See your group's expenses by category</CardDescription>
        <div className="flex gap-2">
          <DateRangePicker
            className="flex-1 md:flex-initial"
            disabled={isRefetching}
            date={categoryDateRange}
            setDate={setCategoryDateRange}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFiltering}
                disabled={isRefetching}
                className="shadow-none"
              >
                {isRefetching ? (
                  <Spinner
                    className="size-4"
                    loadingSpanClassName="bg-muted-foreground"
                  />
                ) : (
                  <Filter className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Filter
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex w-full items-center justify-center">
            <Spinner
              loadingSpanClassName="bg-muted-foreground"
              className="size-6 md:size-6 lg:size-7"
            />
          </div>
        )}
        {data?.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <NoContent className="size-32 md:size-48" />
            <div className="text-sm text-muted-foreground md:text-base">
              No data here. Click + to add transactions
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-square h-full w-full lg:h-[400px]"
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              {/* <CartesianGrid vertical={false} /> */}
              <XAxis type="number" dataKey="amount" hide />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
                // tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                layout="vertical"
                dataKey="amount"
                opacity={0.3}
                fill="var(--color-amount)"
                radius={7}
              >
                <LabelList
                  dataKey="category"
                  position="insideLeft"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
