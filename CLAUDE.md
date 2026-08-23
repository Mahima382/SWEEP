# SWEEP — Project Context & Spec

> **Purpose of this file:** Persistent project context for Claude Code. Read this first in any
> new session before making changes. It captures decisions, scope, structure, and conventions
> agreed across the design phase so they don't have to be re-explained.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | SWEEP — Smart Waste Exchange & Eco Platform |
| **Type** | Web-based marketplace for recyclable household waste |
| **Course** | CSE-404 — Software Engineering Laboratory |
| **Institution** | Dept. of CSE, Jahangirnagar University |
| **Team** | Group 2, 51st Batch |
| **Repo** | https://github.com/Mahima382/SWEEP |
| **Wiki** | https://github.com/Mahima382/SWEEP/wiki |
| **Local path** | `J:\SWEEP` |

### Team Members

| Name | Roll |
|------|------|
| Md. Safiur Khan Siam | 356 |
| Yeaseen Arafat Hridit | 361 |
| Abid Hasan Plabon | 369 |
| Anabil Chakma | 378 |
| Zakia Sultana Mahima | 382 |
| Lamia Tabassum Disha | 383 |

**Supervisors:** Dr. Md. Musfique Anwar (Professor), Dr. Md. Humayun Kabir (Professor)

---

## 2. What the Platform Does

SWEEP connects four parties in a recyclable-waste supply chain:

```
Household  →  Local Collector  →  Global Collector  →  Recycling Company
 (sells)      (collects &         (transports bulk      (buys & processes)
               aggregates)          lots by truck)
                          ↑
                    Admin oversees all
```

- **Household** lists recyclable waste, requests a pickup, gets paid to a wallet.
- **Local Collector** serves a defined zone, accepts household pickup requests, records
  actual weight + proof photos, aggregates collected waste into per-category bulk lots.
- **Global Collector** is a truck driver who moves bulk lots from local collectors to
  recycling companies.
- **Recycling Company** subscribes to a plan, browses a region-filtered newsfeed of
  available lots, places orders, tracks procurement on a dashboard.
- **Admin** manages users, KYC, pricing/commission, fraud queue, audit logs, reports.

---

## 3. Locked Architectural Decisions

These are settled. Do not reopen without an explicit instruction.

| # | Decision | Notes |
|---|----------|-------|
| 1 | **Architecture: MVC** | React = View, Express controllers = Controller, MySQL models = Model. MVVM was evaluated and rejected (React has no two-way binding; Express has no ViewModel concept; would mean two patterns in one project). |
| 2 | **Collector split into two roles** | Local Collector (household → collector) and Global Collector (collector → company, truck driver). |
| 3 | **Bidding / auctions: REMOVED** | Out of scope. Fixed-price orders only. Any legacy FR text mentioning bids is stale. |
| 4 | **Escrow: REMOVED** | Out of scope. Payment FR is retained but without escrow hold/release mechanics. |
| 5 | **Testing: Jest (unit) + Supertest (integration)** | Decided in Meeting 4. React Testing Library for components. |
| 6 | **Coding standard: ESLint + Airbnb** | See §7. |
| 7 | **Documentation tool: JSDoc** | Tool 1. Jest documented as Tool 2. |
| 8 | **12 Functional Requirements** | Restructured from an earlier 7-FR draft. See §5. |

---

## 4. Tech Stack

```
Frontend    React 18 (JSX + Hooks)          → the View layer
Backend     Express.js (Node 24, CommonJS)  → the Controller layer
Database    MySQL (via mysql2)              → the Model layer
Auth        bcryptjs + jsonwebtoken
Lint        ESLint 8.57.1 + eslint-config-airbnb
Docs        JSDoc 4.0.5
Test        Jest + Supertest + React Testing Library
Payments    bKash / Nagad / bank transfer
Maps        Google Maps Platform
```

### Package layout (three npm trees — deliberate, reduces lockfile merge conflicts)

