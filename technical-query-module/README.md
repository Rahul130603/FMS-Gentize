# Technical Query Management & Reporting System

A complete, production-ready **Technical Query Management System** built to
integrate into an existing File Management System (FMS) used by an
e-publishing company. Employees raise technical issues related to files or
software; admins triage, assign, resolve and permanently archive them. Every
query is retained forever and feeds a dedicated Reports module so the
company can search and analyze technical history for years to come.

Stack: **React (Vite) + Node.js/Express + PostgreSQL**.

---

## 1. What's included

```
technical-query-module/
├── database/
│   ├── schema.sql        Normalized schema, indexes, triggers, reporting views
│   └── seed.sql          ~220 realistic sample queries spanning 2 years
├── server/                Express REST API
│   └── src/
│       ├── config/        env + PostgreSQL pool
│       ├── middleware/     auth/RBAC, validation, upload (multer), error handling
│       ├── validations/    Joi schemas
│       ├── services/       business logic (queries, comments, attachments, audit, reports, search)
│       ├── controllers/    thin HTTP layer over services
│       ├── routes/         /api/technical-queries/*
│       └── uploads/        uploaded attachments land here (git-ignored)
└── client/                 React frontend
    └── src/
        ├── api/            axios client + endpoint wrappers
        ├── context/        Auth + Theme (dark mode) providers
        ├── hooks/          data-fetching hooks (list, detail, reports, debounce)
        ├── components/     reusable UI: DataTable, badges, charts, timeline, etc.
        ├── pages/employee/ Raise Query, My Queries, Query Details
        ├── pages/admin/    All Queries (+ status submenus), Query Detail + actions
        └── pages/reports/  Dashboard, Full Report, Employee/ISBN/Category/
                             Performance/Trend/Pending/Reopened reports, Global Search
```

Everything is real, working code — no placeholders. It has been run
end-to-end against a live PostgreSQL database with seed data: query
creation with file uploads, the full admin workflow (assign → priority →
resolve → reopen → close), comments, audit trail, all nine report
endpoints, Excel/CSV/PDF exports, and global full-text search all verified
working.

---

## 2. Database

### Schema highlights (`database/schema.sql`)

- **`technical_queries`** — the permanent record. Includes denormalized
  `raised_by_name/role`, `department`, `assigned_to_name` snapshots so
  history reads correctly even if an employee changes department or an
  admin account is later deactivated.
- **`technical_query_events`** — append-only audit log. Every mutation
  (assign, status change, resolve, reopen, comment, attachment...) writes
  a row here automatically from the service layer — never optional,
  never skippable by a controller.
- **`technical_query_comments`** — the visible discussion thread, with an
  `is_internal` flag for admin-only notes.
- **`technical_query_attachments`** — file metadata; binaries live on disk
  under `server/src/uploads/technical-queries/`.
- **Lookup tables** (`tq_categories`, `tq_priorities`, `tq_statuses`) keep
  the controlled vocabularies data-driven instead of hardcoded enums.
- **`tq_generate_query_number()`** — a year-scoped sequence function that
  produces `TQ-2026-000001` style numbers.
- **Reporting views** (`v_tq_with_resolution`, `v_tq_employee_summary`,
  `v_tq_isbn_summary`, `v_tq_admin_performance`) pre-shape the aggregates
  the Reports module needs so report endpoints stay simple and fast.
- Indexes cover every filter/sort combination the Admin grid and Reports
  screens use, plus a GIN full-text `search_vector` (auto-maintained by
  trigger) and trigram indexes for partial/fuzzy matches on query number
  and subject — this is what keeps global search fast even after years of
  accumulated rows.

### Setting it up

```bash
createdb fms_technical_queries          # or reuse the existing FMS database
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql   # optional: ~220 sample queries for demo/testing
```

If the host FMS already has `users` and `departments` tables, skip creating
the compatibility stubs at the top of `schema.sql` (they're wrapped in
`CREATE TABLE IF NOT EXISTS` specifically so this is safe either way) and
make sure the existing tables expose at minimum: `id`, `full_name`, `role`,
`department_id` → `departments.name`.

---

## 3. Backend (`server/`)

```bash
cd server
cp .env.example .env      # point DATABASE_URL at your database
npm install
npm run dev                # nodemon, http://localhost:4000
```

### Integrating into the existing FMS Express app

The whole module is one mountable router:

```js
const technicalQueryRouter = require('./technical-query-module/server/src/routes');
app.use('/api/technical-queries', technicalQueryRouter);
```

That single line adds every endpoint below (queries, comments,
attachments, reports, search, meta/lookups).

### Authentication hook-in

`server/src/middleware/auth.js` is the one integration point. If the host
FMS already authenticates requests upstream and attaches
`req.user = { id, name, role, department }` before this router runs,
`authenticate` is a no-op pass-through — nothing else to change. A
standalone JWT verifier is included as a fallback/demo path (see
`controllers/devAuthController.js`, mounted only outside production at
`/api/dev-auth`) so the module can be run and evaluated on its own.

### REST API reference

All routes are relative to `/api/technical-queries` and require
authentication. Admin-only routes require `role` in (`admin`,
`super_admin`).

