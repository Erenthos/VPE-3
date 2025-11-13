import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// GET → return all ratings (debug/admin)
export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({
      orderBy: { updatedAt: "desc" }
    });
    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Error loading ratings:", error);
    return NextResponse.json(
      { error: "Failed to load ratings" },
      { status: 500 }
    );
  }
}

// DELETE → remove all ratings (optional: future admin)
export async function DELETE() {
  try {
    await prisma.rating.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete ratings:", error);
    return NextResponse.json(
      { error: "Failed to delete all ratings" },
      { status: 500 }
    );
  }
}

