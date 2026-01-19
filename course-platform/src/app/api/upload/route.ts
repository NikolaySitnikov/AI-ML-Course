import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Image optimization settings
const MAX_WIDTH = 1920; // Max width for large displays
const QUALITY = 80; // Good balance between quality and file size

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFilename(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}.webp`;
}

// Optimize image: resize if needed, convert to WebP, compress
async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Only resize if wider than MAX_WIDTH
  if (metadata.width && metadata.width > MAX_WIDTH) {
    image.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  // Convert to WebP with good quality
  return image
    .webp({ quality: QUALITY })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB for upload, will be compressed)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize the image
    const optimizedBuffer = await optimizeImage(buffer);

    const filename = generateFilename();
    const filepath = path.join(UPLOAD_DIR, filename);

    await writeFile(filepath, optimizedBuffer);

    const url = `/uploads/${filename}`;

    // Return file info including size reduction
    const originalSize = buffer.length;
    const optimizedSize = optimizedBuffer.length;
    const reduction = Math.round((1 - optimizedSize / originalSize) * 100);

    return NextResponse.json({
      url,
      filename,
      originalSize,
      optimizedSize,
      reduction: `${reduction}%`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
