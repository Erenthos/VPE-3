import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// GET — Fetch all ratings for this vendor (GLOBAL)
export async function GET(
  req: Request,
  { params }: { params: { vendorId: string } }
) {
  const { vendorId } = params;

  const ratings = await prisma.rating.findMany({
    where: { vendorId }
  });

  return NextResponse.json(ratings);
}

// POST — Update a rating for this vendor (GLOBAL)
export async function POST(
  req: Request,
  { params }: { params: { vendorId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = params;
  const { questionId, score, comment } = await req.json();

  if (!questionId) {
    return NextResponse.json({ error: "questionId required" }, { status: 400 });
  }

  const updated = await prisma.rating.upsert({
    where: {
      vendorId_questionId: {
        vendorId,
        questionId
      }
    },
    update: {
      score,
      comment
    },
    create: {
      vendorId,
      questionId,
      score,
      comment
    }
  });

  return NextResponse.json(updated);
}
