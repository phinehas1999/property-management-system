import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "Invalid or missing ID" },
      { status: 400 }
    );
  }

  await db.delete(properties).where(eq(properties.id, Number(id)));
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const [updated] = await db
    .update(properties)
    .set({
      name: body.name,
      address: body.address,
      rentAmount: body.rentAmount,
      status: body.status,
      tenantId: body.tenantId ?? body.tenant_id ?? null, // ✅ correct
      notes: body.notes,
    })
    .where(eq(properties.id, Number(id)))
    .returning();

  return NextResponse.json(updated);
}
