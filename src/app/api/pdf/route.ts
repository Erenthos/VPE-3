import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    // Fetch vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Segments + Questions
    const segments = await prisma.segment.findMany({
      include: { questions: true },
      orderBy: { name: "asc" }
    });

    // Ratings for this vendor by this user
    const ratings = await prisma.rating.findMany({
      where: {
        vendorId,
        userId: session.user.id
      }
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {});

    // Title
    doc
      .fontSize(22)
      .fillColor("#222")
      .text("Vendor Performance Report", { align: "center" })
      .moveDown(1.5);

    // Vendor Info
    doc
      .fontSize(14)
      .fillColor("black")
      .text(`Vendor Name: ${vendor.name}`)
      .text(`Company: ${vendor.company || "N/A"}`)
      .text(`Email: ${vendor.email || "N/A"}`)
      .moveDown(1);

    // Ratings Section
    doc.fontSize(18).text("Performance Ratings", { underline: true });
    doc.moveDown(1);

    segments.forEach((seg) => {
      doc
        .fontSize(16)
        .fillColor("#222")
        .text(`${seg.name} (Weight: ${seg.weight})`);
      doc.moveDown(0.5);

      seg.questions.forEach((q) => {
        const r = ratings.find((x) => x.questionId === q.id);

        doc
          .fontSize(13)
          .fillColor("black")
          .text(`• ${q.text}`);

        doc.text(`   Rating: ${r?.score ?? 0}/10`);

        if (r?.comment) {
          doc.text(`   Comment: ${r.comment}`);
        } else {
          doc.text(`   Comment: -`);
        }

        doc.moveDown(0.7);
      });

      doc.moveDown(1);
    });

    doc.end();
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Vendor_Report_${vendor.name}.pdf"`
      }
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

