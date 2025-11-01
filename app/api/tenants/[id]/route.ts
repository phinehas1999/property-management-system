import { db } from "@/db";
import { tenants } from "@/db/schema";
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

  await db.delete(tenants).where(eq(tenants.id, Number(id)));
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const [updated] = await db
    .update(tenants)
    .set({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      rent: body.rent,
      status: body.status,
      moveIn: body.moveIn,
      moveOut: body.moveOut,
      notes: body.notes,
    })
    .where(eq(tenants.id, Number(id)))
    .returning();

  return NextResponse.json(updated);
}
