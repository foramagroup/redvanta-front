import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";

export async function GET(req, { params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      designs: { include: { design: true } },
      crossSell: { include: { crossSelling: true } },
      crossSoldBy: true,
      bundles: { include: { bundle: true } },
      upsellLinks: { include: { upsell: true } }
    }
  });

  return NextResponse.json(product);
}

export async function PUT(req, { params }) {
  try {
    const form = await req.formData();
    const body = JSON.parse(form.get("data"));
    const imageFile = form.get("image");

    let image = undefined;
    if (imageFile && typeof imageFile !== "string") {
      image = await uploadFile(imageFile, "products");
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.title,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        category: body.category,
        ...(image ? { image } : {})
      }
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
