# BagsArt — Premium 3D E-commerce

A production-shaped, luxury e-commerce platform built on **Next.js 14 App
Router**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **React Three
Fiber**, **Prisma + MySQL**, **NextAuth**, **Stripe**, and **Zustand**.

> The app runs end-to-end out of the box without any external services. Provide
> a `DATABASE_URL` and `STRIPE_SECRET_KEY` when you want to graduate from
> in-memory mock data to real persistence and payments.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + React + TypeScript |
| Styling | Tailwind CSS, ShadCN-style primitives, design tokens via CSS vars |
| Animation | Framer Motion |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` |
| State | Zustand (cart, wishlist, toasts) — persisted to `localStorage` |
| Auth | NextAuth (JWT sessions, Credentials + optional Google OAuth) |
| Database | MySQL via Prisma — automatic fallback to in-memory mock data |
| Payments | Stripe Checkout — falls back to a mock order in dev |
| Charts | Recharts (admin dashboard) |

---

## Getting started

```bash
# 1. Install
npm install

# 2. Copy environment template
cp .env.example .env

# 3. (Optional) Provision MySQL + Prisma client
#    DATABASE_URL="mysql://root:password@localhost:3306/bagsart"
npm run db:generate
npm run db:push
npm run db:seed   # creates the admin user + product catalogue

# 4. Run dev
npm run dev
```

App boots at <http://localhost:3000>. Without `DATABASE_URL`, the homepage,
catalogue, product details, cart, and admin pages still render — they read
from `lib/mock-data.ts`.

---

## Default credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@bagsart.dev` | `admin12345` |

The login form is pre-filled with these credentials. Sign in to access
`/admin`. The middleware (`middleware.ts`) restricts `/admin/*` to users with
`role === "admin"` and `/dashboard/*` to any signed-in user.

---

## Folder structure

```
app/                Next.js routes
  page.tsx          Homepage
  products/         Catalogue & PDP
  cart/, checkout/  Cart, checkout, success
  auth/             Login + signup
  dashboard/        User dashboard (orders, wishlist, profile)
  admin/            Role-gated admin panel
  api/              Route handlers (auth, products, checkout, coupons, …)
components/         UI primitives, layout, home, product, admin, 3D scenes
lib/                utils, queries, db (Prisma), auth (NextAuth), stripe
prisma/             schema.prisma + seed.ts (MySQL)
store/              Zustand stores (cart, wishlist)
types/              shared TypeScript types
middleware.ts       Auth + role gating
```

---

## Pages

- **Homepage** — animated 3D hero (lazy-loaded), featured grid, category mosaic,
  testimonials, newsletter signup.
- **Catalogue** (`/products`) — filterable (category, price, in-stock), sortable
  (latest / popular / price), paginated. Filters wired through URL state.
- **Product detail** (`/products/[slug]`) — image gallery + togglable 3D
  preview, color picker, qty stepper, wishlist toggle, reviews, "you may also
  like" section.
- **Cart** (`/cart`) — Zustand-backed with coupon support (`WELCOME10`,
  `STUDIO25`). Animated row enter/exit.
- **Checkout** (`/checkout`) — contact + shipping form; calls `/api/checkout`
  which uses Stripe Checkout if configured, falls back to a mock order
  otherwise.
- **Auth** — `/auth/login`, `/auth/signup`. NextAuth credentials + optional
  Google OAuth.
- **Dashboard** (`/dashboard`) — overview, orders, wishlist, profile.
- **Admin** (`/admin`) — overview with revenue + top-sellers charts, products
  CRUD, orders table, users table, coupons, CMS, settings.

---

## 3D usage philosophy

3D is deliberately understated:

- The homepage hero loads a single, dynamically-imported `Canvas` *after*
  paint, so first contentful paint stays fast.
- The PDP gallery defaults to high-quality product photography and lets users
  *opt into* a 3D preview via a toggle in the top corner.

This keeps the site fast and the 3D meaningful instead of decorative.

---

## API surface (`app/api/*`)

| Route | Purpose |
| --- | --- |
| `POST /api/auth/[...nextauth]` | NextAuth handler |
| `POST /api/auth/register` | Create a new user account |
| `GET /api/products` | List products (filters via query string) |
| `GET /api/products/[slug]` | Single product |
| `GET /api/coupons/[code]` | Resolve a coupon |
| `POST /api/checkout` | Create a Stripe Checkout session + order record |
| `POST /api/admin/products` | Create a product (role-gated) |
| `POST /api/newsletter` | Newsletter signup stub |

All inputs are validated with **Zod**.

---

## Performance & SEO

- App Router server components for product pages → SSR/SSG-friendly.
- `next/image` for every product photo, with `remotePatterns` configured for
  Unsplash, Cloudinary, and Shopify CDN.
- Metadata API for `<title>`, OpenGraph, and Twitter cards.
- 3D `Canvas` instances are dynamically imported with `ssr: false` so they
  never block the initial response.
- Tailwind's JIT keeps CSS lean; `tailwind-merge` prevents class duplication.

---

## Theming

Theme variables live in [`app/globals.css`](app/globals.css) (`--background`,
`--foreground`, `--primary`, …). Dark mode is class-based via `next-themes` —
toggle from the top navigation.

---

## Notes on the mock-data fallback

`lib/queries.ts` currently reads from `lib/mock-data.ts`. When you wire up
MySQL, swap the function bodies to call `prisma.product.findMany(...)` and
friends — every call site already uses the typed return value, so no UI code
needs to change.
