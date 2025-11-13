import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// GET → fetch a single vendor
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id }
    });

    if (!vendor)
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Error loading vendor:", error);
    return NextResponse.json(
      { error: "Failed to load vendor" },
      { status: 500 }
    );
  }
}

// PUT → update vendor details
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, company, email } = body;

    const updated = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        name,
        company,
        email
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

// DELETE → delete vendor
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vendor.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}

