FMS Due Date Delivery & Project Health Management Module
==========================================================

An enterprise-style "Delivery Control Center" for tracking publishing projects
from Scanning through Final Delivery: role-based dashboards, a due-date
calendar, a full delivery report grid, per-audience reports (due
today/tomorrow/upcoming/overdue/completion/employee/manager/department),
an automatic project health & risk engine, a rule-based smart-recommendation
engine, an activity timeline/audit log, in-app notifications, an analytics
dashboard, and CSV/Excel/PDF export.

Backend: backend/
Frontend: frontend/

No database server to install - the backend stores data in a local SQLite
file (backend/data/fms_delivery.sqlite), created automatically on first run.

--------------------------------------------------------
1. Install dependencies
--------------------------------------------------------
   cd backend && npm install
   cd ../frontend && npm install

--------------------------------------------------------
2. Seed sample data (users + ~30 projects across every due-date bucket)
--------------------------------------------------------
   cd backend
   npm run seed

   This creates backend/data/fms_delivery.sqlite and fills it with sample
   users and projects. All seeded users share the password: password
     alice@acme.com   - Admin      (full access)
     maya@acme.com    - Manager    (POD team)
     ravi@acme.com    - Manager    (EPUB team)
     helen@acme.com   - HR         (reports & analytics only)
     john@acme.com, priya@acme.com, sam@acme.com, dana@acme.com, omar@acme.com
                      - Employee   (sees only projects assigned to them)

--------------------------------------------------------
3. Run
--------------------------------------------------------
   cd backend  && npm run dev     (http://localhost:5000)
   cd frontend && npm run dev     (http://localhost:3000, proxies /api to :5000)

   Or just double-click run-dev.bat from the project root, which starts
   both dev servers and opens the browser for you.

--------------------------------------------------------
Notes / where this simplifies "enterprise-grade"
--------------------------------------------------------
- Database is SQLite, not a client/server database - no Docker or Postgres
  install required. Swap backend/src/ormconfig.ts for a `postgres` or
  `mysql` DataSource later if this needs to run on a shared server instead
  of a single machine.
- Notifications are in-app records (bell + acknowledge), not email/SMS/push.
  An hourly server-side sweep (backend/src/services/alert.service.ts) raises
  due-today/due-tomorrow/overdue/low-health/missed-milestone notifications.
- PDF/Excel/CSV export use pdfkit/exceljs with a clean tabular layout rather
  than a pixel-perfect branded template.
- Role-based access is enforced both in the UI (nav/actions hidden) and in
  the API (every route checks the JWT-derived role; Employees are scoped to
  their own assigned projects, Managers to projects where they're the
  manager, Admin/HR see everything).
- Health score, risk level, and workflow-stage weighting follow the exact
  bands described in the module spec (backend/src/utils/healthScore.ts).
