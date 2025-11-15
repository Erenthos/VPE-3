import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { vendorId, ratings } = body as {
    vendorId?: string;
    ratings?: Array<{ questionId: string; score: number; comment?: string }>;
  };

  if (!vendorId || !Array.isArray(ratings)) {
    return NextResponse.json({ error: "vendorId and ratings required" }, { status: 400 });
  }

  // Build upsert operations per rating
  const ops = ratings.map((r) =>
    prisma.rating.upsert({
      where: {
        vendorId_questionId: {
          vendorId,
          questionId: r.questionId
        }
      },
      update: {
        score: r.score,
        comment: r.comment ?? ""
      },
      create: {
        vendorId,
        questionId: r.questionId,
        score: r.score,
        comment: r.comment ?? ""
      }
    })
  );

  // Use transaction: run all upserts, then update vendor
  const results = await prisma.$transaction([
    ...ops,
    prisma.vendor.update({
      where: { id: vendorId },
      data: {
        lastEvaluatedById: session.user.id,
        lastEvaluatedAt: new Date()
      }
    })
  ]);

  return NextResponse.json({ success: true, details: results });
}
