import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(vendors);
}

export async function POST(req: Request) {
  const { name, company, email } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const vendor = await prisma.vendor.create({
    data: { name, company, email }
  });

  return NextResponse.json(vendor, { status: 201 });
}

export async function DELETE(req: Request) {
  const { vendorId } = await req.json();

  await prisma.vendor.delete({ where: { id: vendorId } });

  return NextResponse.json({ success: true });
}
