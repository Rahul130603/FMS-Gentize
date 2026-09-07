# DELIVERY PRODUCTION COUNT — Full-Stack Monitoring Dashboard

A production-grade delivery and dispatch tracking dashboard built with **React 18**, **Vite**, **Tailwind CSS**, **ApexCharts**, **Lucide Icons**, and an **Express.js** REST API backend with JSON/Database connectivity.

Designed to match the UI typography (`Inter`), high-density cards, slate theme, and ApexCharts aesthetic of the companion production applications.

---

## 🚀 Quick Start

### 1. One-Click Startup (Windows)
Double-click:
```bat
run.bat
```

### 2. Manual Command Line
Ensure dependencies are installed, then run the concurrent development servers:
```powershell
npm.cmd run dev
```
This runs both:
- **Express Backend API**: `http://localhost:5001`
- **Vite React Frontend**: `http://localhost:3001`

---

## 📂 Project Architecture

```
delivery production count/
├── data/
│   └── deliveries.json        <-- JSON Database (Deliveries, KPIs, Analytics, Customers)
├── server/
│   ├── db.js                  <-- Database abstraction layer (easy to swap for SQL/NoSQL)
│   └── server.js              <-- Express REST API (Deliveries CRUD, KPIs, Analytics)
├── src/
│   ├── components/
│   │   ├── AnalyticsComboChart.jsx   <-- ApexCharts Stacked Bars + Trend Line (Day/Wk/Mo)
│   │   ├── DeliveryDetailsModal.jsx  <-- Dispatch manifest modal with file breakdown
│   │   ├── DonutBreakdown.jsx        <-- ApexCharts Donut (POD, EPDF, SCANNED, E-ISBN)
│   │   ├── FileListTable.jsx         <-- Master dispatch registry table with pagination
│   │   ├── FilterPanel.jsx           <-- Date scopes, Type/Customer dropdowns & live search
│   │   ├── Header.jsx                <-- Top navbar, live status indicator, export & actions
│   │   ├── KpiCards.jsx              <-- 6 Metric cards (Dispatches, Today, Weekly, Monthly, Pages, SLA)
│   │   ├── NewDeliveryModal.jsx      <-- Quick-add modal to record new dispatches
│   │   ├── PerformanceChart.jsx      <-- ApexCharts Target vs Actual grouped bar chart
│   │   ├── RecentActivityTable.jsx   <-- Live transmission feed table
│   │   └── TopCustomers.jsx          <-- Client volume ranking & progress indicators
│   ├── services/
│   │   └── api.js                    <-- Fetch client connecting React to Express API
│   ├── App.jsx                       <-- Master React dashboard state & layout
│   ├── index.css                     <-- Tailwind CSS & Inter font setup
│   └── main.jsx                      <-- React root entry point
├── dist/                             <-- Optimized production build
├── index.html                        <-- Vite HTML shell
├── package.json                      <-- Project scripts and dependencies
├── tailwind.config.js                <-- Tailwind design tokens
├── vite.config.js                    <-- Vite configuration with API reverse proxy
└── run.bat                           <-- Quick launcher
```

---

## 🔌 Connecting to Your Real Database (MySQL / PostgreSQL / MongoDB)

Currently, the application uses `data/deliveries.json` via the abstracted data access layer located in:
👉 [`server/db.js`](file:///c:/Users/ADMIN/Music/delivery%20production%20count/server/db.js)

To switch to your production database, simply install your database client (e.g. `pg`, `mysql2`, `mongoose`, or `prisma`) and replace the query functions in `server/db.js`:

```javascript
// Example: PostgreSQL swap in server/db.js
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = {
  getAllDeliveries: async ({ type, customer, status, search, limit, offset }) => {
    let query = 'SELECT * FROM deliveries WHERE 1=1';
    const values = [];
    // add filters...
    const res = await pool.query(query, values);
    return { total: res.rowCount, deliveries: res.rows };
  },
  
  createDelivery: async (delivery) => {
    const res = await pool.query(
      'INSERT INTO deliveries (customer, type, files_count, pages_count, channel, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [delivery.customer, delivery.type, delivery.filesCount, delivery.pagesCount, delivery.channel, delivery.status]
    );
    return res.rows[0];
  }
};
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/deliveries` | Retrieve dispatches (supports `?type=&customer=&status=&search=&limit=&offset=`) |
| `GET` | `/api/deliveries/:id` | Get single delivery details and file manifest |
| `POST` | `/api/deliveries` | Record new production delivery |
| `PUT` | `/api/deliveries/:id/status`| Update dispatch status (`Delivered`, `In Transit`, etc.) |
| `DELETE`| `/api/deliveries/:id` | Delete delivery record |
| `GET` | `/api/kpis` | Summary metrics (Total, Today, Weekly, Monthly, SLA) |
| `GET` | `/api/analytics` | Stacked bar chart data (`?period=day\|week\|month`) |
| `GET` | `/api/performance` | Target vs Actual output (`?period=daily\|weekly\|monthly`) |
| `GET` | `/api/top-customers` | Volume share and SLA by client |
| `GET` | `/api/health` | Service health status check |

---

## 📊 Features & UI Highlights

1. **Production Formats Supported**:
   - `POD` (Print on Demand)
   - `EPDF` (Electronic PDF)
   - `SCANNED FILE` (High-res Archival Scans)
   - `E-ISBN` (Digital e-book & metadata)
2. **Visual Consistency**:
   - Matching font (`Inter`), slate-50 canvas, rounded-2xl KPI cards, subtle borders, and ApexCharts styles identical to `rework page`.
3. **Interactive Tools**:
   - Live search by Delivery ID, File Name, or Customer.
   - Dynamic period toggles (`DAY`, `WEEK`, `MONTH`).
   - One-click CSV Export.
   - Live Record Dispatch modal.
   - Dispatch Manifest viewer modal.
