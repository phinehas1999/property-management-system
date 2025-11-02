// app/api/payments/route.ts
import { db } from "@/db";
import { payments } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, amount, datePaid } = body;

    if (!tenantId || typeof amount === "undefined") {
      return NextResponse.json(
        { error: "tenantId and amount are required" },
        { status: 400 }
      );
    }

    // datePaid: optional ISO 'YYYY-MM-DD' string. If provided we use it,
    // otherwise DB default (defaultNow()) will apply.
    const insert = await db
      .insert(payments)
      .values({
        tenantId,
        amount,
        // If you pass `datePaid: datePaid` the ORM will translate it; if undefined DB default will run.
        ...(datePaid ? { datePaid } : {}),
      })
      .returning();

    return NextResponse.json(insert[0]);
  } catch (err) {
    console.error("POST /api/payments Error:", err);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
