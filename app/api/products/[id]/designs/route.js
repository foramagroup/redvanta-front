import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { designId } = await req.json();

  await prisma.productDesign.create({
    data: {
      productId: params.id,
      designId
    }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const { designId } = await req.json();

  await prisma.productDesign.delete({
    where: {
      productId_designId: {
        productId: params.id,
        designId
      }
    }
  });

  return NextResponse.json({ success: true });
}
