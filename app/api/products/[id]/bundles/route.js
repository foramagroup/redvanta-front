import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { bundleId } = await req.json();

  await prisma.bundleProduct.create({
    data: {
      bundleId,
      productId: params.id
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { bundleId } = await req.json();

  await prisma.bundleProduct.delete({
    where: {
      bundleId_productId: {
        bundleId,
        productId: params.id
      }
    }
  });

  return NextResponse.json({ ok: true });
}
