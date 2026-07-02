import { v2 as cloudinary } from "cloudinary";

/**
 * Server-side Cloudinary client.
 *
 * Configured lazily on first import — safe because Next.js only loads this
 * on server routes. Returns `null` if any credential is missing so callers
 * can degrade gracefully (dev / preview environments without a cloudinary
 * account will just see a friendly error in the upload UI).
 */
const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

let configured = false;
export function getCloudinary() {
  if (!cloud || !key || !secret) return null;
  if (!configured) {
    cloudinary.config({
      cloud_name: cloud,
      api_key: key,
      api_secret: secret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export const CLOUDINARY_FOLDER = "bagsart/products";
