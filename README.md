# 🌍 Darukaa.Earth — Full-Stack Geospatial Data Analytics Platform

> **Hackathon Submission** | Carbon & Biodiversity MRV Dashboard | Full-Stack Geospatial Engineering

A production-grade geospatial data analytics platform for monitoring, reporting, and verification (MRV) of carbon sequestration and biodiversity health across global conservation projects. Built with React + TypeScript, FastAPI, PostgreSQL/PostGIS, and Mapbox GL JS.

---

## 📸 Platform Overview

| Feature | Tech |
|---|---|
| **Interactive Map** | Mapbox GL JS + `@mapbox/mapbox-gl-draw` polygon delineation |
| **Carbon Analytics** | Chart.js time-series trajectories, biodiversity radar charts |
| **Backend API** | FastAPI + SQLAlchemy + Shapely spatial service |
| **Database** | PostgreSQL + PostGIS (SQLite fallback for zero-config dev) |
| **Auth** | JWT via `python-jose` / `passlib[bcrypt]` |
| **CI/CD** | GitHub Actions (lint → test → auto-deploy to Render.com) |
| **Code Quality** | ESLint + Prettier (via Husky + lint-staged) + Flake8 + Black + pre-commit |

---

## 🏗 Architecture

```
Darukaa___FullStack_Hackathon_/
├── backend/                        # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/                 # REST endpoints (auth, projects, sites, analytics, seed)
│   │   ├── core/                   # Settings, Security (JWT), Database engine
│   │   ├── db/                     # Seed data with 5 real-world projects & 9 PostGIS polygon sites
│   │   ├── models/                 # SQLAlchemy ORM models (User, Project, Site, Analytics, Activity)
│   │   ├── schemas/                # Pydantic v2 request/response schemas
│   │   └── services/               # Business logic (auth, project, site, analytics, spatial)
│   ├── tests/                      # Pytest test suite (12 tests)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                       # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/client.ts           # Axios API client with JWT interceptors
│   │   ├── components/
│   │   │   ├── analytics/          # Chart.js components (Carbon, Biodiversity, NDVI, Biome)
│   │   │   ├── common/             # Navbar, Sidebar, StatCard, Badge, Modal, EmptyState
│   │   │   ├── map/                # MapboxMap (draw + layer + click interaction)
│   │   │   ├── projects/           # ProjectCard, ProjectModal (create/edit CRUD)
│   │   │   └── sites/              # SiteDrawer (telemetry), CreateSiteModal (from polygon)
│   │   ├── context/AuthContext.tsx # JWT auth state, persist to localStorage
│   │   ├── pages/                  # Dashboard, Projects, ProjectDetail, Map, Analytics
│   │   ├── styles/index.css        # Dark eco-themed design system (CSS custom properties)
│   │   └── types/index.ts          # Full TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
├── .github/workflows/ci.yml        # GitHub Actions CI Pipeline
├── .pre-commit-config.yaml         # Pre-commit hooks (black, flake8, eslint)
└── docker-compose.yml              # Full Docker stack (PostGIS + Backend + Frontend)
```

---

## 🗃 Database Schema

### Entity Relationship

```
users           projects          sites               analytics_snapshots
─────────       ────────          ─────────           ───────────────────
id (PK)         id (PK)           id (PK)             id (PK)
email           name              project_id (FK) ──→ project_id (FK)
hashed_pw       slug              name                site_id (FK)
full_name       project_type      code                timestamp
role            standard          area_hectares       ndvi / evi
organization    status            habitat_type        canopy_cover_pct
is_active       country / region  elevation_m         biomass_density
                biome             centroid_lat/lng    cumulative_tco2e
                estimated_tco2e   geometry_geojson    monthly_flux_tco2e
                budget            carbon_density      species_observed
                created_by_id ──→ canopy_cover_pct   soil_moisture_pct
                                  species_richness
                                  threat_level
```

