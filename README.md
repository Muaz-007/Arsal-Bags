# BagsArt — Premium 3D E-commerce

A production-shaped luxury e-commerce platform built on **Next.js 14 App
Router**, **TypeScript**, **Tailwind**, **Framer Motion**, **React Three
Fiber**, **Prisma + MySQL**, **NextAuth**, **Stripe**, and **Zustand**.

> The app runs end-to-end out of the box without any external services.
> Provide a `DATABASE_URL` and `STRIPE_SECRET_KEY` when you want to graduate
> from in-memory mock data to real persistence and payments.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + React + TypeScript |
| Styling | Tailwind CSS, ShadCN-style primitives |
| Animation | Framer Motion |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` |
| State | Zustand (cart, wishlist, toasts) — persisted to `localStorage` |
| Auth | NextAuth (JWT sessions, Credentials + optional Google OAuth) |
| Database | MySQL via Prisma — automatic fallback to in-memory mock data |
| Payments | Stripe Checkout — falls back to a mock order in dev |
| Charts | Recharts (admin dashboard) |

---

## Quick start (mock mode)

No database required — runs straight on mock data:

```bash
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:3000>. Browse, fill the cart, hit /checkout, and even
log in to the admin (`admin@bagsart.dev` / `admin12345`). Orders won't
persist, but the full UI works.

---

## Production mode (MySQL)

1. **Spin up MySQL.** Anything works — local Docker, PlanetScale, Railway,
   Aiven, your own server.

   ```bash
   # Local docker example
   docker run -d --name bagsart-mysql \
     -e MYSQL_ROOT_PASSWORD=password \
     -e MYSQL_DATABASE=bagsart \
     -p 3306:3306 mysql:8
   ```

2. **Point `.env` at it.**

   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/bagsart"
   NEXTAUTH_SECRET="any-long-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Generate the Prisma client and push the schema:**

   ```bash
   npm run db:generate
   npm run db:push       # for first-time setup
   # or:
   npm run db:migrate    # if you want versioned migrations
   ```

4. **Seed the database** with the admin user + product catalogue:

   ```bash
   npm run db:seed
   ```

5. **Start the app:**

   ```bash
   npm run dev
   ```

Everything that was reading from mocks now reads from your MySQL — products,
orders, users, wishlist, admin stats, the lot.

> The Prisma client is exposed via `lib/db.ts`. When `DATABASE_URL` is empty
> it exports `null` and `lib/queries.ts` transparently uses `lib/mock-data.ts`
> instead. **You can switch back and forth just by editing `.env`.**

### Optional environment

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Enable real Stripe Checkout |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature validation |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth on the login screen |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Admin product image uploads |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Override the seeded admin credentials |

---

## Default credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@bagsart.dev` | `admin12345` |

The login form is pre-filled. Admins land on `/admin`; customers land on
`/` (the store).

---

## How auth works

- **Sign up first.** Clicking the user icon in the navbar jumps straight to
  `/auth/signup`. On success, the user is signed in and redirected to the
  store — not to a dashboard.
- **Account pages** (`/dashboard`, `/dashboard/orders`, `/dashboard/wishlist`,
  `/dashboard/profile`) render in the regular store chrome — no separate
  dashboard layout. They're reached from the user dropdown (desktop) or the
  hamburger drawer (mobile).
- **Admin** has its own dedicated panel at `/admin/*` with its own sidebar.
  Only users with `role === "admin"` can enter — enforced by `middleware.ts`.

---

## Folder structure

```
app/                     Next.js routes
  page.tsx                Homepage
  products/               Catalogue + PDP
  cart/, checkout/        Cart, checkout, success
  auth/                   Login + signup
  dashboard/              Customer account (orders, wishlist, profile)
  admin/                  Role-gated admin panel
    storefront/             ← controls hero/strip/featured/best/sale
    inventory/              ← stock per product, inline +/-
  api/                    Route handlers
components/
  layout/                 navbar, footer, user-menu, page transition, etc.
  ui/                     button, card, dropdown, toast, …
  product/                cards, gallery, filters, sort-bar, rail
  home/                   hero, category-strip, featured, best, sale, …
  admin/                  sidebar, charts, stat-card, section-editor,
                          featured-picker, inventory-stock-cell, tabs, …
  dashboard/              wishlist-client, …
  3d/                     hero-scene, product-viewer
lib/                     utils, queries, db (Prisma), auth, auth-server,
                          stripe, use-body-scroll-lock, mock-data
prisma/                  schema.prisma + seed.ts (MySQL)
store/                   Zustand stores (cart, wishlist)
types/                   shared TypeScript types
middleware.ts            Auth + role gating
```

