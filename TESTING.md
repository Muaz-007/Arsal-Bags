# BagsArt — Pre-launch Testing Checklist

**Purpose:** Run through the entire store end-to-end before going live. Every ✅ box should be checked before you consider yourself launch-ready.

**Suggested test setup:**
- Use **2 browsers** side by side: one signed in as admin, one as a customer (or use an incognito window for the second).
- Test on **desktop** first, then repeat critical flows on **mobile** (real phone or Chrome DevTools device mode).
- Have **your Gmail inbox** open in a tab to watch for emails.
- Keep the **Vercel Functions logs** tab open (or run `npm run dev` locally) to catch server errors.

---

## 0. Setup checks (do first)

- [ ] `.env` values match Vercel env vars (all 13: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_HOST/PORT/USER/PASS/SECURE`, `EMAIL_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`)
- [ ] Google Cloud Console → Authorized redirect URI includes your Vercel production URL: `https://<domain>/api/auth/callback/google`
- [ ] Neon DB has all tables (`npx prisma db push` ran successfully)
- [ ] Admin user exists in DB (`npm run db:seed` or Google sign-in with `ADMIN_EMAIL` matching Gmail)
- [ ] Cloudinary account has `bagsart/products` folder ready (auto-created on first upload)

---

## 1. Homepage (public, signed out)

Open the production URL in an incognito window.

- [ ] Page loads without console errors (`F12` → Console)
- [ ] Hero section renders — animated slider works, gold gradient visible
- [ ] Category strip below hero animates (marquee scroll)
- [ ] "Featured this season" rail shows products with images
- [ ] "Best sellers" rail shows products
- [ ] "Summer Sale" section shows banner + products (or "no sale items" message)
- [ ] "View our entire variety" section renders with collage
- [ ] Newsletter subscribe form present on home + in footer
- [ ] Theme toggle works (light/dark) — no flash of wrong theme on reload
- [ ] Footer links (Shop / About / Help / Legal) all resolve to real pages
- [ ] Social icons (Instagram + Facebook) open real profiles in new tab
- [ ] Mobile: hamburger menu opens/closes cleanly, body doesn't scroll behind

---

## 2. Product catalogue

Navigate to `/products`.

- [ ] All products load with images, name, price, rating
- [ ] "Low stock" and "Sold out" badges appear correctly
- [ ] Filter sidebar works: category, price range, in-stock toggle, sale toggle
- [ ] Sort dropdown: latest / popular / price asc / price desc — all change ordering
- [ ] Pagination works if you have >12 products; page 1 → 2 keeps filters
- [ ] Empty filter state shows "No products match — Clear filters" button
- [ ] Case-insensitive search: header search bar → type "TOTE" (uppercase) → results should show
- [ ] Search overlay closes on Escape, click outside, or clicking a result
- [ ] `/products?category=tote` deep-link filters correctly
- [ ] Mobile: filter sheet opens as drawer, closes on Escape

---

## 3. Product detail page

Click any product from the listing.

- [ ] Gallery shows main image + thumbnails, thumbnails switch main image
- [ ] Color picker (if >1 color) changes selected color
- [ ] Quantity picker respects stock (can't exceed available)
- [ ] Rating + review count displayed
- [ ] Materials list displays
- [ ] Add to cart triggers toast + cart badge count increments in header
- [ ] Sold-out state: button says "Sold out" and is disabled
- [ ] Wishlist heart button toggles (fills red when saved)
- [ ] "You may also like" section shows related products
- [ ] Reviews section loads, shows overall rating, verified buyer badge on eligible reviews
- [ ] JSON-LD in `<head>` present (View Source → search "@type":"Product")
- [ ] Meta title = product name, meta description = tagline (View Source)

---

## 4. Cart

- [ ] Add same product with different colors → both lines appear separately in cart
- [ ] Increase/decrease qty updates line total + cart total
- [ ] Remove a color variant → only that variant deletes, other color stays
- [ ] Empty cart shows "Your bag is empty" with Start shopping CTA
- [ ] Apply coupon `WELCOME10` → discount shows, subtotal decreases
- [ ] Apply invalid coupon → error toast, cart unchanged
- [ ] Coupon persists across page reloads (Zustand localStorage)
- [ ] Rs 250 shipping shows on orders below Rs 4,000; "Free" above

---

## 5. Auth flow

### 5.1 Sign up (credentials)

- [ ] `/auth/signup` shows the form
- [ ] Empty submit → validation errors
- [ ] Weak password (< 8 chars) → error
- [ ] Existing email → generic error (no "email in use" leak)
- [ ] Successful signup → redirect to home, header shows "Signed in as..."
- [ ] **Welcome email arrives** in the submitted inbox (check spam folder too)
- [ ] Sign out from user menu → returns to home, session cleared

### 5.2 Sign in

- [ ] `/auth/login` shows the form
- [ ] Wrong password → "Email or password is wrong" (generic)
- [ ] Wrong email → same generic message
- [ ] Correct credentials → redirect to home
- [ ] After signing in, `/auth/login` auto-redirects away (can't see the form)

### 5.3 Google OAuth

- [ ] "Continue with Google" button on both login and signup
- [ ] Redirects to Google, back to home after consent
- [ ] New Google user auto-created in DB with `passwordHash = null`
- [ ] **Critical:** If you signed up with credentials first using `x@gmail.com`, trying Google with same email should redirect back to `/auth/login?error=OAuthAccountNotLinked` (not silently take over the credentials account)

### 5.4 Password reset

- [ ] `/auth/forgot` → enter email → "Check your inbox" message (same for real & fake emails)
- [ ] **Reset email arrives** with a working link
- [ ] Reset link opens `/auth/reset?token=...`
- [ ] Weak new password rejected
- [ ] Successful reset → auto sign-in or redirect to login
- [ ] Old password no longer works
- [ ] Token can't be reused (visit the link again → error)
- [ ] Expired token (wait > 1 hour) → error

### 5.5 Email change (from profile)

- [ ] Sign in as credentials user → `/dashboard/profile` → change email
- [ ] **Verify email arrives at NEW address**
- [ ] Click link → email updates
- [ ] Old email no longer works for login; new one does
- [ ] Google users see the email field locked (can't edit)

---

## 6. Wishlist

- [ ] **Guest:** Heart a product from anywhere → cart badge on Wishlist FAB (bottom-right) increments
- [ ] `/wishlist` page shows the hearted product
- [ ] Sign in with a fresh account → wishlist syncs (guest items appear in server list)
- [ ] Heart from product page → refresh → still hearted
- [ ] Unheart → disappears from wishlist page
- [ ] Empty wishlist state shows friendly CTA to browse

---

## 7. Checkout — COD flow (customer)

Sign in as a customer (not admin), add 2 products to cart.

- [ ] `/checkout` requires filled Contact + Shipping form
- [ ] Payment section: **Cash on delivery** selected by default, **Card / online** shows "Coming soon" badge and is disabled
- [ ] Try clicking Card button — nothing happens
- [ ] "Place order" button reads: `Place order · $XXX`
- [ ] Signed-in users: saved address picker appears if they have addresses
- [ ] "Save this address for next time" checkbox appears for signed-in users
- [ ] Submit → redirect to `/checkout/success?order=ord_...`
- [ ] Success page shows COD-specific messaging (gold bordered "Have exact total ready" card)
- [ ] **Order confirmation email arrives** in customer's inbox
- [ ] Cart is now empty (badge back to 0)
- [ ] `/dashboard/orders` shows the new order at the top with status "pending"
- [ ] `/dashboard/orders/[id]` shows order details, timeline, no tracking yet

**Stock enforcement test (2 tabs):**
- [ ] Set stock of a product to 1 via admin
- [ ] Tab A: add product to cart, don't checkout
- [ ] Tab B: add same product to cart, checkout → success (stock = 0 now)
- [ ] Tab A: try to checkout → error toast "Only 0 left of X — please reduce"
- [ ] Neither tab creates 2 orders — no oversell

---

## 8. Reviews

Complete a paid/shipped order first (mark it fulfilled from admin panel).

- [ ] From product page, sign-in-required message shows for guests
- [ ] Signed in: review form appears with star picker
- [ ] Try submit with 0 stars → toast "Pick a rating first"
- [ ] Fill 5 stars + headline + body → submit → toast "Review posted"
- [ ] Review appears in list immediately
- [ ] Overall product rating recalculates
- [ ] **Verified buyer badge** appears next to reviews from customers who actually ordered
- [ ] Photo upload: pick 1-3 photos → upload, thumbnails appear
- [ ] Post review → photos visible in the review card, click opens lightbox
- [ ] "Edit" your own review → change stars/body → save → updated
- [ ] "Delete" your own review → confirm → gone, rating recalculates
- [ ] Cannot see Edit/Delete on someone else's review

**Sort test:**
- [ ] Sort dropdown: "Most recent" (default), "Highest rated", "Lowest rated" — order changes accordingly

---

## 9. Newsletter + Contact

- [ ] Homepage newsletter form: enter email → success toast
- [ ] Try same email again → still success (idempotent)
- [ ] Invalid email → error toast
- [ ] Footer newsletter form: same behaviour, "You're on the list" replaces form
- [ ] Contact page form: fill name, email, subject dropdown, message → submit
- [ ] **Contact email arrives** at `bags.art.pk@gmail.com` with the form contents
- [ ] "Reply-to" header set to customer's email (so hitting Reply in Gmail goes to them)

---

## 10. Admin — access & sidebar

Sign in as admin (`bags.art.pk@gmail.com` / seeded password).

- [ ] `/admin` opens without redirect (server layout gate)
- [ ] Non-admin visiting `/admin` (test in a customer account) redirects to `/`
- [ ] Signed-out visiting `/admin` redirects to `/auth/login?callbackUrl=/admin`
- [ ] Sidebar shows: Dashboard, Storefront (Sections, Products, Inventory, Media), Sales (Orders, Coupons), Audience (Users), System (Settings)

---

## 11. Admin — products

- [ ] `/admin/products` shows list with search + filter toolbar
- [ ] Search "tote" → results narrow (case-insensitive)
- [ ] Filter by category → results narrow
- [ ] Filter by stock (in / low / out) → results narrow
- [ ] "Clear" button resets URL params
- [ ] "Add product" → form loads
- [ ] Fill required fields, drag-drop an image → uploads to Cloudinary, thumbnail appears
- [ ] Reorder image thumbnails, mark first as "Cover"
- [ ] Paste an image URL as alternative
- [ ] Save → toast, redirects to product list, new product visible
- [ ] Edit existing product → form pre-filled, change stock → save → live
- [ ] Delete product → confirm → gone

---

## 12. Admin — orders

- [ ] `/admin/orders` shows list of orders with search + status filter + payment filter
- [ ] Search by order ID / customer name / email → narrows
- [ ] Filter by status "pending" → only pending orders
- [ ] Filter by payment "cod" → only COD orders
- [ ] Order row shows: id, customer, item count, date, status badge, payment (COD/Card), tracking, total
- [ ] Click into order detail
- [ ] Change status: pending → paid → toast, customer dashboard updates
- [ ] Change status: → shipped, add tracking number `TCS-AB12345`, add tracking URL
- [ ] **Customer view** (`/dashboard/orders/[id]`): tracking card appears with gold border, "Track with courier" link works
- [ ] Order timeline shows current status

---

## 13. Admin — inventory + coupons + storefront

- [ ] `/admin/inventory` opens, shows all products with stock cells
- [ ] Click +/− on stock cell → check appears, refresh page → value persisted
- [ ] Set stock to 0 → cell turns red, badge says "Sold out"
- [ ] Try to decrease below 0 → button disabled
- [ ] `/admin/coupons` opens, shows existing coupons
- [ ] Create new coupon: `TEST10`, percent, 10%, active, no expiry → save
- [ ] Apply `TEST10` at checkout as customer → discount applies
- [ ] Delete `TEST10` from admin → gone from list
- [ ] `/admin/storefront` opens, tabs: Hero / Strip / Featured / Best sellers / Sale
- [ ] Toggle a hero slide off → refresh home → slide gone from carousel
- [ ] Toggle back on → returns
- [ ] Change strip item title → save → refresh home → new title visible

---

## 14. Email delivery final check

Look in your Gmail sent items to confirm all these actually shipped from `bags.art.pk@gmail.com`:

- [ ] Welcome email (from signup)
- [ ] Order confirmation email (from checkout)
- [ ] Password reset email (from forgot flow)
- [ ] Email change verification (from profile change)
- [ ] Contact form submission (delivered TO the inbox)

If any missing: check Vercel Functions logs for SMTP errors, check Gmail App Password still valid.

---

## 15. Mobile pass (real phone or DevTools)

Repeat the golden path on mobile:

- [ ] Home → catalogue → product detail → add to cart → cart → checkout → success
- [ ] Sign up + sign in flows on mobile keyboards work
- [ ] Mobile drawer nav opens smoothly, closes on link tap
- [ ] Filter drawer opens/closes on `/products`
- [ ] Wishlist FAB doesn't overlap important content
- [ ] Product gallery swipeable on touch
- [ ] Star picker on review form tappable

---

## 16. Error / edge cases

- [ ] Visit non-existent URL like `/products/does-not-exist` → 404 page renders
- [ ] Visit non-existent product ID → 404
- [ ] Visit `/dashboard/orders/some-other-users-order` → 404 (never 200 for other users)
- [ ] Kill the DB (or point `DATABASE_URL` to bad host locally) → homepage still renders (tolerant wrapper falls back), no white screen
- [ ] Trigger a rate limit: submit login form 10 times fast → "Too many attempts, try again later"
- [ ] Try to POST to `/api/admin/products` as a customer (curl / DevTools) → 403 Forbidden
- [ ] Try to POST `paymentMethod: "card"` at checkout (DevTools fetch) → 400 Invalid order

---

## 17. SEO / meta pass

- [ ] View source on homepage → `<meta property="og:title">` present, `metadataBase` set to real domain (not localhost)
- [ ] `/sitemap.xml` opens, lists all products + static pages
- [ ] `/robots.txt` opens, allows `/`, disallows `/admin`, `/api`, `/dashboard`
- [ ] `/opengraph-image` renders as branded gold-on-dark image
- [ ] Product page: JSON-LD Product schema present + BreadcrumbList
- [ ] All page titles unique + descriptive (View tab title on each page)

---

## 18. Content review (read pages like a customer)

- [ ] `/about` — reads clean, no placeholder text, no "Lorem ipsum"
- [ ] `/help/faq` — answers accurate to the store's real policies
- [ ] `/help/shipping` — lead times, costs match reality
- [ ] `/help/care` — no atelier-specific claims that don't apply
- [ ] `/legal/privacy` — email + address correct
- [ ] `/legal/terms` — governing law "Pakistan"
- [ ] `/legal/cookies` — accurate cookie list
- [ ] `/contact` — Instagram + Facebook links open your real accounts
- [ ] Nowhere on site says "Karachi" (should be Lahore everywhere)
- [ ] Nowhere on site promises "lifetime repair" or "repair guarantee"
- [ ] No fake email addresses (`hello@bagsart.dev` etc.) anywhere

---

## 19. Final pre-launch

- [ ] Custom domain attached to Vercel + DNS records verified (if buying domain)
- [ ] SSL cert active (green padlock)
- [ ] `NEXT_PUBLIC_SITE_URL` + `NEXTAUTH_URL` updated to custom domain
- [ ] Google Cloud Console redirect URI updated to custom domain
- [ ] Google Search Console: property added, sitemap submitted
- [ ] Test the golden path one more time on the live domain
- [ ] Set up **UptimeRobot** (free) to ping every 5 min → keeps Neon warm + you learn about outages first
- [ ] Take a screenshot of a passing checkout — proof of working system before you announce

---

## Anything failing?

If a step doesn't pass:

1. Note **exactly which step**, which browser, and what error you saw (screenshot or console log helps).
2. Check **Vercel → Deployments → Latest → Functions** for server-side errors.
3. Come back and describe the failing step — we fix, retest, tick the box.

Once every box is ticked → you are launch-ready.
