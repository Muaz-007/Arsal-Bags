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
  currency: "USD";
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
  items: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
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
  uses: number;
}
