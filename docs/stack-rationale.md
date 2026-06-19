# Tech Stack Rationale

The main principle for a 6-week MVP was
**minimising technical risk**: choose the tools team already knows and that ship
auth, data access and tooling out of the box, so time goes into features rather
than wiring.

| Layer | Choice | Why (short) | Main alternative considered |
| --- | --- | --- | --- |
| Frontend | **React + TypeScript** (Vite) | Familiar; largest component ecosystem (calendar, forms, modals); types catch field mix-ups across 6 entities | Vue, Svelte — simpler syntax, smaller ecosystem |
| Backend | **Django REST Framework** | Session auth + CSRF + ORM + migrations + admin out of the box; fewer places to make a security mistake | FastAPI — modern, but auth/ORM must be assembled from parts |
| Database | **PostgreSQL** | Domain is strictly relational; strong DB-level constraints (e.g. conditional `CHECK` for Task/Duty) | MySQL — weaker JSON/constraints; MongoDB — wrong fit for relational data |
| Auth | **Session + HTTP-only cookies** | Not readable by JS, so the session can't be stolen via XSS; trivial logout; CSRF built into Django | JWT in localStorage — XSS-exposed, needs blacklist for logout |
| Containerisation | **Docker + Docker Compose** | Identical env on every machine; `git clone` → `docker compose up`; prod runs the same compose | Bare-metal venv/npm — painful on mixed Windows/macOS teams |
| Deployment | **Hetzner Cloud VPS** | Affordable, full control of a real Linux server, runs our Docker Compose unchanged; transferable ops experience | PaaS (Render, Railway, Fly.io) — faster setup but less control and learning value |

## Notable supporting tools

- **drf-spectacular** — generates the OpenAPI schema served at `/api/schema/`
  (Swagger UI at `/api/docs/`, ReDoc at `/api/redoc/`).
- **orval** — generates the typed frontend API client from that schema, so the
  client and server stay in sync.
- **dependency-injector** — wires services and repositories, keeping the service
  layer testable in isolation.
- **gunicorn** — WSGI server that runs the Django app (the backend container's start command).

## Trade-offs we accept

- **DRF is synchronous** — fine for this MVP (no realtime/streaming).
- **Sessions are server-side** — not horizontally scalable without a shared
  session store, irrelevant for a single-instance deployment.
- **A single VPS** is a single point of failure — acceptable for an MVP; backups
  are manual (see [NFR-8](nfr.md)).
