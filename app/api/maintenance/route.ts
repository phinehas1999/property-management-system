import { db } from "@/db";
import { maintenance } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const tasks = await db.select().from(maintenance);
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const data = await req.json();
  const [newTask] = await db.insert(maintenance).values(data).returning();
  return NextResponse.json(newTask);
}
