# GitHub Copilot Instructions

These guidelines teach Copilot the conventions of this **Node.js + TypeScript monorepo** so completions respect the existing architecture and path‑alias style imports.

---

## 1 Overview

| Package    | Tech stack                        | Build tool |
| ---------- | --------------------------------- | ---------- |
| **server** | Express + TypeScript (ESM)        | esbuild    |
| **client** | React + TypeScript + Tailwind CSS | Vite       |
| **shared** | Type‑only helpers & Zod schemas   | –          |

The backend uses **Drizzle‑ORM** with PostgreSQL. All table definitions live in the shared package and are re‑exported for easy import throughout the codebase.

---

## 2 Directory structure

```text
shared/
  constants.ts                  // universal constants
  schemas/
    db/                         // Drizzle table definitions (one file per feature)
      users.ts                  // const usersSchema = pgTable(...)
      bookings.ts               // const bookingsSchema = pgTable(...)
      …
      index.ts                  // re‑exports every table
    validation/                 // Zod schemas & TS types created via drizzle‑zod
      users.ts
      bookings.ts
      …
server/
  middleware/
    auth.ts                     // isAuthenticated, hasRole()
  storage/                      // data‑access layer (Drizzle queries only)
    users-storage.ts
    bookings-storage.ts
    …
  services/                     // business logic, **no raw SQL**
    users-service.ts
    bookings-service.ts
    …
  routes/
    admin/                      // protected routes
    public/                     // public API
    integrations/               // OAuth callbacks
client/
  src/
    pages/                      // one page per feature (linked in sidebar)
    components/                 // shared + feature widgets; favour **cards** over tables
    hooks/                      // ⚡ React‑Query hooks that use axios
      useBookings.ts
      useCreateBooking.ts
      …
```

### 2.1 Import paths

We use **TypeScript path aliases** instead of relative imports:

```ts
import { bookings } from "@shared/schemas/db/bookings";
import { createBooking } from "@server/storage/bookings-storage";
import { useBookings } from "@client/hooks/useBookings";
```

Aliases are defined in the root `tsconfig.json`:

```jsonc
{
  "paths": {
    "@server/*": ["server/*"],
    "@client/*": ["client/src/*"],
    "@shared/*": ["shared/*"],
  },
}
```

---

## 3 Layering rules

1. **Storage (@server/storage)**

   - Import tables from **@shared/schemas/db** and the DB instance from `@server/services/database-service`.
   - Expose CRUD helpers (`list`, `findById`, `create`, `update`, `remove`).
   - Use Drizzle's query‑builder—**never raw SQL**.

2. **Services (@server/services)**

   - Combine multiple storage helpers.
   - Own all domain logic (conflict checks, transactions, external API calls).
   - Throw meaningful `Error` subclasses (e.g. `ForbiddenError`).

3. **Routes (@server/routes)**

   - Keep thin: validate → call service → format response.
   - `/admin/**` **must** be wrapped with `isAuthenticated` then `hasRole('admin')`.

4. **Validation (@shared/schemas/validation)**

   - Generate via **drizzle‑zod** (`createInsertSchema` / `createSelectSchema`).
   - Do **not** duplicate validation inside routes.

5. **Client pages/components**

   - Data fetching lives in **React‑Query hooks inside `hooks` folder**.
   - Hooks use a shared **axios** instance to call the server.
   - Represent collections with responsive **cards** instead of tables wherever possible.

---

## 4 Naming & Style

- Files: `kebab-case` (`bookings-storage.ts`).
- Database table definitions: Always suffix with `Schema` (e.g., `usersSchema = pgTable(...)`, `bookingsSchema = pgTable(...)`).
- Default export React components; named exports everywhere else.
- Dates → UTC in DB, converted in client via `date-fns-tz`.
- ESLint & Prettier enforced (`eslint.config.js`).

---

## 5 Testing hints for Copilot

- **Vitest** for server unit tests (`server/__tests__`). Provide a `dbMock` fixture.
- **@testing-library/react** & **msw** for client.
- Place mocks inside `__mocks__` next to the unit under test.

---

## 6 Common Copilot pitfalls to avoid

- Forgetting to add new tables to `@shared/schemas/db/index.ts` re‑export.
- Writing SQL strings in a service — move queries to storage.
- Bypassing authentication middleware on admin routes.
- Mutating returned objects from storage — return copies instead.

---

## 7 Quick templates

### Storage

```ts
import { db } from "@server/services/database-service";
import { bookings } from "@shared/schemas/db/bookings";
import { NewBooking } from "@shared/schemas/validation/bookings";

export async function createBooking(data: NewBooking) {
  return db.insert(bookings).values(data).returning();
}
```

### Service

```ts
import * as bookingsStorage from "@server/storage/bookings-storage";
import { checkOverlap } from "@server/utils/time";

export async function bookElevator(input: NewBookingSchema) {
  const overlapping = await bookingsStorage.listForSlot(input.slotId);

  if (checkOverlap(overlapping, input)) {
    throw new BookingConflictError();
  }

  return bookingsStorage.createBooking(input);
}
```

### Route

```ts
import { NewBooking } from "@shared/schemas/validation/bookings";
import { isAuthenticated, hasRole } from "@server/middleware/auth";
import * as bookingService from "@server/services/bookings-service";
import { zodValidator } from "@server/utils/http";

router.post(
  "/book",
  isAuthenticated,
  hasRole("admin"),
  zodValidator(NewBooking),
  async (req, res) => {
    const booking = await bookingService.bookElevator(req.body);
    res.status(201).json(booking);
  },
);
```

---

**Happy coding 🚀**
