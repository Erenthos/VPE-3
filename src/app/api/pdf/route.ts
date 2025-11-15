export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

import VendorReport from "@/pdf/VendorReport";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export async function POST(req: Request) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json(
        { error: "vendorId is required" },
        { status: 400 }
      );
    }

    // Fetch vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Fetch segments + questions
    const segments = await prisma.segment.findMany({
      include: { questions: true },
      orderBy: { name: "asc" }
    });

    // Fetch GLOBAL ratings (no userId)
    const ratings = await prisma.rating.findMany({
      where: { vendorId }
    });

    // Create PDF component (NO JSX)
    const pdfElement = React.createElement(VendorReport, {
      vendor,
      segments,
      ratings
    });

    // Render PDF buffer
    const pdfBuffer = await renderToBuffer(
      pdfElement as unknown as React.ReactElement
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Vendor_Report_${vendor.name}.pdf"`
      }
    });
  } catch (err) {
    console.error("PDF Generation Error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
