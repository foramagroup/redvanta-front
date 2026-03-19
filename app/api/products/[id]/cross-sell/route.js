import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { targetId } = await req.json();

  await prisma.productCrossSell.create({
    data: {
      productId: params.id,
      crossSellId: targetId
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { targetId } = await req.json();

  await prisma.productCrossSell.delete({
    where: {
      productId_crossSellId: {
        productId: params.id,
        crossSellId: targetId
      }
    }
  });

  return NextResponse.json({ ok: true });
}
