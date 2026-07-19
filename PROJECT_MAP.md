# PROJECT_MAP.md — Simple CRM for Small Moroccan Businesses

> **Status:** M6 Complete  
> **Date:** 2026-07-18  
> **Scope Lock:** Customer → Quotation → Follow-up → Invoice → Payment. Nothing outside this chain is in scope.

---

## [TECH_STACK]

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | ^16.x | App Router, Server Actions only — no custom API routes |
| Language | TypeScript | ^5.x | Strict mode enabled |
| Styling | TailwindCSS | ^4.x | Utility-first; no custom design system |
| UI Components | shadcn/ui | latest | Installed per-component via CLI, not as a package |
| ORM | Prisma | ^7.1.0 | `output` path required in Prisma 7; generate to `src/generated/prisma` |
| Database (prod) | Neon PostgreSQL | serverless | Connection pooling via Neon's built-in proxy |
| Database (dev) | PostgreSQL | ^16 | Local via Docker |
| Auth | Better Auth | latest | Email/password only; no OAuth for MVP |
| Validation | Zod | ^3.x | Client + server; schemas co-located with Server Actions |
| Email | Resend | latest | Quotation PDF attachment delivery |
| PDF Generation | `@react-pdf/renderer` | latest | Server-side rendering of quotation/invoice PDFs |
| Deployment | Vercel | — | Edge-compatible Server Actions; environment vars via Vercel dashboard |
| Package Manager | pnpm | latest | Recommended for monorepo readiness |

**Deprecated / Rejected:**
- ❌ NextAuth / Auth.js — replaced by Better Auth
- ❌ Custom API routes (`/api/*`) — Server Actions cover all mutations
- ❌ Drizzle ORM — Prisma retained per spec; team already chose it
- ❌ Any charting library — not in MVP scope

---

## [SYSTEM_FLOW]

### User Journey (Single Owner Role)

```
[Login]
   │
   ▼
[Dashboard]  ←─────────────────────────────────────────┐
   │                                                    │
   ├──► [Customers]                                     │
   │       └── Create / View / Edit / Search            │
   │                                                    │
   ├──► [Quotations]                                    │
   │       ├── Create (linked to Customer)              │
   │       ├── Add Line Items (auto-calc subtotal/tax)  │
   │       ├── Generate PDF                             │
   │       ├── Send via Email (Resend) or WhatsApp link │
   │       ├── Update Status (Draft→Sent→Accepted…)     │
   │       ├── Set Follow-up Date                       │
   │       └── Convert to Invoice ──────────────────┐  │
   │                                                │  │
   ├──► [Invoices]  ◄───────────────────────────────┘  │
   │       ├── View (pre-filled from Quotation)         │
   │       ├── Record Payment                           │
   │       └── Update Status (Unpaid→Partial→Paid)      │
   │                                                    │
   └──► [Global Search] ──────────────────────────────►┘
```

### Data Flow (Server Actions)

```
Browser (React Client Component)
   │  calls
   ▼
Server Action  (app/actions/*.ts)
   │  validates via
   ├── Zod schema
   │  queries via
   ├── Prisma Client → Neon PostgreSQL
   │  returns
   └── { success, data } | { error, fieldErrors }
```

### PDF Generation Flow

```
Server Action: generateQuotationPDF(id)
   │
   ├── Fetch quotation + items + customer from DB
   ├── Render <QuotationDocument /> with @react-pdf/renderer (server-side)
   ├── Return Buffer / Blob
   └── Serve as download OR attach to Resend email
```

### WhatsApp Flow (No API)

```
Button click → construct URL:
https://wa.me/{customerWhatsApp}?text={encodeURIComponent(message)}
→ window.open() in new tab
```

---

## [ARCHITECTURE]

### Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + auth guard
│   │   ├── page.tsx                ← Dashboard
│   │   ├── customers/
│   │   │   ├── page.tsx            ← list + search + pagination
│   │   │   └── [id]/page.tsx       ← detail + edit
│   │   ├── quotations/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── search/page.tsx
│   └── api/
│       └── pdf/[id]/route.ts       ← PDF stream endpoint (GET only)
├── actions/                        ← all Server Actions
│   ├── customers.ts
│   ├── quotations.ts
│   ├── invoices.ts
│   └── payments.ts
├── components/
│   ├── ui/                         ← shadcn/ui auto-generated
│   ├── shared/                     ← genuinely reused: DataTable, StatusBadge, PageHeader
│   └── pdf/
│       └── QuotationDocument.tsx   ← @react-pdf/renderer template
├── lib/
│   ├── auth.ts                     ← Better Auth config
│   ├── db.ts                       ← Prisma singleton
│   ├── email.ts                    ← Resend client wrapper
│   └── logger.ts                   ← async logger (see Logging)
├── schemas/                        ← Zod schemas (shared client+server)
│   ├── customer.ts
│   ├── quotation.ts
│   ├── invoice.ts
│   └── payment.ts
├── generated/
│   └── prisma/                     ← Prisma client output (Prisma 7 requirement)
└── prisma/
    └── schema.prisma
```

### Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  // Better Auth manages session/account tables separately
}

model Customer {
  id            String      @id @default(cuid())
  companyName   String
  contactPerson String?
  phone         String?
  whatsapp      String?
  email         String?
  address       String?
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  quotations    Quotation[]
}

model Quotation {
  id               String          @id @default(cuid())
  quoteNumber      String          @unique
  customerId       String
  customer         Customer        @relation(fields: [customerId], references: [id])
  status           QuotationStatus @default(DRAFT)
  currency         String          @default("MAD")
  date             DateTime
  expirationDate   DateTime?
  notes            String?
  lastFollowUpDate DateTime?
  nextFollowUpDate DateTime?
  items            QuotationItem[]
  invoice          Invoice?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}

model QuotationItem {
  id          String    @id @default(cuid())
  quotationId String
  quotation   Quotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  name        String
  description String?
  quantity    Decimal
  unitPrice   Decimal
  discount    Decimal   @default(0)
  tax         Decimal   @default(0)
  total       Decimal   // computed and stored on save
}

model Invoice {
  id          String        @id @default(cuid())
  quotationId String        @unique
  quotation   Quotation     @relation(fields: [quotationId], references: [id])
  status      InvoiceStatus @default(UNPAID)
  totalAmount Decimal
  paidAmount  Decimal       @default(0)
  payments    Payment[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Payment {
  id            String        @id @default(cuid())
  invoiceId     String
  invoice       Invoice       @relation(fields: [invoiceId], references: [id])
  date          DateTime
  amount        Decimal
  method        PaymentMethod
  notes         String?
  createdAt     DateTime      @default(now())
}

enum QuotationStatus { DRAFT SENT PENDING ACCEPTED REJECTED EXPIRED }
enum InvoiceStatus   { UNPAID PARTIALLY_PAID PAID }
enum PaymentMethod   { CASH BANK_TRANSFER CHECK OTHER }
```

### Shared/Core Layer (Reused Only)

| Component / Util | Used By | Justification |
|---|---|---|
| `<DataTable>` | Customers, Quotations, Invoices | Identical search+sort+pagination pattern |
| `<StatusBadge>` | Quotations, Invoices | Same pill-style rendering |
| `<PageHeader>` | All list pages | Title + CTA button slot |
| `lib/db.ts` | All Server Actions | Prisma singleton |
| `lib/logger.ts` | All Server Actions | Async logging |
| Zod schemas in `schemas/` | Actions + client forms | Single source of truth |

> No other abstractions. Each module owns its own components.

---

## [LOGGING] — Safe Logging (Protocol 4)

Non-blocking, asynchronous, no performance impact on the request cycle.

