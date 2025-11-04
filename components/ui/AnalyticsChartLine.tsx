"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function ProfitChart() {
  const [chartData, setChartData] = React.useState<any[]>([]);

  const [strokeColor, setStrokeColor] =
    React.useState<string>("hsl(220 90% 50%)");
  const [resolvedBg, setResolvedBg] = React.useState<string>("#ffffff");

  React.useEffect(() => {
    function normalizeCssVarValue(value: string) {
      if (!value) return "";
      const v = value.trim();
      if (v.startsWith("#") || v.startsWith("rgb") || v.startsWith("hsl"))
        return v;
      if (/\d+\s+\d+%?\s+\d+%?/.test(v)) return `hsl(${v})`;
      return v;
    }

    if (typeof document !== "undefined") {
      const styles = getComputedStyle(document.documentElement);
      const rawChart = styles.getPropertyValue("--chart-1") || "";
      const rawBg = styles.getPropertyValue("--background") || "";

      const resolvedChart =
        normalizeCssVarValue(rawChart) || "hsl(220 90% 50%)";
      const resolvedBackground = normalizeCssVarValue(rawBg) || "#ffffff";

      setStrokeColor(resolvedChart);
      setResolvedBg(resolvedBackground);
    }
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/profit");
      const data = await res.json();

      const mockBeforeThisMonth = [
        { month: "2024-07", profit: 2600 },
        { month: "2024-08", profit: 3100 },
        { month: "2024-09", profit: 20900 },
        { month: "2024-10", profit: 3400 },
      ];

      const formatted = data.map((item: any) => ({
        month: item.month,
        profit: Number(item.total),
      }));

      setChartData([...mockBeforeThisMonth, ...formatted]);
    }
    fetchData();
  }, []);

  const totalProfit = chartData.reduce((sum, d) => sum + d.profit, 0);

  const chartConfig = {
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-1))",
    },
  };
  const etb = new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
  });

  return (
    <Card className="rounded-xl border bg-card shadow-sm transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Monthly Profit Tracker
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Total over {chartData.length} months:{" "}
          <span className="font-semibold text-foreground">
            {etb.format(totalProfit)}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 24, left: 8, bottom: 12 }}
            >
              <CartesianGrid
                stroke="hsl(var(--muted))"
                strokeDasharray="3 3"
                opacity={0.35}
              />

              <XAxis
                dataKey="month"
                tickFormatter={(v) => {
                  const [y, m] = v.split("-");
                  return new Date(y, Number(m) - 1).toLocaleDateString(
                    "en-ET",
                    {
                      month: "short",
                    }
                  );
                }}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="rounded-lg border bg-popover shadow-md px-3 py-2"
                    nameKey="profit"
                    labelFormatter={(v) => `Month: ${v}`}
                    formatter={(v) => [`ETB ${v.toLocaleString()}`, " Profit"]}
                  />
                }
              />

              <Line
                type="monotone"
                dataKey="profit"
                stroke={strokeColor}
                strokeWidth={3}
                dot={{
                  r: 4,
                  stroke: strokeColor,
                  strokeWidth: 2,
                  // use the resolved background color so dots contrast with theme
                  fill: resolvedBg,
                }}
                activeDot={{
                  r: 7,
                  stroke: strokeColor,
                  strokeWidth: 2,
                  fill: strokeColor,
                  // glow using the resolved strokeColor
                  style: { filter: `drop-shadow(0 0 6px ${strokeColor})` },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
