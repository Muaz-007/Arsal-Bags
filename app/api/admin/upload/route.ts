import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { CLOUDINARY_FOLDER, getCloudinary } from "@/lib/cloudinary";

// Upload files server-side so we never expose the API secret to the browser
// and we can enforce admin auth. Max ~10MB per file — plenty for a bag photo.
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function POST(req: Request) {
  await requireAdmin();

  const cld = getCloudinary();
  if (!cld) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or AVIF images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 10MB." },
      { status: 413 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;

  try {
    const result = await cld.uploader.upload(dataUri, {
      folder: CLOUDINARY_FOLDER,
      resource_type: "image",
      // Let Cloudinary pick the best format + reasonable size on delivery —
      // keeps the source pristine but shrinks what actually reaches customers.
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("[upload] cloudinary error", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
