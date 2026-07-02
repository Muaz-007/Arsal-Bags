import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import {
  getClientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";
import { getCloudinary } from "@/lib/cloudinary";

// Sign-in-required image upload for review photos. Tighter than the admin
// route: smaller file cap and a per-user rate limit so a compromised account
// can't burn through the Cloudinary quota.
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const FOLDER = "bagsart/reviews";

export async function POST(req: Request) {
  const user = await requireUser();

  const limit = await rateLimit({
    key: `review-upload:${user.id}:${getClientIp(req)}`,
    max: 30,
    windowMs: 60 * 60_000,
  });
  if (!limit.ok) return rateLimitedResponse(limit);

  const cld = getCloudinary();
  if (!cld) {
    return NextResponse.json(
      { error: "Photo uploads aren't available right now." },
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
      { error: "Only JPEG, PNG, or WebP images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 5MB." },
      { status: 413 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;

  try {
    const result = await cld.uploader.upload(dataUri, {
      folder: FOLDER,
      resource_type: "image",
      // Cap the stored resolution — review photos never need to be full
      // print quality, and the smaller file saves bandwidth on delivery.
      transformation: [
        { width: 1600, height: 1600, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload/review] cloudinary error", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
