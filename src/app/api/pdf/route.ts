export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

import VendorReport from "@/pdf/VendorReport";
import { renderToBuffer } from "@react-pdf/renderer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    // Fetch vendor
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Fetch segments & questions
    const segments = await prisma.segment.findMany({
      include: { questions: true },
      orderBy: { name: "asc" }
    });

    // Fetch user ratings
    const ratings = await prisma.rating.findMany({
      where: { vendorId, userId: session.user.id }
    });

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <VendorReport vendor={vendor} segments={segments} ratings={ratings} />
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Report_${vendor.name}.pdf"`
      }
    });

  } catch (error) {
    console.error("PDF Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
