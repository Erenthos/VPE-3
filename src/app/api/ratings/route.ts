import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ratings = await prisma.rating.findMany();
  return NextResponse.json(ratings);
}
