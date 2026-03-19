import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file");

  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const url = await uploadFile(file, "products");
  return NextResponse.json({ url });
}
