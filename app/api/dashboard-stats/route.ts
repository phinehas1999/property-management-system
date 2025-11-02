import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, properties, payments } from "@/db/schema";
import { sql, and, gte, lte, eq } from "drizzle-orm";

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

  // 2️⃣ Occupied properties ONLY (status = 'occupied')
  const occupiedPropertiesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(properties)
    .where(eq(properties.status, "occupied"));

  // 3️⃣ Total number of properties (any status)
  const totalPropertiesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(properties);

  // 4️⃣ Total number of tenants (any status)
  const totalTenantsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tenants);

  // 5️⃣ New tenants who moved in this month
  const newTenantsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tenants)
    .where(and(gte(tenants.moveIn, start), lte(tenants.moveIn, end)));

  // 6️⃣ Pending payments — tenants with no payment in the month
  const pendingPaymentsResult = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM ${tenants}
    WHERE id NOT IN (
      SELECT ${payments.tenantId}
      FROM ${payments}
      WHERE ${payments.datePaid} BETWEEN ${start} AND ${end}
    );
  `);

  // ✅ Safely extract values
  const totalRent = Number(totalRentResult[0]?.sum ?? 0);
  const occupiedProperties = Number(occupiedPropertiesResult[0]?.count ?? 0);
  const totalProperties = Number(totalPropertiesResult[0]?.count ?? 0);
  const totalTenants = Number(totalTenantsResult[0]?.count ?? 0);
  const newTenants = Number(newTenantsResult[0]?.count ?? 0);
  const pendingPayments = Number(pendingPaymentsResult.rows[0]?.count ?? 0);

  // ✅ Return all as JSON
  return NextResponse.json({
    totalRent,
    totalProperties,
    occupiedProperties,
    totalTenants,
    newTenants,
    pendingPayments,
  });
}
