// lib/upload.js

import fs from "fs";
import path from "path";

export async function uploadFile(file, folder = "uploads") {
  // Simple local file saving example
  const uploadDir = path.join(process.cwd(), folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, file.name);
  await fs.promises.writeFile(filePath, file.data);

  return { url: `/${folder}/${file.name}` };
}
