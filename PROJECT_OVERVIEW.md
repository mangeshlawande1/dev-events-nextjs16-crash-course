# Dev Event — Project Overview

## What it is

**Dev Event** is a full-stack SaaS-style events platform for discovering, creating, and
managing developer conferences, hackathons, and meetups. Built as a production-quality
Next.js 16 App Router application with role-based multi-tenancy: **attendees** browse and
book events (no account required), **organizers** create and manage their own events
through a scoped dashboard, and **admins** oversee the entire platform.

It's not a CRUD tutorial app — it implements the concerns a real SaaS product needs:
authentication and authorization, ownership-scoped data access, rate limiting, structured
SEO, accessibility, dark/light theming, analytics, and defense-in-depth security at the
API, page, and middleware layers.

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript (strict mode)
- Tailwind CSS v4 (custom design tokens, dark/light theming)
- React Hook Form + Zod (schema-validated forms)
- next-themes (persisted theme toggle)

**Backend / Data**
- MongoDB + Mongoose (repository → service → route/page layered architecture)
- Auth.js (NextAuth v5) — Credentials provider, JWT sessions, role-based access control
- Zod (shared client/server validation schemas)
- Cloudinary (image uploads)
- bcryptjs (password hashing)

**Platform / Infrastructure**
- Edge Middleware (`proxy.ts`) — route protection + security headers, split Edge/Node-safe auth config
- Centralized environment validation (fail-fast, scoped by concern)
- In-memory rate limiting (booking/event-creation abuse prevention)
- PostHog (product analytics)
- Dynamic OG image generation, JSON-LD structured data, sitemap/robots automation

**Code Quality**
- ESLint + TypeScript strict checks enforced on every change
- Consistent API response contracts (shared success/error helpers)
- Ongoing: structured logging (Pino), Docker, CI/CD (GitHub Actions)

---

## Key Features

**Discovery & Booking**
- Server-side search, filtering (location/mode/tag), and sorting (latest/upcoming/most-booked)
- Typeahead search suggestions; "Trending Events" (recent booking-velocity ranking)
- Guest booking (email-only, zero friction) *or* one-click booking for logged-in users
- Capacity limits, registration deadlines, overbooking prevention
- Cancellable bookings; dedicated booking-confirmation page

**Organizer Tools**
- Full event CRUD (create/edit/duplicate/delete) with Cloudinary image pipeline
- Draft/Published workflow
- Ownership-scoped dashboard — organizers see only their own events; admins see everything
- Duplicate-slug prevention, ownership enforcement at the API *and* page level (can't even load another organizer's event into an edit form)

**Platform-Level Engineering**
- Role-based authorization (`user` / `organizer` / `admin`) enforced in Edge middleware, not just UI-hidden
- Split Edge-safe / Node-only auth config (Mongoose can't run in Edge middleware — a real architectural constraint this project solves correctly)
- Analytics dashboard (bookings over time, popular events, category distribution)
- Full accessibility pass (focus states, skip links, semantic landmarks, keyboard navigation)
- SEO: per-page metadata, Open Graph/Twitter cards, dynamic sitemap, JSON-LD event markup

---

## Resume Bullet Points (ready to use)

- Built a full-stack event management SaaS platform with **Next.js 16 App Router**, **TypeScript**, and **MongoDB**, implementing role-based authorization (attendee/organizer/admin) enforced at the Edge middleware, API, and page layers
- Designed and shipped a **Credentials-based auth system** (Auth.js/NextAuth v5) with a split Edge/Node-safe configuration to work around Mongoose's incompatibility with Edge Runtime middleware
- Implemented ownership-scoped multi-tenant data access, ensuring organizers can only manage their own events while admins retain full platform oversight
- Built server-side search, filtering, sorting, and a recency-weighted "trending" ranking algorithm using MongoDB aggregation pipelines
- Engineered a guest-friendly booking flow (no account required) alongside authenticated one-click booking, balancing conversion friction against account security
- Added production-readiness layers: centralized environment validation, in-memory rate limiting, standardized API response contracts, and structured logging (in progress)
- Drove a full accessibility and SEO pass: semantic landmarks, keyboard navigation, dynamic OG images, JSON-LD structured data, and an automated sitemap

---

## Architecture Notes (for interviews)

- **Layered data access**: `repository` (raw Mongoose queries) → `service` (business logic, cross-cutting concerns) → `route handler` / `page` (presentation). Keeps DB concerns out of components and API routes thin.
- **Edge vs. Node split**: `lib/auth.config.ts` (Edge-safe, no DB) is used by `proxy.ts` middleware; `lib/auth.ts` (full config with the Mongoose-backed Credentials provider) is used only by the Node-runtime API route. This is a real, non-obvious Next.js architectural constraint, not a style choice.
- **Ownership as a first-class concern**: a shared `canManageEvent()` helper is the single source of truth for "can this session touch this event," enforced independently at the API route (defense against direct calls), the edit page (defense against even *loading* someone else's data), and the dashboard listing (defense against ever seeing it in the first place).
