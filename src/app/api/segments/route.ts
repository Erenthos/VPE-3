import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// GET → return all segments + questions
export async function GET() {
  try {
    const segments = await prisma.segment.findMany({
      include: {
        questions: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json(segments);
  } catch (error) {
    console.error("Error loading segments:", error);
    return NextResponse.json(
      { error: "Failed to load segments" },
      { status: 500 }
    );
  }
}

// POST → create a new segment
export async function POST(req: Request) {
  try {
    const { name, weight } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Segment name is required" },
        { status: 400 }
      );
    }

    const segment = await prisma.segment.create({
      data: {
        name,
        weight: weight || 1
      }
    });

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Error creating segment:", error);
    return NextResponse.json(
      { error: "Failed to create segment" },
      { status: 500 }
    );
  }
}

// PUT → update a segment (name, weight, add/delete questions)
export async function PUT(req: Request) {
  try {
    const { segmentId, name, weight, addQuestion, deleteQuestionId } =
      await req.json();

    if (!segmentId) {
      return NextResponse.json(
        { error: "segmentId is required" },
        { status: 400 }
      );
    }

    // Update segment fields if provided
    if (name || weight !== undefined) {
      await prisma.segment.update({
        where: { id: segmentId },
        data: {
          name,
          weight
        }
      });
    }

    // Add a new question
    if (addQuestion && addQuestion.trim().length > 0) {
      await prisma.question.create({
        data: {
          text: addQuestion,
          segmentId
        }
      });
    }

    // Delete a question
    if (deleteQuestionId) {
      await prisma.question.delete({
        where: { id: deleteQuestionId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating segment:", error);
    return NextResponse.json(
      { error: "Failed to update segment" },
      { status: 500 }
    );
  }
}

// DELETE → remove segment + its questions
export async function DELETE(req: Request) {
  try {
    const { segmentId } = await req.json();

    if (!segmentId) {
      return NextResponse.json(
        { error: "segmentId is required" },
        { status: 400 }
      );
    }

    // Cascade delete questions
    await prisma.question.deleteMany({
      where: { segmentId }
    });

    // Delete segment
    await prisma.segment.delete({
      where: { id: segmentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting segment:", error);
    return NextResponse.json(
      { error: "Failed to delete segment" },
      { status: 500 }
    );
  }
}

