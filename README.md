# SWEEP — Smart Waste Exchange & Eco Platform

A web-based marketplace for recyclable household waste, connecting **Households**,
**Local Collectors**, **Global Collectors**, and **Recycling Companies**, with an
**Admin** overseeing the platform.

> CSE-404 Software Engineering Laboratory · Dept. of CSE, Jahangirnagar University ·
> Group 2, 51st Batch

```
Household  →  Local Collector  →  Global Collector  →  Recycling Company
 (sells)      (collects &         (transports bulk      (buys & processes)
               aggregates)          lots by truck)
```

## Tech Stack (MVC)

| Layer | Technology |
|-------|-----------|
| View | React 18 + Vite (`frontend/`) |
| Controller | Express.js, Node 24, CommonJS (`backend/`) |
| Model | MySQL via mysql2 (`backend/models/`) |
| Auth | bcryptjs + jsonwebtoken |
| Quality | ESLint (Airbnb) · JSDoc · Jest + Supertest + React Testing Library |

## Getting Started

```bash
git clone https://github.com/Mahima382/SWEEP.git
cd SWEEP

# install all three package trees
npm install
npm install --prefix backend
npm install --prefix frontend

# configure the backend environment
cp backend/.env.example backend/.env   # then edit DB credentials / JWT secret
```

## Running

```bash
npm run dev:backend     # Express API on http://localhost:5000  (GET /health to check)
npm run dev:frontend    # Vite dev server on http://localhost:5173 (proxies /api → :5000)
```

## Quality Checks

```bash
npm run lint            # ESLint (Airbnb) over the whole repo — zero errors required
npm test                # backend (Jest + Supertest) then frontend (Jest + RTL) suites
npm run docs            # generate JSDoc into docs/ (gitignored)
```

## Project Structure

```
frontend/   React app — components/ (Household·Collector·Company·Admin), pages/,
            services/ (API calls), hooks/, context/, routes/, layouts/, utils/
backend/    Express app — routes/ → controllers/ → models/, middleware/, config/,
            database/ (schema), utils/
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before your first branch — it defines the
branching model (`feature/frXX-*` → `develop` → `main`), per-member module ownership,
and the shared-files protocol that keeps merge conflicts away.

## Team

Md. Safiur Khan Siam · Yeaseen Arafat Hridit · Abid Hasan Plabon · Anabil Chakma ·
Zakia Sultana Mahima · Lamia Tabassum Disha

**Supervisors:** Dr. Md. Musfique Anwar · Dr. Md. Humayun Kabir
