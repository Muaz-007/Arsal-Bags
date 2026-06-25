import Stripe from "stripe";

/**
 * Stripe is optional. If STRIPE_SECRET_KEY isn't set, `stripe` is null and
 * /api/checkout falls back to a mock order so the UX still completes.
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;