| Method | Path | Description |
|---|---|---|
| POST | `/` | Raise a technical query (multipart, `attachments[]`) |
| GET | `/` | List (server-side filter/sort/paginate); employees auto-scoped to their own |
| GET | `/:id` | Full detail: record + timeline + comments + attachments |
| PATCH | `/:id/assign` | *(admin)* Assign to an admin |
| PATCH | `/:id/priority` | *(admin)* Change priority |
| PATCH | `/:id/status` | *(admin)* Generic status change |
| PATCH | `/:id/admin-notes` | *(admin)* Update internal notes |
| POST | `/:id/request-info` | *(admin)* Request more info from employee |
| POST | `/:id/resolve` | *(admin)* Resolve with resolution notes |
| POST | `/:id/close` | *(admin)* Close a resolved query |
| POST | `/:id/reopen` | *(admin)* Reopen a resolved/closed query |
| POST | `/:id/archive` | *(admin)* Archive |
| GET/POST | `/:id/comments` | List / add a comment (`isInternal` admin-only) |
| GET/POST | `/:id/attachments` | List / upload additional attachments |
| GET | `/:id/attachments/:attachmentId/download` | Download one file |
| GET | `/:id/attachments/download-all` | Download all as `.zip` |
| GET | `/reports/dashboard` | *(admin)* Summary cards |
| GET | `/reports/employee/:employeeId` | *(admin)* Employee report |
| GET | `/reports/isbn?isbn=` | *(admin)* ISBN report |
| GET | `/reports/category-analytics` | *(admin)* Category totals + 12-month trend |
| GET | `/reports/resolution-performance` | *(admin)* Per-admin performance |
| GET | `/reports/trend?period=daily\|weekly\|monthly\|quarterly\|yearly` | *(admin)* Trend + period-over-period comparison |
| GET | `/reports/pending` | *(admin)* Aging buckets + overdue urgent/high |
| GET | `/reports/reopened` | *(admin)* Every reopened query |
| GET | `/reports/export?format=excel\|csv\|pdf` | *(admin)* Export filtered results |
| GET | `/reports/export/complete?format=` | *(admin)* Export the entire table |
| GET | `/reports/export/query/:id?format=` | Export a single query |
| GET | `/search?q=` | Global full-text search (query #, ISBN, employee, subject, description, category, admin, comments, resolution notes) |
| GET | `/meta/lookups` | Categories/priorities/statuses/admins/departments for dropdowns |
| GET | `/meta/employees` | Employee list for filters |

---

## 4. Frontend (`client/`)

```bash
cd client
cp .env.example .env       # VITE_API_BASE_URL=/api (or point at standalone backend)
npm install
npm run dev                 # http://localhost:5173
```

### Integrating into the existing FMS SPA

- Copy `src/pages`, `src/components`, `src/hooks`, `src/api`,
  `src/context/ThemeContext.jsx` and `src/constants` into the host app (or
  keep them in this subfolder and alias-import — either works, nothing is
  tightly coupled to this Vite project's structure beyond relative imports).
- Wire `AuthContext` (`src/context/AuthContext.jsx`) to the host app's real
  session — it only ever reads `user.id/.name/.role/.department`. The file
  has a comment block at the top explaining the two supported approaches.
- Add the sidebar entries from `src/components/layout/Sidebar.jsx` into the
  host app's existing sidebar (an "Technical Query" item for employees, a
  "Technical Queries" section with status submenus + a "Technical Query
  Reports" section for admins — the menu structure exactly matches the
  spec).
- Add the routes from `src/routes/AppRoutes.jsx` into the host app's router.
- Tailwind's `darkMode: 'class'` strategy is used throughout — toggle the
  `dark` class on `<html>` from the host app's existing theme switcher, or
  keep using `ThemeContext`.

### Notable implementation details

- **DataTable** is one reusable, server-driven grid component — sorting,
  pagination and filtering never happen client-side, so the grid stays
  fast no matter how many years of queries accumulate.
- **Downloads/exports** go through authenticated `axios` blob requests
  (not plain `<a href>` links), since every download endpoint requires the
  bearer token.
- **Global search snippets** are highlighted safely: the backend wraps
  matches with control-character delimiters (not raw `<b>` tags), and
  `HighlightSnippet.jsx` splits on them to render plain React text nodes —
  this avoids ever needing `dangerouslySetInnerHTML` on employee-authored
  text, which would otherwise be a stored-XSS vector in admin search results.
- Charts (Recharts) cover every chart the spec calls for: pie (category
  distribution), bar (resolved vs. pending, by category/admin), and line
  (12-month category trend, period-over-period trend comparison).
- Dark mode, skeleton loaders, empty states, breadcrumbs and status/priority
  badges are shared components used identically across every screen.

---

## 5. Demo credentials (standalone mode only)

`database/seed.sql` creates these users; the demo login screen
(`/login`, backed by `/api/dev-auth/login`) lists them all:

| Employee Code | Name | Role |
|---|---|---|
| EMP-1001 … EMP-1008 | various | employee |
| ADM-2001 | Vikram Malhotra | admin |
| ADM-2002 | Sunita Iyer | admin |
| ADM-2003 | Karan Chopra | super_admin |

Remove `devAuthRoutes`/`LoginDemo.jsx` (or simply don't mount them) once
wired into the real FMS's own authentication.

---

## 6. Design decisions worth knowing about

- **Nothing is ever hard-deleted.** Close/Archive are just status values;
  the full row, its attachments, comments and audit trail stay in the
  database permanently — this is what makes the Reports module a real
  long-term knowledge base rather than a ticketing system that loses
  history.
- **RBAC is enforced server-side**, not just hidden in the UI — an
  employee's query list is force-scoped to `raised_by_id = self` inside
  `queryService.listQueries`, regardless of query-string tampering.
- **Every admin action writes an audit event** from the service layer
  (`auditService.logEvent`), so there's no code path that mutates a query
  without leaving a trail.
- `admin_notes` is intentionally surfaced on both the employee and admin
  detail views per the spec's own "Query Details" field list, while
  internal-only *comments* (`is_internal = true`) remain hidden from
  employees — that's the one place the spec's employee-facing field list
  and typical enterprise practice needed reconciling, and this is the
  compromise: an explicit admin note field is shared, but the internal
  discussion thread stays private.