### PostGIS Geometry
- Sites store polygon geometries as **GeoJSON strings** (`geometry_geojson` column), enabling zero-dependency SQLite dev and full PostGIS compatibility in production.
- The `SpatialService` computes **geodesic area (hectares)** and **centroid coordinates** using Shapely, validated before persistence.

---

## 🚀 Quick Start

### Option A: Local Development (Zero Docker Required)

```bash
# 1. Clone & enter the project
git clone https://github.com/akanshalakhina/Darukaa-Earth-Geospatial-MRV-Platform.git
cd Darukaa-Earth-Geospatial-MRV-Platform

# 2. Backend setup (Python 3.11+)
python -m venv backend/venv
backend/venv/Scripts/activate      # Windows
# source backend/venv/bin/activate # Linux/macOS

pip install -r backend/requirements.txt

# 3. Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env (see Environment Variables section below)

# 4. Start the API server (auto-creates SQLite DB & seeds data)
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Frontend setup (Node 18+)
cd ../frontend
npm install
cp .env.example .env
# Set VITE_MAPBOX_TOKEN in frontend/.env

npm run dev
# → http://localhost:5173
```

**Demo Credentials (auto-seeded):**
| Role | Email | Password |
|---|---|---|
| Lead Auditor | `demo@darukaa.earth` | `Darukaa2025!` |
| Field Analyst | `analyst@darukaa.earth` | `Darukaa2025!` |

### Option B: Docker Compose (Production Stack)

```bash
# Start full stack: PostGIS 15 + FastAPI + Nginx/React
docker compose up --build

# API →   http://localhost:8000
# App →   http://localhost:3000
# Docs →  http://localhost:8000/docs
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./darukaa.db` | SQLite (dev) or `postgresql+psycopg2://...` (production) |
| `SECRET_KEY` | *(set in .env)* | JWT signing secret — change in production |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token lifetime (24h) |
| `PROJECT_NAME` | `Darukaa.Earth Platform` | API title |
| `MAPBOX_ACCESS_TOKEN` | `""` | Optional: served to frontend via API |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Backend API base URL |
| `VITE_MAPBOX_TOKEN` | *(required)* | Mapbox GL JS public token |

---

## 📡 API Overview

All endpoints are prefixed with `/api/v1`. Interactive docs at `/docs` (Swagger UI) and `/redoc`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Login with email/password → returns JWT |
| `POST` | `/auth/register` | Register new user account |
| `GET` | `/auth/me` | Get current authenticated user profile |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/projects` | List all projects (supports `search`, `status`, `biome`, `project_type` filters) |
| `POST` | `/projects` | Create a new carbon/biodiversity project |
| `GET` | `/projects/{id}` | Get project details with computed environmental metrics |
| `PUT` | `/projects/{id}` | Update project attributes |
| `DELETE` | `/projects/{id}` | Delete project + cascade sites + snapshots |

### Sites & Geospatial
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/sites?as_geojson=true` | GeoJSON FeatureCollection for Mapbox GL JS |
| `GET` | `/sites?as_geojson=false` | Plain site list (optionally filtered by `project_id`) |
| `POST` | `/sites` | Create site from GeoJSON polygon (auto-computes area & centroid) |
| `GET` | `/sites/{id}` | Get individual site with all telemetry attributes |
| `PUT` | `/sites/{id}` | Update site geometry or attributes |
| `DELETE` | `/sites/{id}` | Remove site and cascade analytics |
| `GET` | `/sites/{id}/analytics` | Monthly NDVI, biomass, carbon flux time-series |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/overview` | Platform KPIs, carbon trends, biodiversity radar, biome breakdown |
| `GET` | `/analytics/activities` | Recent audit log and MRV milestone stream |

### Utilities
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/seed/reseed` | Force re-seed database with pristine environmental data |
| `GET` | `/health` | Service health check |

---

