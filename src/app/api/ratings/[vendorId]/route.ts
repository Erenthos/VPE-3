import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// GET → load all ratings of current user for this vendor
export async function GET(
  req: Request,
  { params }: { params: { vendorId: string } }
) {
  try {
    const session: any = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ratings = await prisma.rating.findMany({
      where: {
        userId: session.user.id,
        vendorId: params.vendorId
      }
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

// POST → create/update rating (auto-save)
export async function POST(
  req: Request,
  { params }: { params: { vendorId: string } }
) {
  try {
    const session: any = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const vendorId = params.vendorId;
    const { questionId, score, comment } = await req.json();

    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required" },
        { status: 400 }
      );
    }

    // Upsert ensures: 1 rating per user per vendor per question
    const rating = await prisma.rating.upsert({
      where: {
        userId_vendorId_questionId: {
          userId,
          vendorId,
          questionId
        }
      },
      update: {
        score,
        comment
      },
      create: {
        userId,
        vendorId,
        questionId,
        score,
        comment
      }
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}

