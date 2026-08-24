# Contributing to SWEEP

Team guide for Group 2 (51st Batch, CSE-404). Read `CLAUDE.md` for full project context.
Six people, one repo — the rules below exist so we never lose work to merge conflicts.

## 1. Branching Model

```
main ← develop ← feature/frXX-short-name
```

| Branch | Purpose | Who pushes |
|--------|---------|------------|
| `main` | Stable / submission-ready only | Nobody directly — Mahima merges `develop` → `main` |
| `develop` | Integration branch (exists on origin) | Nobody directly — merged via PRs only |
| `feature/frXX-short-name` | Your work, e.g. `feature/fr01-registration` | You |

**Workflow, every session:**

1. `git checkout develop && git pull origin develop`
2. `git checkout -b feature/fr03-waste-listing` (or `git rebase develop` on an existing branch)
3. Commit, push, open a **PR into `develop`** on GitHub
4. One teammate reviews; merge after the Definition of Done (§4) passes
5. Only **Mahima (repo owner)** merges `develop` → `main`

Never commit directly to `main` or `develop`.

## 2. Module Ownership (proposal — re-assign in the group chat if needed)

One owner per domain, so **no two people edit the same file**. Anything not in your
column is someone else's — ask before touching it.

| Member | Domain (FRs) | Backend owns | Frontend owns | Shared files they'll touch |
|--------|--------------|--------------|---------------|----------------------------|
| Zakia Sultana Mahima (382) | Auth & Security (FR-01, 02, 12) | `controllers/authController.js`, `routes/auth.routes.js`, `middleware/auth.js` | `pages/Login.jsx`, `pages/Register.jsx`, `context/AuthContext.jsx`, `services/authService.js` | `app.js`, `AppRoutes.jsx`, `schema.sql` (users) |
| Md. Safiur Khan Siam (356) | Household (FR-03, FR-04) | `controllers/wasteController.js`, `controllers/walletController.js`, `routes/waste.routes.js` | `components/Household/`, `services/wasteService.js` | `app.js`, `AppRoutes.jsx`, `schema.sql` (listings, wallets) |
| Yeaseen Arafat Hridit (361) | Collector (FR-05, 06, 09) | `controllers/notificationController.js`, `routes/notification.routes.js`, pickup logic (new `pickup.routes.js` when needed) | `components/Collector/`, `services/pickupService.js` | `app.js`, `AppRoutes.jsx`, `schema.sql` (pickups) |
| Abid Hasan Plabon (369) | Company (FR-07, FR-08) | `controllers/userController.js` company flows, new subscription controller/routes when needed | `components/Company/`, `services/companyService.js` | `app.js`, `AppRoutes.jsx`, `schema.sql` (subscriptions, orders) |
| Anabil Chakma (378) | Payments (FR-10) | `controllers/paymentController.js`, `services/` (gateway), `routes/payment.routes.js` | payment/wallet UI shared pieces, `services/paymentService.js` | `app.js`, `schema.sql` (transactions), root `package.json` |
| Lamia Tabassum Disha (383) | Admin (FR-11) | `controllers/adminController.js`, `routes/admin.routes.js` | `components/Admin/`, `services/adminService.js` | `app.js`, `AppRoutes.jsx`, `schema.sql` (audit logs) |

Note: `walletController` belongs to Household (Siam); Anabil's payment code calls it via
its exported functions — he does not edit that file.

## 3. Shared Files Protocol

Genuinely shared files (everyone eventually adds a line):

- `backend/app.js` — route mounting
- `frontend/src/routes/AppRoutes.jsx` — route entries
- `root package.json` — scripts/deps
- `.eslintrc.json` — lint config (change only by group decision)
- `backend/database/schema.sql` — table definitions

Rules:

1. **Additions go one-per-line at the designated spot** (route mounts grouped at the bottom
   of the mount block, one table block per feature in `schema.sql`) — small diffs merge clean.
2. **Announce in the group chat before editing** any shared file.
3. **Never reformat these files wholesale** — no re-indenting, re-sorting, or "cleanup"
   commits. Never run bulk formatters or CRLF↔LF conversions across the repo.
4. Windows machines: run this **once** so line endings never pollute a diff:

   ```bash
   git config core.autocrlf true
   ```

## 4. Definition of Done (every PR)

- [ ] `npm run lint` — **zero errors, zero warnings** (`server.js` suppresses its boot log with a targeted `eslint-disable-next-line no-console`)
- [ ] **JSDoc** on every new class, constructor, and exported function — with `@param` and `@returns`
- [ ] **Vitest test alongside the source**: `foo.js` → `foo.test.js`, and `npm test` passes
- [ ] **No bidding or escrow** concepts — both are cut from scope; delete stale references on sight
- [ ] **MVC boundaries respected**: React never queries MySQL · controllers never render · models never import Express
- [ ] Branch is rebased on latest `develop`; PR targets `develop`

## 5. Getting Started

```bash
git clone https://github.com/Mahima382/SWEEP.git
cd SWEEP

# Install in all three places
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Environment
cp backend/.env.example backend/.env   # then fill in DB creds etc.

# Run
npm run dev:backend     # Express on port 5000
npm run dev:frontend    # React (Vite)
npm test                # Vitest
npm run lint            # must be zero errors
```

Stuck for more than 30 minutes? Post in the group chat — someone else has probably hit it.
