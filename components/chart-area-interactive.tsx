"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  paid: { label: "Tenants Paid", color: "var(--primary)" },
  pending: { label: "Pending Payments", color: "var(--destructive)" },
};

export function ChartAreaPayments() {
  const [chartData, setChartData] = React.useState<any[]>([
    // Mock data for previous days
    { date: "2025-11-01", paid: 12, pending: 3 },
    { date: "2025-11-02", paid: 14, pending: 1 },
  ]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard-stats");
        const data = await res.json();

        const today = new Date();
        const todayEntry = {
          date: today.toISOString().split("T")[0],
          paid: (data.totalTenants ?? 0) - (data.pendingPayments ?? 0),
          pending: data.pendingPayments ?? 0,
        };

        setChartData((prev) => {
          // Remove any existing entry for today
          const filtered = prev.filter(
            (entry) => entry.date !== today.toISOString().split("T")[0]
          );
          return [...filtered, todayEntry];
        });
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Payments</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tenant Payments Overview</CardTitle>
        <CardDescription>
          See how many tenants have paid versus pending this month
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillPaid" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--destructive)"
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor="var(--destructive)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(val) =>
                new Date(val).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Area
              dataKey="paid"
              type="natural"
              fill="url(#fillPaid)"
              stroke="var(--primary)"
              stackId="a"
            />
            <Area
              dataKey="pending"
              type="natural"
              fill="url(#fillPending)"
              stroke="var(--destructive)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
