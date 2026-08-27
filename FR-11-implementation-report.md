# FR-11 Admin Portal — Remaining Implementation Report

> Scope: implementation of the five remaining FR-11 backend sections on the existing
> SWEEP Node.js project, **without creating a separate database** and **without
> breaking** the already-complete User Management (100%) and KYC Review (100%)
> functionality.

---

## 1. Completed Functionality

| Section | Status | What was built |
|---|---|---|
| **Pricing & Commission** | Done | Versioned base prices (waste category + region + effective date) and versioned commission rates (transaction type + effective date). Overlapping effective dates are rejected. `getActivePriceVersion` / `getActiveCommissionVersion` return the version valid as-of a date so past transactions can be snapshotted. |
| **Subscription Management** | Done | Create / edit / list / archive plans. **No delete endpoint** — archiving is the safe alternative; in-use plans are archived (unavailable for new signups) while existing subscribers are untouched. |
| **Fraud Detection Queue** | Done (foundation) | Rule engine (`services/fraudService.js`) with three rules (weight variance, rapid account creation, suspicious activity) + flag storage + admin clear/escalate decisions, each recorded via the audit service. |
| **Audit Logs** | Done | Immutable, **tamper-evident** (SHA-256 hash chain) audit records for all sensitive admin actions. **Fail-closed**: a sensitive action and its audit record are committed in one DB transaction; if the audit write fails the action is rolled back. Searchable / filterable / CSV-exportable. |
| **Operational Reports** | Done (graceful) | Collection volume (by category & region), revenue (commission & subscription), environmental impact (CO2). Aggregates real records; degrades gracefully (reports `available:false` + note) when the required tables do not yet exist. |

**Integration with existing work:** suspend / ban / reinstate / confirm / KYC
verify / KYC reject now also write an audit record (fail-closed). Existing User
Management endpoints were also given the missing `authenticate` +
`authorize(['admin'])` middleware (they already checked `req.user.role`, so the
actor is now actually populated — this also makes the audit actor available and
closes a previously-open security gap).

---

## 2. Files Modified / Added

### Added (new)
| File | Why |
|---|---|
| `backend/models/pricingModel.js` | Versioned pricing & commission data access. |
| `backend/models/subscriptionModel.js` | Plan CRUD + archive + in-use check. |
| `backend/models/fraudModel.js` | Fraud flag storage + decisions. |
| `backend/models/auditModel.js` | Tamper-evident audit record storage (hash chain). |
| `backend/models/reportModel.js` | Report aggregations over existing tables. |
| `backend/controllers/PricingController.js` | Pricing/commission endpoints. |
| `backend/controllers/SubscriptionController.js` | Subscription endpoints. |
| `backend/controllers/FraudController.js` | Fraud queue endpoints. |
| `backend/controllers/AuditController.js` | Audit list + CSV export. |
| `backend/controllers/ReportController.js` | Report endpoints (graceful degrade). |
| `backend/routes/pricing.routes.js` | Mounts at `/api/admin/pricing`. |
| `backend/routes/subscription.routes.js` | Mounts at `/api/admin/subscriptions`. |
| `backend/routes/fraud.routes.js` | Mounts at `/api/admin/fraud`. |
| `backend/routes/audit.routes.js` | Mounts at `/api/admin/audit`. |
| `backend/routes/report.routes.js` | Mounts at `/api/admin/reports`. |
| `backend/services/dbTransaction.js` | `withTransaction` helper (atomic work). |
| `backend/services/auditService.js` | `withAudit` fail-closed wrapper. |
| `backend/services/fraudService.js` | Pure, database-agnostic rule engine. |
| `backend/tests/{pricing,subscription,fraud,audit,report,userManagement.audit,fraudService}.test.js` | Backend tests (34 total). |

### Modified (existing — preserved)
| File | Why |
|---|---|
| `backend/app.js` | Mounted the 5 new route modules under `/api/admin/*`. |
| `backend/models/userModel.js` | `updateStatus` / `updateKycStatus` accept an optional `connection` for transactional audit (backward compatible). |
| `backend/controllers/UserManagementController.js` | Wrapped suspend/ban/reinstate/confirm/KYC in `withAudit` (fail-closed). Behaviour, status codes, and messages unchanged. |
| `backend/routes/UserManagementRoutes.js` | Added `authenticate` + `authorize(['admin'])` (see note above). |
| `backend/config/db.js` | Under `NODE_ENV === 'test'`, swaps the real MySQL pool for an in-memory stand-in so the suite runs without a live DB. Production path (real `mysql2/promise` pool) is unchanged. |
| `backend/vitest.config.js` | (No alias needed; kept `globals` + node env.) |
| `progress.md` | Updated local tracking of FR-11 status. |

No frontend files were touched. No `package.json` / `package-lock.json` changed.
No separate database or schema was created.

---

## 3. API Endpoints

