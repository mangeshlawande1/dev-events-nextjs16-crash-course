# Dev Event

A full-stack developer events platform — discover, book, and organize conferences,
hackathons, and meetups. Built with Next.js 16 (App Router), TypeScript, and MongoDB,
with real role-based multi-tenancy: guests browse and book with zero friction,
organizers manage their own events through an ownership-scoped dashboard, and admins
oversee the whole platform.

This isn't a CRUD tutorial app — it implements the concerns a production SaaS product
actually needs: authentication and role-based authorization enforced at the middleware
layer (not just hidden in the UI), ownership-scoped data access, rate limiting,
centralized environment validation, SEO, accessibility, dark/light theming, and
analytics.

---

## Features

**Discovery & Booking**
- Server-side search, location/mode/tag filters, and sorting (latest / upcoming / most-booked)
- Typeahead search suggestions
- "Trending Events" — ranked by recent booking activity, not just all-time count
- Guest booking (email only, no account needed) *or* one-click booking when logged in
- Event capacity limits, registration deadlines, and duplicate-booking prevention
- Cancellable bookings, dedicated booking-confirmation page, email-based "My Bookings" lookup

**Organizer Tools**
- Full event CRUD — create, edit, duplicate, delete — with Cloudinary image uploads
- Draft / Published workflow
- Slug uniqueness validation
- Ownership-scoped dashboard: organizers see only their own events, admins see everything
- Analytics dashboard (totals, popular events, category distribution, recent registrations)

**Auth & Authorization**
- Email/password authentication (Auth.js / NextAuth v5, JWT sessions)
- Three roles: `user`, `organizer`, `admin`
- Route protection enforced in Edge middleware (`proxy.ts`), not just client-side
- Ownership checks enforced independently at the API layer, the edit page, and the dashboard listing

**Platform Engineering**
- Dark/light theme toggle (persisted, system-aware)
- Toast notifications and accessible confirmation dialogs
- SEO: per-page metadata, Open Graph/Twitter cards, dynamic sitemap, JSON-LD structured data
- Accessibility pass: skip link, visible focus states, semantic landmarks, focus-trapped modals
- Centralized, fail-fast environment validation
- In-memory rate limiting on booking/event-creation endpoints
- Consistent API response contracts (`apiSuccess`/`apiError` helpers)
- Baseline security headers + optional (commented, opt-in) CSP

---

## Tech Stack

| Layer | Choices |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, custom design tokens, dark/light theming via `next-themes` |
| Forms/Validation | React Hook Form + Zod |
| Database | MongoDB + Mongoose |
| Auth | Auth.js (NextAuth v5), Credentials provider, JWT sessions, bcryptjs |
| Images | Cloudinary |
| Analytics | PostHog |

---

## Architecture

**Layered data access:** `repository` (raw Mongoose queries) → `service` (business logic)
→ `route handler` / `page` (presentation). Keeps database concerns out of components
and API routes thin.

```
lib/
├── repositories/    # Raw MongoDB queries only
├── services/        # Business logic, cross-cutting concerns
├── actions/         # Server Actions ("use server")
├── validations/     # Shared Zod schemas (client + server)
├── auth.config.ts   # Edge-safe auth config (no DB) - used by proxy.ts
├── auth.ts           # Full auth config (Credentials provider, DB-backed) - Node runtime only
├── ownership.ts      # Shared canManageEvent() check
├── env.ts             # Centralized, scoped environment validation
├── rate-limit.ts      # In-memory fixed-window limiter
└── api-response.ts    # Shared apiSuccess/apiError helpers
```

**Why the Edge/Node auth split matters:** `proxy.ts` (Next.js 16's middleware
convention) needs to check the session on every request, but it runs in the Edge
runtime, which cannot run Mongoose (no TCP/DNS support). `lib/auth.config.ts` is a
minimal, Edge-safe config with no database-touching provider; `lib/auth.ts` extends it
with the real Credentials provider and is only ever imported by the Node-runtime API
route handler. This is a real Next.js architectural constraint, not a style choice —
getting it wrong bundles Mongoose into the Edge bundle and breaks the build.

**Ownership as a first-class concern:** a single shared `canManageEvent()` helper is
the source of truth for "can this session touch this event." It's enforced
independently in three places: the API routes (defense against calling the API
directly), the edit page (an organizer can't even *load* another organizer's event into
the form, not just get blocked on save), and the dashboard listing (organizers only
ever see their own events in the first place).

---

## Project Structure

```
app/
├── (marketing pages)         # /, /about
├── events/
│   ├── [slug]/                # Event detail, booking confirmation
│   └── create/                 # Create event (organizer/admin only)
├── dashboard/
│   ├── page.tsx                 # Ownership-scoped event management
│   ├── analytics/                # Stats dashboard
│   └── events/[slug]/edit/        # Edit event (ownership-checked)
├── bookings/                  # My Bookings (session-aware or email lookup)
├── login/ register/           # Auth pages
├── api/
│   ├── auth/                   # NextAuth handler + registration endpoint
│   └── events/                 # Event CRUD, duplicate, status toggle, suggestions
├── sitemap.ts / robots.ts / opengraph-image.tsx
├── layout.tsx                 # Providers: Auth session, Theme, Toast, PostHog
└── proxy.ts (project root)    # Route protection + security headers

components/
├── ui/                        # ConfirmDialog, Toast, ToastProvider, SkipLink
├── forms/                      # EventForm (create/edit, shared)
├── dashboard/                   # EventsTable
├── bookings/                    # BookingsList, BookingSuccessCancelButton
└── (shared) Navbar, Footer, BookEvent, SearchBar, EventsFilterBar, Pagination, ...

database/
├── event.model.ts   booking.model.ts   user.model.ts
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- A MongoDB database (Atlas or local)
- A Cloudinary account (for image uploads)

### Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
# Required
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
AUTH_SECRET=          # generate with: npx auth secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional (sensible defaults / degrades gracefully)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Then:

```bash
npm run dev
```

Visit `http://localhost:3000`. Register an account and choose the **Organize events**
role to reach the dashboard and create events (an `admin` role has to be set directly
in the database — it's never self-assignable through registration).

### Scripts

```bash
npm run dev        # Start dev server (Turbopack)
npm run build       # Production build
npm run start        # Start production server
npm run lint          # Lint
npm run lint:fix       # Lint and auto-fix
```

---

## Known Limitations

- **Events created before auth existed have no owner.** They're treated as admin-only
  manageable rather than crashing; a real migration would backfill ownership for
  existing data.
- **In-memory rate limiting** only works within a single, long-running process — on a
  multi-instance serverless deployment, limits aren't shared across instances. Fine at
  this project's scale; a shared store (e.g. Upstash Redis) is the correct upgrade path
  at real scale.
- **CSP (Content-Security-Policy)** is deliberately left commented-out in `proxy.ts` —
  enabling it needs real-browser console verification against Cloudinary/PostHog/Next's
  own hydration scripts before shipping.
- **Light-mode color contrast** for a handful of status colors (toasts, confirmation
  dialogs, dashboard status badges) was chosen against the dark theme and hasn't been
  individually re-tuned for light backgrounds yet.

---

## Roadmap

- [x] Authentication + role-based authorization (Auth.js, JWT, `user`/`organizer`/`admin`)
- [x] Zod validation (client + server)
- [x] Error boundaries (`error.tsx`) + custom 404
- [ ] Structured logging (Pino)
- [ ] Unit/integration testing (Vitest + Playwright)
- [ ] Redis caching for hot data
- [ ] Docker
- [ ] CI/CD (GitHub Actions)
- [ ] Deployment (Vercel or similar)
