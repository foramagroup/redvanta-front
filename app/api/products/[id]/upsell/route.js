import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const id = params.id;

  const others = await prisma.product.findMany({
    where: { id: { not: id }, visible: true },
    take: 3
  });

  await prisma.productUpsell.deleteMany({
    where: { productId: id }
  });

  for (const p of others) {
    await prisma.productUpsell.create({
      data: {
        productId: id,
        upsellId: p.id
      }
    });
  }

  return NextResponse.json({ upsell: others });
}
