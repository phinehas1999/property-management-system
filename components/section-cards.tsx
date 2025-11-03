"use client";

import { useEffect, useState } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";

type Stats = {
  totalRent: number;
  occupiedProperties: number; // changed name here
  newTenants: number;
  pendingPayments: number;
  totalProperties: number;
  totalTenants: number;
};

export function SectionCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard-stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats)
    return (
      <div className="px-4 lg:px-6 flex-row">
        <LoaderCircle size={28} className="animate-spin inline-block" />
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Rent Collected */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Rent Collected This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalRent.toLocaleString()} Birr
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="size-4" /> +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Rent payments improved this month{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Compared to last month’s collections
          </div>
        </CardFooter>
      </Card>

      {/* Occupied Properties */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Occupied Properties</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.occupiedProperties}/{stats.totalProperties}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="size-4" /> +2
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New tenants added this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total properties currently occupied
          </div>
        </CardFooter>
      </Card>

      {/* Total Tenants */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Tenants</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTenants}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="size-4" /> +{stats.newTenants}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Leasing activity is increasing <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            More move-ins compared to last month
          </div>
        </CardFooter>
      </Card>

      {/* Pending Payments */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Payments</CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendingPayments}/{stats.totalTenants}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown className="size-4" /> -10%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Fewer overdue tenants <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Payment reminders sent this week
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
