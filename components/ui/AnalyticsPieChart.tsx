"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "Revenue distribution by property";

const chartConfig = {
  property: { label: "Property", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function AnalyticsPieChart() {
  const id = "pie-revenue";
  const [chartData, setChartData] = React.useState<
    { type: string; total: number; fill: string }[]
  >([]);
  const [activeType, setActiveType] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchRevenue() {
      try {
        const res = await fetch("/api/revenue-by-property");
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        // Map data from API (propertyName → type, totalRevenue → total)
        const formatted = (data || []).map((item: any, i: number) => ({
          type: item.propertyName ?? "Unknown",
          // Ensure numeric
          total: Number(item.totalRevenue ?? item.total_revenue ?? 0),
          fill: `var(--chart-${(i % 5) + 1})`,
        }));

        if (!mounted) return;
        setChartData(formatted);
        setActiveType(formatted[0]?.type ?? null);
      } catch (err) {
        console.error("Error fetching revenue data:", err);
      }
    }

    fetchRevenue();
    return () => {
      mounted = false;
    };
  }, []);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((i) => i.type === activeType),
    [activeType, chartData]
  );

  
  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Revenue by Property</CardTitle>
          <CardDescription>Based on payment records</CardDescription>
        </div>
        {chartData.length > 0 && (
          <Select value={activeType || ""} onValueChange={setActiveType}>
            <SelectTrigger
              className="ml-auto h-7 w-[150px] rounded-lg pl-2.5"
              aria-label="Select property"
            >
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {chartData.map((item) => (
                <SelectItem key={item.type} value={item.type}>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.type}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (
                    viewBox &&
                    "cx" in viewBox &&
                    "cy" in viewBox &&
                    chartData.length > 0 &&
                    activeIndex >= 0
                  ) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-xl font-bold"
                        >
                          ETB {chartData[activeIndex]?.total?.toLocaleString() ?? 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Revenue
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