| Tree | Package | Key deps (installed 2026-08-24) |
|------|---------|--------------------------------|
| root | `sweep` | dev: eslint@8.57.1, eslint-config-airbnb@19 + peers, jsdoc@4 |
| `backend/` | `sweep-backend` | express, mysql2, dotenv@16, cors, bcryptjs, jsonwebtoken · dev: nodemon, jest, supertest |
| `frontend/` | `sweep-frontend` | react@18.3, react-dom@18.3, react-router-dom@6, prop-types · dev: vite@5, @vitejs/plugin-react, jest@29 + jsdom env, @testing-library/react@14 (v16 needs React 19 — don't upgrade), babel-jest + presets, identity-obj-proxy |

> **Resolved issue (2026-08-24):** the "server clean-exits after boot" bug was `dotenv`
> v17 (dotenvx) + an empty `.env`. Now pinned to `dotenv@16` with a populated
> `backend/.env` (gitignored; template in `backend/.env.example`) — verified staying up.
> **prop-types** was added because the locked `react/prop-types: error` rule requires it
> for any component taking props.

---

## 5. Functional Requirements (12)

| FR | Name | Summary |
|----|------|---------|
| **FR-01** | Registration | 4 sub-flows: Household, Local Collector, Global Collector, Company |
| **FR-02** | Login | All roles, role-based routing, 5-attempt lockout, suspended = blocked |
| **FR-03** | Household Waste Listing & Pickup Request | Category, photos (max 5), suggested price, scheduling, 2-hr free cancel window |
| **FR-04** | Household Wallet & Earnings | Pending vs Available balance, withdrawal, breakdown, CSV/PDF export, review per txn |
| **FR-05** | Pickup Management | Zone setup, accept/decline, weight recording, proof photos, bulk lot aggregation |
| **FR-06** | Waste Dashboard for Collector | Held waste by category/weight/status, earnings, withdrawal, txn history |
| **FR-07** | Subscription Management | Post-KYC plan selection (Basic/Pro/Enterprise), marketplace gated, 3-day grace |
| **FR-08** | Company Dashboard & Newsfeed | 8.1 region-based lot newsfeed; 8.2 procurement dashboard |
| **FR-09** | Notifications to Collector | Real-time push + in-app, 30-min auto-forward if no response |
| **FR-10** | Mobile Banking & Payment | bKash/Nagad/bank, auto commission, idempotency, webhook signature verification |
| **FR-11** | Admin Portal | Users, KYC queue, pricing (versioned), subscriptions, fraud queue, audit logs, reports |
| **FR-12** | Access Management & Account Security | NID/email blacklist, password reset, RBAC, session expiry, KYC auto-deactivation |

### Registration rules (critical — these drive schema design)

- **Household:** NID + pickup address (map pin) required. No KYC.
- **Local Collector:** NID required. KYC pending until admin approves.
- **Global Collector:** NID + driving licence + vehicle registration + capacity. KYC required.
- **Company:** trade licence → KYC → **must subscribe** before marketplace access.
- **Blacklist rule:** once an account is suspended or banned, its **NID and email are
  permanently blacklisted**. No re-registration with that identity, regardless of phone
  number. Reinstatement by an admin lifts the blacklist.

### Waste categories

`Plastic` · `Paper` · `Metal` · `Glass` · `E-waste` · `Organic` · `Textile` · `Mixed`

Sub-categories where relevant (e.g. PET vs HDPE). **E-waste is licence-gated** — only
visible/orderable by companies with an e-waste handling licence.

---

## 6. Non-Functional Requirements

42 NFRs across 11 categories. Key numbers to honour in implementation:

| Area | Requirement |
|------|-------------|
| Response time | ≤ 2s normal, ≤ 5s peak |
| Concurrent users | 5,000 minimum |
| DB query | ≤ 1s standard, ≤ 3s analytical |
| Transactions | 3–5s |
| Push notifications | ≤ 5s; SMS/email ≤ 30s |
| Availability | 99.5% |
| Password | ≥ 8 chars, 1 upper, 1 lower, 1 number, 1 special; hashed |
| Session | expires after 30 min inactivity |
| Login lockout | 5 failed attempts → 15 min lock |
| Audit log retention | 12 months |
| Payment encryption | 256-bit |
| Code documentation | ≥ 90% of critical modules |

---

## 7. Coding Standard (enforced)

ESLint with `eslint-config-airbnb`. Config at repo root.

### `.eslintrc.json`

```json
{
  "extends": ["airbnb"],
  "plugins": ["react", "react-hooks"],
  "env": { "browser": true, "es2021": true, "node": true },
  "settings": { "react": { "version": "18.3" } },
  "overrides": [
    {
      "files": ["**/*.test.js", "**/*.test.jsx", "**/jest.setup.js"],
      "env": { "jest": true },
      "rules": {
        "import/no-extraneous-dependencies": ["error", { "devDependencies": true }]
      }
    },
    {
      "files": ["**/vite.config.js", "**/jest.config.js", "**/.eslintrc.js"],
      "rules": {
        "import/no-extraneous-dependencies": ["error", { "devDependencies": true }]
      }
    }
  ],
  "rules": {
    "camelcase": "error",
    "indent": ["error", 2],
    "curly": ["error", "all"],
    "no-multiple-empty-lines": ["error", { "max": 1 }],
    "react/jsx-pascal-case": "error",
    "react/prop-types": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "linebreak-style": "off",
    "eol-last": "off",
    "class-methods-use-this": "off"
  }
}
```

**Why `settings`/`overrides` were added (2026-08-24):** `react.version` silences the
detect warning (react lives in `frontend/`, not root); the overrides give Jest globals
to `*.test.js(x)` files and allow devDependency imports in test/config files — the
locked rules themselves are unchanged.
**Why `linebreak-style` and `eol-last` are off:** Windows dev machines produce CRLF.
**Why `class-methods-use-this` is off:** pure math/utility class methods legitimately
don't reference `this`.

### Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Class | PascalCase | `MaxFinderModel` |
| Method / function | lowerCamelCase | `findMaxFromArray()` |
| React component | PascalCase | `CreateListing.jsx` |
| Custom hook | `use` + camelCase | `useWasteListings.js` |
| Controller file | camelCase + suffix | `wasteController.js` |
| Route file | dot-separated | `waste.routes.js` |
| Test file | mirrors source | `maxfinder.test.js` |

Every class, constructor, and public method needs a JSDoc block with `@param` and `@returns`.

---

## 8. Repository Structure

```
SWEEP/
├── assets/
├── docs/                          ← JSDoc output (generated, gitignored)
├── frontend/                      ← VIEW
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Household/
│       │   ├── Collector/
│       │   ├── Company/
│       │   └── Admin/
│       ├── pages/
│       ├── layouts/
│       ├── services/              ← API client functions
│       ├── hooks/
│       ├── context/
│       ├── routes/
│       ├── utils/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
├── backend/                       ← CONTROLLER + MODEL
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── wasteController.js
│   │   ├── walletController.js
│   │   ├── paymentController.js
│   │   ├── notificationController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── database/
│   ├── utils/
│   ├── app.js                     ← express app, middleware, route mounting
│   └── server.js                  ← listen()
├── .eslintrc.json
├── .eslintignore
├── jsdoc.json
├── package.json                   ← root tooling only; backend/ and frontend/ have their own
├── README.md
├── CONTRIBUTING.md                ← branch model + module ownership map
└── .gitignore
```

---

## 9. Commands

```bash
# Install (three trees)
npm install && npm install --prefix backend && npm install --prefix frontend

# Lint (root config covers the whole repo)
npm run lint                              # eslint . --ext .js,.jsx
npm run lint:fix                          # auto-fix
npx eslint backend/app.js                 # single file

# Docs
npm run docs                              # jsdoc -c jsdoc.json → docs/index.html (gitignored)

# Tests
npm test                                  # backend suite (Jest+Supertest) then frontend (Jest+RTL)
npm --prefix backend test                 # backend only
npm --prefix frontend test               # frontend only

# Run
npm run dev:backend                       # nodemon backend/server.js → port 5000 (GET /health)
npm run dev:frontend                      # vite → port 5173, proxies /api → :5000
npm --prefix frontend run build           # production build → frontend/dist (gitignored)
```

> **JSDoc gotcha:** JSDoc 4 cannot parse TypeScript-style `{import('express').Request}`
> type expressions — use plain `{object}` / `{Function}` in `@param`/`@returns` or
> `npm run docs` throws parse errors.

### `jsdoc.json`

```json
{
  "source": {
    "include": ["frontend/src", "backend"],
    "exclude": ["node_modules", "backend/node_modules", "docs"],
    "includePattern": ".+\\.js(x)?$"
  },
  "opts": { "destination": "./docs", "recurse": true }
}
```

> `exclude` matters — without it JSDoc crawls `node_modules` and throws hundreds of
> type-expression parse errors from third-party packages.

---

## 10. Data Flow Diagram (agreed 3-level DFD)

**Level 0 — Context**
Single process `SWEEP Marketplace Platform`. External entities: Household, Collector,
Recycling Company, Admin, bKash/Nagad Gateway.

**Level 1 — Processes**

| ID | Process | Data stores touched |
|----|---------|--------------------|
| P1 | Authentication | D1 Users |
| P2 | Waste Listings | D2 Listings |
| P3 | Pickup & Logistics | D3 Pickups |
| P4 | Marketplace | D4 Orders |
| P5 | Payments | D5 Wallets |
| P6 | Notifications | — |
| P7 | Admin & Reports | D6 Audit Logs |

**Level 2 — P5 Payments decomposed**
P5.1 Escrow Management · P5.2 Commission Calculation · P5.3 Wallet Update ·
P5.4 Payout Processing · P5.5 Refund Management. Data stores: D4 Orders, D5 Wallets,
D7 Transactions.

> ⚠️ The Level-2 diagram still contains escrow boxes from before escrow was cut from scope.
> If regenerating, drop P5.1 and rewire P5.2 → P5.3 directly.

Diagrams are drawn in Lucidchart.

---

## 11. Current State / Open Work

> **Snapshot 2026-08-24 (evening):** full project scaffold completed in the working tree
> on branch `auth` — **all of it UNCOMMITTED**. The user commits/merges manually; Claude
> never runs git state-changing commands.

### Git state

| Branch | Head | Notes |
|--------|------|-------|
| `main` | `a228dcd` Initial project structure | Empty stubs only |
| `auth` (current) | `a228dcd` (same as main) | **Entire scaffold below sits uncommitted on top** |
| `origin/develop` | `4b400ec` Modified folder structure | Old ESLint/JSDoc practice work + committed `docs/` output — superseded by the new scaffold; user will reconcile branches manually |
| `origin/plabon` | — | Teammate feature branch |

### Done ✅ (verified by running, not assumed)
- **Root tooling:** `.eslintrc.json` (Airbnb + settings/overrides, §7), `.eslintignore`,
  `jsdoc.json`, root scripts (`lint`, `lint:fix`, `docs`, `test`, `dev:backend`,
  `dev:frontend`); ESLint 8.57.1 chain installed — `npm run lint` = **0 errors repo-wide**
- **Backend scaffold (`sweep-backend`):** Express app with 8 domain routers → 8 JSDoc'd
  501-placeholder controllers (mapped to FRs), 5 model stubs (no Express imports), JWT
  `authenticate`/`authorize` middleware, central error handler, lazy mysql2 pool,
  `utils/constants.js` (8 waste categories), `database/schema.sql` header,
  `.env` + `.env.example`. **Boot bug fixed** (dotenv@16 + populated .env — server stays
  up, `/health` verified live). Jest+Supertest: **3/3 passing**
- **Frontend scaffold (`sweep-frontend`):** Vite + React 18.3 (manual scaffold, React 18
  pinned), router table in `routes/AppRoutes.jsx`, AuthContext + useAuth, services/api.js
  fetch wrapper (+/api proxy to :5000), per-role component folders each with a starter
  dashboard, pages/layouts/utils/styles. `npm run build` ✅, Jest+RTL smoke test **1/1**
- **Docs:** `npm run docs` generates cleanly (0 parse errors); `docs/` gitignored
- **Team docs:** `CONTRIBUTING.md` (branch model, 6-member FR ownership map, shared-files
  protocol) and `README.md` (project intro + run instructions)
- SRS Sections 1–3 drafted; 3-level DFD drawn; Task 6.1/7.1 submitted (outside repo)

### Pending ⬜
- [ ] **User: review + commit the scaffold** (everything above is uncommitted on `auth`);
      reconcile `origin/develop` manually (its `backend/src/add.js` etc. are obsolete)
- [ ] **Auth feature (FR-01/FR-02):** real registration/login — controllers currently 501
- [ ] **MySQL:** write `database/schema.sql`, wire models to real queries
- [ ] Wiki pages to publish: Coding Standard, MVC vs MVVM, Jest (Documentation Tool 2)
- [ ] SRS: paste generated LaTeX for FR / NFR / Section 2 into Overleaf
- [ ] Purge remaining bidding/escrow references from SRS and DFD Level 2

---

## 12. Working Agreements for Claude Code

1. **Read this file first**, then check `git log` and the actual tree — this file can drift.
2. **MVC boundaries are hard.** React never queries MySQL. Controllers never render.
   Models never import Express.
3. **Run `npm run lint` before declaring anything done.** Zero errors AND zero warnings
   is the bar (`server.js` suppresses its one boot log with a targeted
   `eslint-disable-next-line no-console`).
4. **JSDoc every new class, constructor, and exported function.** `@param` + `@returns`.
5. **Write the Jest test alongside the source file** (`foo.js` → `foo.test.js`).
6. **Don't reintroduce bidding or escrow.** If you find them in old files, they're stale.
7. **Windows host, sometimes via WSL** — the repo is `J:\SWEEP`, also mounted as
   `/mnt/j/SWEEP` under WSL (bash). In PowerShell chain commands with `;` not `&&`;
   in WSL normal bash rules apply. Line endings are CRLF (`linebreak-style` is off) —
   avoid mass CRLF↔LF rewrites; they pollute diffs.
8. **Ask before adding a dependency.** The stack is deliberately small.
9. **Never commit or push automatically.** Leave changes uncommitted and report them;
   commit only when explicitly asked.

---

## 13. Reference Documents Produced

| Document | Purpose |
|----------|---------|
| `Sweep_SRS_content_only.tex` | SRS §2.1 User Classes + §2.2 User Needs (LaTeX, no colour) |
| `Sweep_NFR_content.tex` | All 42 NFRs (LaTeX) |
| `Sweep_FR_content.tex` | All 12 FRs with user stories, acceptance criteria, edge cases |
| `Sweep_JS_Coding_Standard_Final.pdf` | Coding standard reference |
| `Sweep_Wiki_Architectural_Model.md` | Wiki page — MVC selection |
| `Sweep_Wiki_MVC_vs_MVVM.md` | Wiki page — why not MVVM, incl. hypothetical MVVM structure |
| `Sweep_Wiki_Jest_Documentation_Tool.md` | Wiki page — Jest as Documentation Tool 2 |
| `Jest_Setup_Procedure.pdf` | 11-page Jest setup walkthrough with screenshots |
| `Task6_1_Lamia_383.zip` | Week 6 report (Overleaf project) |
| `Task7_1_Lamia_383.zip` | Week 7 MVC report (Overleaf project) |
| `Sweep_Meeting_Minutes_4.md` | Meeting 4 minutes |
