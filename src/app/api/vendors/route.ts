import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// GET → fetch all vendors
export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(vendors);
  } catch (error) {
    console.error("Error loading vendors:", error);
    return NextResponse.json(
      { error: "Failed to load vendors" },
      { status: 500 }
    );
  }
}

// POST → create a vendor
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Vendor name is required" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        company: company || null,
        email: email || null
      }
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}

