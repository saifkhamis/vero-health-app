# Vero Health — Appointment Booking System

A full-stack patient appointment booking application built with Next.js 14, Prisma, and SQLite.

## Quick Start

```bash
npm install
npm run setup
npm run dev
```

Open http://localhost:3000

## What I Built

Vero Health is a patient-facing and staff-facing appointment booking system designed for a healthcare startup. The application covers the complete patient journey from physician selection to appointment confirmation, as well as a real-time admin dashboard for care team staff.

The patient booking flow is a three-step wizard: patients first browse and select a physician from a responsive card grid, then choose an available time slot (grouped by date, with booked slots hidden entirely), then fill out a structured intake form with inline validation before submitting. On success, patients see a confirmation page with their booking details and a "pending" status badge to set expectations correctly.

The admin dashboard gives staff a live view of all appointments with summary stat cards, filterable by status and physician. Status transitions (pending → confirmed, pending/confirmed → cancelled) are applied in real time via `PATCH /api/bookings/[id]` with optimistic local state updates — no full page reload required. The dashboard includes a "Last updated" timestamp that refreshes on every status action.

## Key Technical Decisions

**1. Next.js App Router — one repo, one server, one `npm run dev`**
Using the App Router means the API routes, server components, and client pages all live in one codebase with a single dev server. For a two-sided app (patient portal + admin dashboard) this eliminates the need for a separate backend service, keeps the deployment footprint minimal, and makes the data flow obvious — a meaningful advantage at assessment scale where setup friction matters.

**2. SQLite + Prisma — why not Supabase or hosted Postgres for this scope**
A hosted database introduces external dependencies, environment variables, connection limits, and network latency into a local-first assessment. SQLite runs in-process with zero infrastructure, and Prisma gives us type-safe queries, automatic migrations, and a seed workflow with no trade-offs at this data volume. The schema can be migrated to Postgres by changing a single `provider` line if the project ever needs to scale.

**3. Structured reason-for-visit dropdown — clinical intake thinking over free text**
Free-text reason fields produce noisy, unstandardised data that's expensive to act on. A controlled vocabulary of nine common visit types gives the care team enough signal to triage and route appointments without adding friction for most patients. The enum is shared between the client-side form and the server-side validation so the set of valid values is defined once and can't drift.

**4. Slot-locking on booking — the race condition guard and why it matters**
The `POST /api/bookings` handler uses a Prisma transaction to check `isBooked`, set it to `true`, and create the booking atomically. Without this, two concurrent submissions for the same slot would both pass the availability check and create a double-booking — a serious problem in a clinical context. The API returns a descriptive 400 if the slot was taken between the patient selecting it and submitting the form.

**5. Client-side filtering in admin — why appropriate at this data scale**
The admin dashboard fetches all bookings once and filters them in React state. This is intentional: at the expected data volume (hundreds of bookings), the payload is small, filtering is instant, and it means the "Last updated" timestamp and stat cards stay consistent without additional round-trips. A production system with thousands of bookings would push filtering to the database via query params, which the `GET /api/bookings?status=` endpoint already supports as a foundation.

## What I Would Improve With More Time

**1. Authentication**
The application currently has no authentication, which is appropriate for an MVP. A production system would use NextAuth.js with three roles: `patient` (can create bookings, view their own), `clinician` (can view and manage bookings for their assigned patients), and `admin` (full dashboard access). Session tokens would be stored server-side, and every API route would verify the session and enforce role-based access before touching the database.

**2. Real availability management**
The current seed data creates static slots. A real system would need physician schedule templates (e.g., "available Mon–Fri, 9 AM–5 PM with 30-minute slots"), automatic slot generation on a rolling window, buffer time between appointments to allow for running late, and the ability for physicians or coordinators to block time off. This would likely become its own data model with recurrence rules.

**3. Notifications**
Two notification trigger points matter most: (1) on booking creation — send the patient a confirmation email with their booking ID and a calendar invite, and (2) on status change to `confirmed` or `cancelled` — send an update. Email would be handled via Resend (simple API, great deliverability) and SMS via Twilio for patients who prefer it. A simple `notifications` table would log every message sent with status, enabling retry logic and debugging.

**4. Audit trail**
In a healthcare context, every status change should be logged with timestamp, actor (user ID), previous state, and new state. This is both a compliance requirement and a practical debugging tool — if a booking was incorrectly cancelled, staff need to know who did it and when. A `BookingEvent` table appended to on every `PATCH` would satisfy this, and Prisma middleware could automate the logging transparently.

**5. Optimistic UI updates**
The admin table currently waits for the `PATCH` response before updating the row. A better UX would apply the status change immediately in local state and roll back on failure. The tradeoff was simplicity and correctness — it's easy to accidentally orphan optimistic state when errors happen, so for this scope waiting for the server response was the right call. The pattern is well-understood and could be added with `useOptimistic` in React 19 or a simple local state rollback pattern.

**6. Timezone handling**
The application stores dates as `YYYY-MM-DD` strings and times as `"9:00 AM"` strings with no timezone information. This works correctly when the server and client are in the same timezone (typical for a local SQLite setup), but would produce incorrect displays in a multi-timezone deployment. The fix is to store all times as UTC ISO strings and convert to the user's local timezone on render using `date-fns-tz`. The Prisma schema change is minimal; the rendering change requires threading timezone context through the component tree.

## Product Decisions Worth Noting

Three intentional UX choices shaped the patient and clinician experience. First, the reason-for-visit dropdown exists because structured intake data is more actionable than free text — a physician glancing at their schedule for the day can immediately triage a "New Symptom / Illness" differently from a "Prescription Refill," which would be impossible with unstructured notes. Second, all new bookings start as "pending" rather than auto-confirming because it mirrors how real clinical scheduling works: front desk staff review requests before confirming, which protects the physician's time and gives the practice control over their schedule. Third, the confirmation message says "your request has been submitted" rather than "your appointment is confirmed" to set accurate expectations — telling a patient their appointment is confirmed when it's actually pending review erodes trust the moment they receive a follow-up correction.
