// app/api/profit/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get payments grouped by month (last 6 months)
    const result = await db
      .select({
        month: sql`TO_CHAR(${payments.datePaid}, 'YYYY-MM')`.as("month"),
        total: sql<number>`SUM(${payments.amount})`.as("total"),
      })
      .from(payments)
      .groupBy(sql`TO_CHAR(${payments.datePaid}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${payments.datePaid}, 'YYYY-MM')`);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch profit data" },
      { status: 500 }
    );
  }
}