---

## API surface

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | `*` | NextAuth handler |
| `/api/auth/register` | `POST` | Create a new user (bcrypt hash, Prisma) |
| `/api/products` | `GET` | List products (filters via query string) |
| `/api/products/[slug]` | `GET` | One product |
| `/api/coupons/[code]` | `GET` | Resolve a coupon |
| `/api/checkout` | `POST` | Create a Stripe session + order. Attaches to current user if signed in; decrements stock per item |
| `/api/wishlist` | `GET`/`POST` | Read or toggle the signed-in user's wishlist |
| `/api/admin/products` | `POST` | Admin-gated product creation |
| `/api/admin/inventory` | `PATCH` | Admin-gated stock update |
| `/api/admin/orders/[id]` | `PATCH` | Admin-gated order status update |
| `/api/admin/storefront` | `GET`/`PUT` | Admin-gated storefront section config (hero, strip, featured, best, sale) |
| `/api/newsletter` | `POST` | Newsletter signup stub |

All inputs are validated with **Zod**. All admin write routes use
`getCurrentUser()` + `role === "admin"` gating.

---

## Database schema highlights

| Model | What it stores |
| --- | --- |
| `User` | Account, role (`customer` / `admin`), bcrypt password hash |
| `Account` / `Session` / `VerificationToken` | NextAuth adapter tables |
| `Product` | Slug, name, tagline, description, prices, JSON colors/materials/images, stock, featured, ratings |
| `Review` | Per-product review with rating + body |
| `Order` / `OrderItem` | Customer name/email, totals, status, items + product references |
| `WishlistItem` | (userId + productId) unique — server-side wishlist |
| `StorefrontConfig` | Admin-controlled JSON blobs for `hero`, `strip`, `featured`, `bestsellers`, `sale` |
| `Coupon` | Code, type (percent/fixed), value, active flag, expiry, uses counter |

Schema lives in [`prisma/schema.prisma`](prisma/schema.prisma). Run
`npm run db:studio` to browse the data in Prisma Studio.

---

## Storefront control

`/admin/storefront` is the single source of truth for everything visible on
the public homepage:

- **Hero slider** — slides, captions, images, links
- **Category strip** — the auto-scrolling circles below the hero
- **Featured** — manually-picked products + order
- **Best sellers** — auto-ranked by review count, override-able
- **Summer sale** — products with a `compareAt > price`

Each tab is bookmarkable (`?tab=hero` etc.) and saves to `StorefrontConfig`
via `PUT /api/admin/storefront`.

---

## Performance & SEO

- Server components for product, dashboard, and admin pages → SSR-friendly.
- `next/image` for every product photo, with `remotePatterns` whitelisted for
  Unsplash + Cloudinary + Shopify CDN.
- 3D `Canvas` instances are dynamically imported with `ssr: false` and
  loaded only when the user actively opts in.
- Tailwind's JIT keeps the bundle lean; `tailwind-merge` prevents class
  duplication.
- `prefers-reduced-motion` respected globally (marquee strip excepted, as it
  uses pure CSS transform on the GPU).

---

## Theming

Theme variables live in [`app/globals.css`](app/globals.css)
(`--background`, `--foreground`, `--primary`, …). Dark mode is class-based
via `next-themes` — toggle from the top navigation.

---

## Troubleshooting

- **`Cannot find module '@prisma/client'`** — run `npm run db:generate`.
- **`P1001: Can't reach database server`** — your MySQL isn't running or the
  `DATABASE_URL` is wrong. Test with `mysql -h localhost -u root -p`.
- **`NEXTAUTH_URL` warning** — set it in `.env` to the URL the app actually
  runs on (e.g. `http://localhost:3000`).
- **Want to wipe the DB?** `npx prisma db push --force-reset` (destructive)
  followed by `npm run db:seed`.
