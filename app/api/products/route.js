import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function forward(req, path) {
  const url = `${API_BASE}${path}`;
  const init = {
    method: req.method,
    headers: {}
  };

  // forward headers (except host) and cookies if needed
  for (const [k,v] of req.headers) {
    if (k.toLowerCase() === "host") continue;
    init.headers[k] = v;
  }

  // body
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const res = await fetch(url, init);
  const text = await res.text();
  const headers = {};
  res.headers.forEach((v,k) => headers[k] = v);
  return new NextResponse(text, { status: res.status, headers });
}

export async function GET(request) {
  const { search } = new URL(request.url);
  return forward(request, `/api/products${search}`);
}

export async function POST(request) {
  // support both /api/products and /api/products/bundle or others
  const url = new URL(request.url);
  const rel = url.pathname.replace("/api/products", "") || "";
  return forward(request, `/api/products${rel}`);
}

export async function PUT(request) {
  const url = new URL(request.url);
  const rel = url.pathname.replace("/api/products", "") || "";
  return forward(request, `/api/products${rel}`);
}

export async function DELETE(request) {
  const url = new URL(request.url);
  const rel = url.pathname.replace("/api/products", "") || "";
  return forward(request, `/api/products${rel}`);
}
export async function POST(req) {
  try {
    const form = await req.formData();

    const raw = form.get("data");
    const data = JSON.parse(raw);

    let imageUrl = null;
    const imageFile = form.get("image");

    if (imageFile && typeof imageFile !== "string") {
      imageUrl = await uploadFile(imageFile, "products");
    }

    const product = await prisma.product.create({
      data: {
        name: data.title,
        slug: data.slug,
        description: data.description || "",
        price: parseFloat(data.price || 0),
        category: data.category || "",
        image: imageUrl
      }
    });

    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
