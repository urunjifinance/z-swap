# Z-Swap

**Swap. Move. Serve.** A digital swap/transfer platform for Zambian government workers — teachers, health workers, civil servants, police, defence and council workers — to find and arrange mutual transfers across all 10 provinces.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and NextAuth.

---

## What's included

- **Landing page** — hero with a custom Zambia SVG map, how-it-works, most-wanted places, swap incentives, testimonials, compliance disclaimer
- **9-step registration wizard** — personal details → department → job details (dynamic per department) → current location → preferred swap locations → incentive preference → contacts → document verification → review & submit
- **Worker dashboard** — swap requests, matches, profile completion
- **Matches browser** — filterable by province, department, verified status
- **Swap request + mock payment flow** — request fee payment structured for Flutterwave/Paystack/DPO
- **Chat UI** — simulated real-time messaging, safety tips, report/block
- **Admin dashboard** — analytics (Recharts), verification approvals, users table, payments/revenue, disputes
- **Prisma schema** modeling the full data model (User, Department, SwapRequest, Match, Chat, Message, Payment, Report, Notification)
- **API routes** wired to Prisma: user registration, swap requests, matching, payments, admin stats

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

The defaults work out of the box for local development (SQLite, no external accounts needed). Fill in payment/upload/SMS keys later when you're ready to go live — see [Production integrations](#production-integrations) below.

### 3. Generate the Prisma client and create the database

```bash
npx prisma generate
npx prisma db push
```

This creates a local `dev.db` SQLite file from `prisma/schema.prisma`. No Postgres install needed for local dev.

> **Note:** `prisma generate` downloads Prisma's query engine binaries from `binaries.prisma.sh` the first time you run it. This requires normal internet access — if you're behind a restrictive corporate proxy or firewall, allow that domain.

### 4. (Optional) Seed demo data

```bash
npx tsx prisma/seed.ts
```

Loads all government departments plus the sample users/matches used throughout the UI mocks, so the matching engine and admin panel have real rows to work with. Creates a demo admin (`admin@zswap.zm` / `Admin@12345`) and demo workers (`<id>@zswap.demo` / `Password@123`).

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Project structure

```
app/
  page.tsx                  Landing page
  register/                 9-step registration wizard
  login/                    Login page
  dashboard/                Worker dashboard
  matches/                  Match browser with filters
  swap/new/                 Swap request creation form
  payment/                  Mock request-fee payment + receipt
  chat/[id]/                Chat with a matched user
  admin/                    Admin dashboard (tabs: analytics, verifications, users, payments, disputes)
  api/
    users/                  POST — registration
    swap-requests/          GET/POST — a worker's swap requests
    matches/                GET — matching engine results for a request
    payments/               POST — request-fee payment (mock gateway, structured for real integration)
    admin/stats/            GET — admin analytics aggregates
    auth/[...nextauth]/     NextAuth handler

components/
  landing/                  Navbar, Hero, HowItWorks, MostWanted, Incentives, Testimonials, Footer, ZambiaMap (SVG)
  register/                 Wizard shell + 9 step components + Zustand store
  dashboard/                Sidebar, topbar, stat cards, match card
  admin/                    Sidebar, analytics charts, verifications, users table, payments/disputes
  ui/                       Shared design-system primitives (button, card, input, select, dialog, etc.)

lib/
  data/                     Mock reference data — provinces/districts, departments/salary scales/job titles, sample users
  matching-engine.ts        Client-side match scoring logic
  auth.ts                   NextAuth configuration (credentials provider, OTP-ready)
  prisma.ts                 Prisma client singleton

prisma/
  schema.prisma             Full data model
  seed.ts                   Demo data loader
```

---

## Design system

- **Colours:** primary orange `#F97316`/`#EA580C`, primary green `#16A34A`/`#15803D`, orange↔green gradients, dark text `#0F172A`, light backgrounds `#FFF7ED`/`#F0FDF4`
- **Style:** glassmorphism cards, soft shadows, rounded corners, Framer Motion micro-interactions
- All tokens live in `tailwind.config.ts` and `app/globals.css`

---

## Production integrations

Everything below is currently mocked but structured so swapping in the real service is a contained change:

| Feature | Current (demo) | Swap in for production |
|---|---|---|
| Payments | Simulated charge in `app/api/payments/route.ts` | Flutterwave / Paystack / DPO — see comments in that file for the exact endpoints |
| File uploads (NRC, payslips, selfies) | File name stored client-side only | Cloudinary or UploadThing — env vars already scaffolded in `.env.example` |
| Real-time chat | Client-side simulated typing/replies in `app/chat/[id]/page.tsx` | Socket.io server or Pusher channels keyed by `chatId` |
| SMS/OTP | Not wired | Africa's Talking or Twilio Verify — see the comment in `lib/auth.ts` for where the OTP verification step slots in |
| Database | SQLite (`dev.db`) | Postgres — change `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma` and point `DATABASE_URL` at your instance |
| Maps | Static SVG illustration (`components/landing/zambia-map.tsx`) | `react-leaflet`/Mapbox are already in `package.json` for an interactive map view on the matches page |

---

## Compliance notes baked into the product

- Non-refundable request fee messaging appears on the swap request form, payment page, and receipt
- Incentive negotiation areas carry a private-arrangement / regulatory-compliance disclaimer everywhere they appear (registration step 6, swap request form, chat)
- The landing page and footer both state Z-Swap is not a government agency and does not guarantee transfer approval
- NRC numbers are masked (`lib/utils.ts → maskNRC`) everywhere they're displayed outside the user's own profile

## Known limitations of this scaffold

- Document/photo uploads currently just capture the filename client-side — wire up Cloudinary/UploadThing before going live
- Chat is simulated per-session, not persisted or real-time — wire up Socket.io/Pusher and the `Message` model
- The admin "Approve/Reject" and dispute actions update local UI state only — wire them to `PATCH` endpoints against the `User`/`Report` models
- OTP login shows the UI but doesn't call a real SMS gateway yet
