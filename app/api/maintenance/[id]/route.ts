import { db } from "@/db";
import { maintenance } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { status } = await req.json();
  const { id } = await context.params; // ✅ await the params

  await db
    .update(maintenance)
    .set({ status })
    .where(eq(maintenance.id, Number(id)));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ await the params
  await db.delete(maintenance).where(eq(maintenance.id, Number(id)));

  return NextResponse.json({ success: true });
}
