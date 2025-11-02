import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, properties, payments } from "@/db/schema";
import { sql, and, gte, lte, inArray } from "drizzle-orm";

// Utility to get the first and last day of the current month
function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const format = (d: Date) => d.toISOString().split("T")[0];
  return { start: format(start), end: format(end) };
}

export async function GET() {
  const { start, end } = getMonthRange();

  // 1️⃣ Total rent collected this month
  const totalRentResult = await db
    .select({ sum: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(and(gte(payments.datePaid, start), lte(payments.datePaid, end)));

  // 2️⃣ Active properties (available or occupied)
  const activePropertiesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(properties)
    .where(inArray(properties.status, ["available", "occupied"]));

  // 3️⃣ New tenants who moved in this month
  const newTenantsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tenants)
    .where(and(gte(tenants.moveIn, start), lte(tenants.moveIn, end)));

  // 4️⃣ Pending payments — tenants with no payment in the month
  const pendingPaymentsResult = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM ${tenants}
    WHERE id NOT IN (
      SELECT ${payments.tenantId}
      FROM ${payments}
      WHERE ${payments.datePaid} BETWEEN ${start} AND ${end}
    );
  `);

  // ✅ Ensure numbers are extracted safely
  const totalRent = Number(totalRentResult[0]?.sum ?? 0);
  const activeProperties = Number(activePropertiesResult[0]?.count ?? 0);
  const newTenants = Number(newTenantsResult[0]?.count ?? 0);
  const pendingPayments = Number(pendingPaymentsResult.rows[0]?.count ?? 0);

  // ✅ Return all data as JSON
  return NextResponse.json({
    totalRent,
    activeProperties,
    newTenants,
    pendingPayments,
  });
}