## 🧪 Tests & Code Quality

### Run Backend Tests
```bash
cd backend
# Activate venv first
pytest -v

# With coverage
pytest --cov=app --cov-report=html
```

**Test Coverage (12 tests):**
- `test_auth.py` — Login success, wrong password, registration, JWT profile verification
- `test_projects.py` — List projects, biome filtering, create project
- `test_sites.py` — GeoJSON response format, polygon creation & area computation, invalid polygon rejection
- `test_analytics.py` — Overview KPIs, recent activities endpoint

### Lint & Format
```bash
# Backend
cd backend
flake8 app tests
black --check app tests

# Frontend
cd frontend
npm run lint
npm run format
```

---

## 🔄 CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and PR to `main`/`master`:

```
Push to main
    │
    ├─► backend-ci  (Python 3.11)
    │     ├── pip install requirements.txt
    │     ├── flake8 app tests          # PEP8 lint
    │     ├── black --check app tests   # Format check
    │     └── pytest -v                 # 12-test suite
    │
    ├─► frontend-ci  (Node 20)
    │     ├── npm ci
    │     ├── npm run lint              # ESLint + TypeScript
    │     └── npm run build            # Vite production bundle
    │
    └─► deploy  (only on push, only if both CI jobs pass)
          ├── curl RENDER_BACKEND_DEPLOY_HOOK   # trigger backend redeploy
          └── curl RENDER_FRONTEND_DEPLOY_HOOK  # trigger frontend redeploy
```

### Adding GitHub Secrets for CD

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add two repository secrets:

| Secret Name | Where to get the value |
|---|---|
| `RENDER_BACKEND_DEPLOY_HOOK` | Render Dashboard → Backend service → Settings → Deploy Hook |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Render Dashboard → Frontend service → Settings → Deploy Hook |

> Pull requests only run `backend-ci` and `frontend-ci` — the `deploy` job is skipped. Only merges to `main` trigger a real deployment.

---

## 🌐 Deployment (Render.com)

The project includes a `render.yaml` Blueprint for one-click infrastructure provisioning.

### Step-by-Step Setup

```
1. Push your code to GitHub (private repo)
2. Go to https://render.com → New → Blueprint
3. Connect your GitHub repository
4. Render reads render.yaml and auto-creates:
     - darukaa-postgres  (PostgreSQL 15 managed database)
     - darukaa-backend   (FastAPI Python web service)
     - darukaa-frontend  (React static site with SPA routing)
5. Set manual env vars in Render dashboard:
     - darukaa-backend → MAPBOX_ACCESS_TOKEN (optional)
     - darukaa-frontend → VITE_MAPBOX_TOKEN  (your Mapbox public token)
6. Enable PostGIS on the database:
     - Render dashboard → darukaa-postgres → Shell
     - Run: CREATE EXTENSION IF NOT EXISTS postgis;
7. Copy Deploy Hook URLs from each service → add to GitHub Secrets
```

### Public URLs (after deploy)

| Service | URL |
|---|---|
| Frontend App | `https://darukaa-earth.onrender.com` |
| Backend API | `https://darukaa-backend.onrender.com` |
| Swagger Docs | `https://darukaa-backend.onrender.com/docs` |
| Health Check | `https://darukaa-backend.onrender.com/health` |

> **Note:** Render free-tier services spin down after 15 minutes of inactivity. The first request after a cold start may take ~30 seconds.

---

## 🪝 Husky + lint-staged (Pre-commit Hooks)

Husky is configured at the repository root and runs `lint-staged` automatically before every `git commit`:

```bash
# Install hooks (automatically runs after npm install via the "prepare" script)
cd /  # repo root
npm install

# What runs on git commit (staged files only):
# *.ts / *.tsx  →  prettier --write  +  eslint --fix
# *.css         →  prettier --write
```

