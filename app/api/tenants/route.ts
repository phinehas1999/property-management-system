import { db } from "@/db";
import { tenants } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const all = await db.select().from(tenants);
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/tenants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [newTenant] = await db
      .insert(tenants)
      .values({
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        rent: body.rent,
        status: body.status,
        moveIn: body.moveIn,
        moveOut: body.moveOut,
        notes: body.notes,
      })
      .returning();

    return NextResponse.json(newTenant);
  } catch (error) {
    console.error("POST /api/tenants error:", error);
    return NextResponse.json(
      { error: "Failed to add tenant" },
      { status: 500 }
    );
  }
}