All endpoints require `Authorization: Bearer <admin JWT>` and role `admin`.

### Pricing & Commission (`/api/admin/pricing`)
| METHOD | PATH | PURPOSE | AUTHORIZATION |
|---|---|---|---|
| POST | `/price` | Create a versioned base price (category + region + effective date) | admin |
| GET | `/price` | List price versions (filter `?wasteCategory=&region=`) | admin |
| POST | `/commission` | Create a versioned commission rate (transaction type + effective date) | admin |
| GET | `/commission` | List commission versions (filter `?transactionType=`) | admin |

### Subscription Management (`/api/admin/subscriptions`)
| METHOD | PATH | PURPOSE | AUTHORIZATION |
|---|---|---|---|
| POST | `/plans` | Create a subscription plan | admin |
| GET | `/plans` | List plans (`?includeArchived=true` to include archived) | admin |
| PUT | `/plans/:planId` | Edit a plan (name/price/duration/currency/features) | admin |
| POST | `/plans/:planId/archive` | Archive a plan (no deletion; in-use plans keep subscribers) | admin |

### Fraud Detection Queue (`/api/admin/fraud`)
| METHOD | PATH | PURPOSE | AUTHORIZATION |
|---|---|---|---|
| GET | `/queue` | List fraud flags (`?status=&userId=`) | admin |
| GET | `/rules` | List available fraud rules | admin |
| GET | `/flags/:flagId` | Get a single flag | admin |
| POST | `/flags` | Raise a flag (manual, or run a rule via `context`) | admin |
| POST | `/flags/:flagId/clear` | Clear a pending flag (audited) | admin |
| POST | `/flags/:flagId/escalate` | Escalate a pending flag (audited) | admin |

### Audit Logs (`/api/admin/audit`)
| METHOD | PATH | PURPOSE | AUTHORIZATION |
|---|---|---|---|
| GET | `/` | List/search/filter audit records | admin |
| GET | `/export` | Export audit records as CSV | admin |

### Operational Reports (`/api/admin/reports`)
| METHOD | PATH | PURPOSE | AUTHORIZATION |
|---|---|---|---|
| GET | `/collection-volume` | Collection volume by category & region | admin |
| GET | `/revenue` | Revenue by commission & subscription | admin |
| GET | `/environmental-impact` | CO2 savings (estimated, see DB reqs) | admin |

---

## 4. Database Requirements

### 4.1 Existing structures reused (no change)
- The single shared `sweep` MySQL database — **no new database created**.
- `users` table: `id`, `role`, `region`, `status`, `kyc_status`, `reason` —
  used by User Management, as the audit `actor`, and as the `user_id` target
  for fraud flags.
- Project constants `WASTE_CATEGORIES` (8 categories) reused for validation.

### 4.2 Changes required later (for team DB integration)

**Table: `pricing_versions`**
- `id` INT PK auto-increment
- `waste_category` VARCHAR(20) — one of `WASTE_CATEGORIES`
- `region` VARCHAR(50)
- `base_price_min` DECIMAL(10,2) — not null
- `base_price_max` DECIMAL(10,2) — not null
- `effective_date` DATE — not null
- `category_region` VARCHAR(80) — derived `category::region` (or use a UNIQUE(`waste_category`,`region`,`effective_date`))
- Constraint: `UNIQUE(waste_category, region, effective_date)` (rejects overlapping effective periods)
- Relationship: `waste_category` references the category catalogue; `region` references the region list
- Purpose: versioned per-category/region base prices

**Table: `commission_versions`**
- `id` INT PK auto-increment
- `transaction_type` VARCHAR(30) — e.g. `pickup`, `order`
- `commission_rate` DECIMAL(5,4) — fraction 0..1
- `effective_date` DATE — not null
- Constraint: `UNIQUE(transaction_type, effective_date)`
- Purpose: versioned commission rates

**Table: `subscription_plans`**
- `id` INT PK auto-increment
- `name` VARCHAR(60) — not null
- `price` DECIMAL(10,2) — not null
- `duration_days` INT — not null
- `currency` VARCHAR(3) — default `'BDT'`
- `features` JSON — nullable
- `archived` BOOLEAN — default `FALSE`
- `created_at`, `updated_at` TIMESTAMP
- Purpose: subscription plans (archived, never deleted)

**Table: `subscriptions`**
- `id` INT PK auto-increment
- `user_id` INT — FK → `users.id`
- `plan_id` INT — FK → `subscription_plans.id`
- `status` VARCHAR(20) — e.g. `active`, `cancelled`
- `started_at`, `ends_at` TIMESTAMP
- Constraint: FK `plan_id`; `status='active'` is what counts a plan as "in use"
- Purpose: links subscribers to plans; enables safe archive (no delete of in-use plans)

