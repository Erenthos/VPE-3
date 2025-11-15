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
    // must be logged in to request PDF
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    // Fetch vendor and include lastEvaluatedBy relation
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { lastEvaluatedBy: true } // will be null if never evaluated
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // segments + questions
    const segments = await prisma.segment.findMany({
      include: { questions: true },
      orderBy: { name: "asc" }
    });

    // global ratings for vendor
    const ratings = await prisma.rating.findMany({ where: { vendorId } });

    // Determine evaluator info from vendor.lastEvaluatedBy and lastEvaluatedAt
    const evaluatorName = vendor.lastEvaluatedBy?.name || vendor.lastEvaluatedBy?.email || "Unknown";
    const evaluatedAt = vendor.lastEvaluatedAt ?? null;

    // Create PDF element and pass evaluatorName & evaluatedAt
    const pdfElement = React.createElement(VendorReport, {
      vendor,
      segments,
      ratings,
      evaluatorName,
      evaluatedAt
    });

    const pdfBuffer = await renderToBuffer(pdfElement as unknown as React.ReactElement);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Vendor_Report_${vendor.name}.pdf"`
      }
    });

  } catch (err) {
    console.error("PDF Generation Error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
