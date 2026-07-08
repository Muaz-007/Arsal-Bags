export type Category =
  | "tote"
  | "backpack"
  | "clutch"
  | "crossbody"
  | "duffel"
  | "wallet";

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  // Present so the client can show edit/delete controls only on the
  // signed-in user's own reviews without a second round-trip.
  userId: string;
  // Set server-side when the reviewer has a paid/shipped/delivered order
  // containing this product.
  verified?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  currency: "PKR";
  category: Category;
  collection?: string;
  colors: string[];
  materials: string[];
  images: string[];
  stock: number;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  createdAt: string;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "card" | "cod";

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  items: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
  ordersCount?: number;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  expiresAt?: string;
  // Optional redemption cap. Null / undefined means unlimited.
  maxUses?: number | null;
  uses: number;
}