```ts
// lib/logger.ts
type Level = 'info' | 'warn' | 'error'

export function log(level: Level, message: string, meta?: object) {
  // Fire-and-forget: does not await, does not block Server Action response
  Promise.resolve().then(() => {
    console[level](`[${level.toUpperCase()}] ${new Date().toISOString()} — ${message}`, meta ?? '')
  })
}
```

Usage in Server Actions:
```ts
log('info', 'Quotation created', { id, customerId })
log('error', 'PDF generation failed', { id, error: err.message })
```

Rules:
- Only `info`, `warn`, `error` — no `debug` in production
- Never log PII (customer emails, phone numbers)
- Errors shown to users are generic; original error goes to logger only

---

## [MILESTONES] — Verifiable Goals

### M1 — Auth + Shell (Goal: Owner can log in and see empty dashboard)
- [x] Next.js project scaffold with TypeScript + Tailwind v4 + shadcn/ui
- [x] Better Auth configured (email/password, forgot-password)
- [x] Prisma schema + Neon connection verified
- [x] Protected dashboard layout with sidebar

### M2 — Customers (Goal: Create a customer in under 30 seconds)
- [x] Customer CRUD via Server Actions
- [x] Customer list with search, sort, pagination
- [x] Zod validation on all fields
- [x] User-friendly error messages (no server leaks)

### M3 — Quotations (Goal: Create a quotation in under 2 minutes)
- [x] Quotation form with dynamic line items + auto-calculation
- [x] Status management (Draft → Sent → Accepted / Rejected / Expired)
- [x] Follow-up date fields stored and surfaced on dashboard
- [x] Quote number auto-generation (e.g. `QT-2026-0001`)

### M4 — PDF + Sharing (Goal: Generate PDF and share via WhatsApp or Email)
- [x] `QuotationDocument` template with logo, company info, items, totals, terms
- [x] `/api/pdf/[id]` stream endpoint
- [x] Resend integration — send PDF as email attachment
- [x] WhatsApp link button with prefilled message

### M5 — Invoices + Payments (Goal: Convert quotation → invoice in 1 click; track payment)
- [x] "Convert to Invoice" Server Action (no data re-entry)
- [x] Payment recording with method + amount + notes
- [x] Auto-update invoice balance and status (Unpaid → Partial → Paid)

### M6 — Dashboard + Search (Goal: View all business activity from one screen)
- [x] Summary cards: Customers, Pending Quotes, Accepted Quotes, Revenue
- [x] Follow-up alert: quotations where `nextFollowUpDate <= today`
- [x] Global search across Customers, Quotations, Invoices

---

## [ORPHANS & PENDING]

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Company settings (logo, name, address for PDF header) | ⚠️ Unspecified | Needed before M4. Suggest a simple `Settings` page with a single `CompanyProfile` DB row. |
| 2 | Quote number format | ⚠️ Unspecified | Auto-generate as `QT-YYYY-NNNN`; confirm with owner. |
| 3 | Currency handling | ⚠️ Partial | Spec says "Currency" field on quotation. Assume MAD default; no FX conversion needed. |
| 4 | PDF library choice | ⚠️ Confirm | `@react-pdf/renderer` recommended (server-safe). Confirm it renders Arabic/French text correctly if localization is added post-MVP. |
| 5 | `InvoiceItems` table | ⚠️ Omitted in spec | Spec lists it as a DB table but no item-level invoice editing is described. Copy from `QuotationItems` on conversion; no separate edit. |
| 6 | User creation flow | ⚠️ Manual only | Spec says "no registration page, users created manually." Need a seed script or Prisma Studio workflow documented. |
| 7 | Error boundary strategy | ⏳ Pending | Next.js `error.tsx` per segment; define once in M1 shell. |
| 8 | Locale / RTL | 🚫 Out of scope | Post-MVP. Do not add i18n infrastructure now. |

---

*Await approval before implementation begins.*