**Table: `fraud_flags`**
- `id` INT PK auto-increment
- `user_id` INT — FK → `users.id` (nullable for non-user flags)
- `order_id` INT — FK → `orders.id` (nullable)
- `rule` VARCHAR(40) — rule id
- `severity` ENUM('low','medium','high') — default `'low'`
- `details` TEXT — nullable
- `status` ENUM('pending','cleared','escalated') — default `'pending'`
- `decided_by` INT — FK → `users.id` (admin)
- `decision_note` TEXT — nullable
- `decided_at` DATETIME — nullable
- `created_at` TIMESTAMP
- Purpose: fraud detection queue

**Table: `audit_logs`**
- `id` INT PK auto-increment
- `actor_id` INT — acting admin id
- `actor_role` VARCHAR(20)
- `action` VARCHAR(60) — action code (e.g. `user.banned`, `kyc.verified`, `fraud.cleared`, `pricing.created`)
- `target_type` VARCHAR(30)
- `target_id` VARCHAR(64) — entity id (VARCHAR to accept non-integer targets)
- `details` JSON — nullable
- `created_at` DATETIME — not null
- `record_hash` CHAR(64) — SHA-256 hex of the tamper-evident chain
- Constraint: append-only / immutable; `record_hash` chains to previous row (any rewrite breaks the chain)
- Purpose: immutable, tamper-evident, searchable, exportable audit trail

**Table: `transactions` (add columns)**
- `applied_rate` DECIMAL(10,2) — snapshot of the base price used at transaction time
- `applied_commission_rate` DECIMAL(5,4) — snapshot of the commission rate used
- (or `rate_version_ids` JSON referencing `pricing_versions.id` / `commission_versions.id`)
- Purpose: retain the rate applied at the time, so new pricing versions do not alter past transactions

**Table: `listings` (for reports — confirm/extend)**
- `weight` DECIMAL(10,2) — collected weight (required for volume + CO2)
- `waste_category` VARCHAR(20)
- `user_id` INT — FK → `users.id` (for region join)
- `created_at` TIMESTAMP
- Purpose: collection-volume and environmental-impact aggregations

**Table: `co2_factors` (reference, recommended)**
- `waste_category` VARCHAR(20) PK
- `factor_per_kg` DECIMAL(8,4) — kg CO2 saved per kg recycled
- Purpose: precise environmental-impact figures (until this exists, reports use documented estimated factors and flag `estimated:true`)

**Edge case — Ban + active order (not yet implemented; requires schema)**
- `orders` needs `status` (e.g. `active`, `on_hold`) and `user_id` (FK → `users.id`).
- When an admin bans a user who has `status='active'` orders, the system should
  raise a `fraud_flags` row with `order_id` (or set the order `on_hold` with a
  `held_reason`). This is **documented, not coded**, because the `orders` table
  does not yet exist in the shared schema.

---

## 5. Remaining Limitations

- **No shared schema yet.** All models issue real SQL against the `sweep` pool,
  but the required tables are not created (the team will finalise the schema).
  Until then, pricing/subscription/fraud/audit/report endpoints return errors
  at runtime against a live DB missing those tables (tests use an in-memory
  stand-in). Reports explicitly report `available:false` rather than fabricate.
- **Operational reports** aggregate over `listings` / `orders` / `transactions` /
  `subscriptions`. Volume and revenue need those tables populated; CO2 uses
  estimated factors until `co2_factors` exists.
- **Ban + active order** edge case is documented but not implemented (no
  `orders` table).
- **Frontend** was intentionally not modified (backend-only task).
- Environmental impact CO2 figures are *estimated* (flagged in the response).

---

## 6. Testing Results

| Suite | Command | Result |
|---|---|---|
| ESLint (repo) | `npm run lint` | **0 errors** (7 pre-existing warnings in obsolete `backend/src/*` practice files, not part of this work) |
| Backend unit/integration | `npm --prefix backend test` | **34 passed / 34** (8 files) |
| Frontend | `npm --prefix frontend test` | **1 passed / 1** |
| E2E (Playwright) | `npm run test:e2e` | **1 passed / 1** (chromium smoke) |

New backend coverage includes: pricing versioning + overlap rejection,
subscription archive (in-use preserved), fraud queue + clear/escalate (audited),
audit list + CSV export, reports (success + graceful missing-table), and the
**fail-closed audit contract** (action blocked when audit write fails, verified
via rollback hook) plus super-admin protection on the existing endpoints.

> Test infrastructure note: `backend/config/db.js` returns an in-memory MySQL
> stand-in when `NODE_ENV==='test'` (vitest sets this). Production behaviour is
> unchanged. No real database is required to run the suite.

---

## 7. Git Safety

- **No commit or push was performed** — all changes are left uncommitted in the
  working tree on the current branch (`feature/admin-portal`).
- The implementation is compatible with later shared-database integration: it
  reuses the existing `sweep` DB, adds no new database, and the only schema
  changes are documented above for the team to apply.
- `frontend-reference/` and team members' unrelated work were not modified.
