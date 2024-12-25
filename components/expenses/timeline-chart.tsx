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

import { fetchBillTimeline } from "@/server/fetchHelpers";
import useExpensesTabStore from "@/store/expenses-tab-store";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Area, AreaChart, XAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "../ui/button";
import NoContent from "../ui/no-content";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const chartData = [
  { month: "January", amount: 0 },
  { month: "February", amount: 0 },
  { month: "March", amount: 0 },
  { month: "April", amount: 0 },
  { month: "May", amount: 0 },
  { month: "June", amount: 0 },
  { month: "July", amount: 0 },
  { month: "August", amount: 0 },
  { month: "September", amount: 0 },
  { month: "October", amount: 0 },
  { month: "November", amount: 0 },
  { month: "December", amount: 0 },
];

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type billTimelineDataType = {
  month: string;
  amount: number;
};

const TimelineChart = () => {
  const { slug: groupId } = useParams();
  const selectedYear = useExpensesTabStore.use.timelineChartYear();
  const setSelectedYear = useExpensesTabStore.use.setTimelineChartYear();

  const { data, isLoading, refetch, isRefetching } = useQuery<
    billTimelineDataType[]
  >({
    queryKey: ["timelineChart", groupId as string],
    queryFn: () =>
      fetchBillTimeline({
        groupId: groupId as string,
        from: selectedYear ? new Date(Number(selectedYear), 0, 1) : undefined,
        to: selectedYear ? new Date(Number(selectedYear), 11, 31) : undefined,
      }),
    select: (originalData) =>
      chartData.map((chData) => {
        const originalDataEntry = originalData.find(
          (ogData) => ogData.month === chData.month,
        );
        return {
          month: chData.month,
          amount: Number(originalDataEntry?.amount) || 0,
        };
      }),
  });

  const handleFiltering = async () => {
    if (!selectedYear) return toast.error("Select a year to filter");
    await refetch();
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear;

    return Array.from({ length: endYear - startYear + 1 }, (_, i) =>
      String(startYear + i),
    ).reverse();
  }, []);

  return (
    <Card className="order-1">
      <CardHeader>
        <CardTitle>Monthly Expense Timeline</CardTitle>
        <CardDescription>Track monthly expenses for the year</CardDescription>
        <div className="flex gap-2">
          <Select
            onValueChange={setSelectedYear}
            value={selectedYear}
            disabled={isRefetching}
          >
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Pick a year to filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Year</SelectLabel>
                {years.map((year, index) => (
                  <SelectItem value={year} key={`select-year-${index}`}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex-none shadow-none"
                variant="outline"
                size="icon"
                onClick={handleFiltering}
                disabled={isRefetching}
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
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              {/* <CartesianGrid vertical={false} /> */}
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-amount)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-amount)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="amount"
                type="natural"
                fill="url(#fillAmount)"
                fillOpacity={0.4}
                stroke="var(--color-amount)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineChart;
