// app/api/revenue-by-property/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments, tenants, properties } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Sum payments grouped by property name.
    // Alias the aggregate as `totalRevenue` (camelCase) so frontend mapping is simple.
    const result = await db
      .select({
        propertyName: properties.name,
        totalRevenue: sql<number>`SUM(${payments.amount})`.as("totalRevenue"),
      })
      .from(payments)
      .leftJoin(tenants, eq(payments.tenantId, tenants.id))
      .leftJoin(properties, eq(tenants.id, properties.tenantId))
      .groupBy(properties.name);

    // Convert any numeric strings to numbers and ensure JSON-safe output
    const normalized = result.map((r: any) => ({
      propertyName: r.propertyName ?? "Unknown",
      // payments.amount is numeric; Drizzle/Postgres may return string/Decimal — coerce to number
      totalRevenue: Number((r as any).totalRevenue ?? 0),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("revenue-by-property error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}
