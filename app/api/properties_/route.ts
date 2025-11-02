import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties, tenants, payments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// GET: Fetch all properties
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month");

  // Default to current month if not provided
  const targetDate = monthParam ? `${monthParam}-01` : "CURRENT_DATE";

  const results = await db
    .select({
      id: properties.id,
      name: properties.name,
      address: properties.address,
      rentAmount: properties.rentAmount,
      status: properties.status,
      notes: properties.notes,
      tenantId: properties.tenantId,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
      tenantName: tenants.fullName,
      paymentStatus: sql`
        CASE WHEN EXISTS (
          SELECT 1 FROM ${payments}
          WHERE ${payments.tenantId} = ${properties.tenantId}
          AND date_trunc('month', ${payments.datePaid}) = date_trunc('month', to_date(${targetDate}, 'YYYY-MM-DD'))
        )
        THEN 'paid' ELSE 'unpaid' END
      `.as("payment_status"),
    })
    .from(properties)
    .leftJoin(tenants, eq(properties.tenantId, tenants.id));

  return NextResponse.json(results);
}

// POST: Create a new property and return with tenant + payment status
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");
    const targetDate = monthParam ? `${monthParam}-01` : "CURRENT_DATE";

    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Insert property
    const [inserted] = await db
      .insert(properties)
      .values({
        name: body.name,
        address: body.address,
        rentAmount: body.rentAmount ?? body.rent_amount ?? 0,
        status: body.status ?? "available",
        tenantId: body.tenantId ?? body.tenant_id ?? null,
        notes: body.notes ?? "",
      })
      .returning();

    // 2️⃣ Query the full row with tenant + computed payment status
    const [newProperty] = await db
      .select({
        id: properties.id,
        name: properties.name,
        address: properties.address,
        rentAmount: properties.rentAmount,
        status: properties.status,
        notes: properties.notes,
        tenantId: properties.tenantId,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
        tenantName: tenants.fullName,
        paymentStatus: sql`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${payments}
            WHERE ${payments.tenantId} = ${properties.tenantId}
            AND date_trunc('month', ${payments.datePaid}) = date_trunc('month', to_date(${targetDate}, 'YYYY-MM-DD'))
          )
          THEN 'paid' ELSE 'unpaid' END
        `.as("payment_status"),
      })
      .from(properties)
      .leftJoin(tenants, eq(properties.tenantId, tenants.id))
      .where(eq(properties.id, inserted.id));

    return NextResponse.json(newProperty);
  } catch (error) {
    console.error("POST /api/properties Error:", error);
    return NextResponse.json(
      { error: "Failed to add property" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a property by ID
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    await db.delete(properties).where(eq(properties.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/properties Error:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
