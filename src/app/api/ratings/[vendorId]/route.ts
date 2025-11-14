import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: Request,
  { params }: { params: { vendorId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ratings = await prisma.rating.findMany({
      where: {
        vendorId: params.vendorId,
        userId: session.user.id
      }
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("GET ratings error:", error);
    return NextResponse.json(
      { error: "Failed to load ratings" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { vendorId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = params;
  const { questionId, score, comment } = await req.json();

  try {
    const updatedRating = await prisma.rating.upsert({
      where: {
        unique_rating_entry: {
          userId: session.user.id,
          vendorId,
          questionId
        }
      },
      update: {
        score,
        comment
      },
      create: {
        userId: session.user.id,
        vendorId,
        questionId,
        score,
        comment
      }
    });

    return NextResponse.json(updatedRating);
  } catch (error) {
    console.error("POST ratings error:", error);
    return NextResponse.json(
      { error: "Failed to update rating" },
      { status: 500 }
    );
  }
}
