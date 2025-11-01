import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: Fetch all properties
export async function GET() {
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
      tenantName: tenants.fullName, // 👈 include tenant full name
    })
    .from(properties)
    .leftJoin(tenants, eq(properties.tenantId, tenants.id));

  return Response.json(results);
}

// POST: Create a new property
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 }
      );
    }

    const [newProperty] = await db
      .insert(properties)
      .values({
        name: body.name,
        address: body.address,
        rentAmount: body.rentAmount ?? body.rent_amount ?? 0, // ✅ fix
        status: body.status,
        tenantId: body.tenantId ?? body.tenant_id ?? null, // ✅ fix
        notes: body.notes ?? "",
      })
      .returning();

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