Configuration lives in:
- `package.json` (root) — `prepare` script + Husky setup
- `frontend/package.json` — `lint-staged` config block
- `frontend/.husky/pre-commit` — hook shell script
- `.pre-commit-config.yaml` — Python-side hooks (Black, Flake8, Prettier via pre-commit)

Both hook systems co-exist: Husky handles the JS/TS side, `pre-commit` handles the Python side.

```bash
# To manually run lint-staged (same as what the hook does):
cd frontend
npx lint-staged

# To bypass the hook for a WIP commit:
git commit --no-verify -m "WIP: work in progress"
```

---

## 🎨 Design System & UX

The platform uses a custom eco-dark design system (`frontend/src/styles/index.css`):

- **Color Palette**: Deep slate backgrounds (`#0a0f12`), emerald primary (`#10b981`), cobalt blue accent (`#0284c7`)
- **Typography**: Plus Jakarta Sans (headings), JetBrains Mono (site codes)
- **Components**: Glassmorphism cards, animated stat cards, data tables, side-sliding drawers, modal overlays
- **Micro-animations**: `fadeIn`, `modalIn`, `drawerSlide` CSS keyframes on all interactive elements
- **Map**: Dark `mapbox-gl` style with custom chloropleth-like fill colors (green gradient by area), click interactions, and Mapbox Draw polygon tool

---

## 🌐 Key Technical Decisions

| Decision | Rationale |
|---|---|
| **SQLite as default DB** | Zero-config local dev; same SQLAlchemy codebase, just swap `DATABASE_URL` for PostgreSQL |
| **GeoJSON column (not native PostGIS geometry)** | Avoids `geoalchemy2` SQLite incompatibility; Shapely computes area/centroid portably; upgradeable to native geometry in production |
| **Shapely for spatial math** | Geodesic-accurate area computation without PostGIS function calls; works identically in test/dev/prod |
| **JWT in localStorage** | Standard SPA pattern; 401 interceptor auto-clears stale tokens |
| **Chart.js over Highcharts** | Open-source, React-native integration via `react-chartjs-2`, zero license cost |
| **Single `dist/` bundle** | For hackathon evaluation; production would use Nginx code splitting |

---

## 🌿 Seed Data

5 production-realistic environmental projects across 4 continents are auto-seeded:

1. **Sundarbans Blue Carbon & Mangrove Bio-Shield** (India) — Verra VCS, 48,500 tCO2e/yr
2. **Amazonian Alto Mayo Primary Rainforest Corridor** (Peru) — Plan Vivo, 92,000 tCO2e/yr
3. **Cairngorms Peatland Rewetting & Caledonian Forest** (UK) — Gold Standard, 31,500 tCO2e/yr
4. **Serengeti-Mara Acacia Savanna Wildlife Corridor** (Tanzania) — Verra VCS, 28,000 tCO2e/yr
5. **Borneo Katingan Peat Swamp Forest Sanctuary** (Indonesia) — Verra VCS, 115,000 tCO2e/yr

Each project has 1–2 PostGIS polygon sites with 6-month NDVI, canopy, and carbon flux telemetry time-series.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript 5 + Vite 5 |
| **Maps** | Mapbox GL JS 3 + `@mapbox/mapbox-gl-draw` 1.4 |
| **Charts** | Chart.js 4 + react-chartjs-2 5 |
| **HTTP Client** | Axios 1.6 |
| **Icons** | Lucide React |
| **Spatial (JS)** | `@turf/turf` 6 |
| **Backend** | FastAPI 0.110 + Uvicorn 0.28 |
| **ORM** | SQLAlchemy 2.0 + Pydantic v2 |
| **Auth** | python-jose (JWT) + passlib/bcrypt |
| **Spatial (Python)** | Shapely 2.0 |
| **Database** | PostgreSQL 15 + PostGIS 3.3 (or SQLite 3) |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Code Quality** | ESLint, Prettier, Flake8, Black, pre-commit |
