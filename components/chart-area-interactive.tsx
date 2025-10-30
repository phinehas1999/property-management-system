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

// Example property management data
const chartData = [
  { date: "2025-10-20", active: 40, vacant: 10 },
  { date: "2025-10-21", active: 47, vacant: 3 },
  { date: "2025-10-22", active: 44, vacant: 6 },
  { date: "2025-10-23", active: 30, vacant: 20 },
  { date: "2025-10-24", active: 48, vacant: 2 },
  { date: "2025-10-25", active: 8, vacant: 42 },
];

const chartConfig = {
  active: { label: "Active Tenants", color: "var(--primary)" },
  vacant: { label: "Vacant Units", color: "var(--destructive)" },
};

export function ChartAreaProperties() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Occupancy Overview</CardTitle>
        <CardDescription>Active vs Vacant Units</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
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
              <linearGradient id="fillVacant" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="active"
              type="natural"
              fill="url(#fillActive)"
              stroke="var(--primary)"
              stackId="a"
            />
            <Area
              dataKey="vacant"
              type="natural"
              fill="url(#fillVacant)"
              stroke="var(--destructive)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
