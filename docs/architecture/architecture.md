# System Architecture

FlatFlow is a **client–server web application**: a React single-page app talks to
a Django REST API over HTTP/JSON; PostgreSQL is the single source of persisted
data. For the data side, see the [data model](./data-model.md).

![FlatFlow high-level architecture](./uml/high-level-design.svg)

Source: [`uml/high-level-design.puml`](./uml/high-level-design.puml) -> rendered
to `uml/high-level-design.svg`.

## Components

- **Client** — a **React (TypeScript) SPA** (Vite build). Renders the UI, holds client-side state, and calls the API over HTTP. The typed API client is generated from the backend's OpenAPI schema with [orval](https://orval.dev).
- **Server** — a **Django REST Framework** app that holds all business logic. Its API endpoints return JSON (the SPA renders the UI); the only server-rendered HTML is Django's admin and the auto-generated API docs.
- **Database** — **PostgreSQL**, storing both application data and Django session records.

Client and server are **decoupled**: separate deployables that communicate only
through the REST/JSON API.

## Layered backend

The server follows a layered structure (NFR-5). Each request flows down the
layers and the response returns along the same path:

| Layer | Responsibility | Where it lives |
| --- | --- | --- |
| **Edge** | REST entry: Views/ViewSets, Serializers (JSON I/O), session + CSRF auth | `<app>/viewset.py`, `<app>/serializers.py`, `flatflow/common/urls.py` |
| **Business Logic** | Per-domain services holding logic not tied to one model — e.g. deriving a chore's *Overdue* / *Pending confirmation* status | `<app>/service.py` |
| **Data Access** | Repositories over the Django ORM — the only code that touches the DB | `<app>/repository.py` |
| **Data** | PostgreSQL — app data + sessions | — |

Services depend on a repository, not on ORM queries directly, which gives a
stable, testable data-access seam. Services and repositories are wired together
with a dependency-injection container (`flatflow/common/container.py`).

In MVC terms: the **React SPA is the View** (on the client), DRF
**Views/ViewSets are the Controller**, and the **ORM models + repositories are
the Model**. (Note: Django's own naming is MVT — what it calls a "view" in
`views.py` is the Controller here.)

## Request flow

1. The SPA makes a **REST/JSON call over HTTPS** to `/api/...`.
2. The **Edge** layer authenticates it (**session cookie + CSRF**) and (de)serializes JSON.
3. It delegates to the relevant **domain service**, which reads/writes through a **repository** over the Django ORM.
4. The ORM runs **SQL** against **PostgreSQL**; the JSON response returns to the SPA.

**Authentication** uses session cookies (HTTP-only) with CSRF protection on
state-changing requests (NFR-2). Sessions are stored in PostgreSQL.

## Deployment (summary)

A single Hetzner Cloud VPS runs the backend and PostgreSQL via Docker Compose;
the React app is built to static files served by the host's web server, which
also reverse-proxies `/api` to the backend. CI is a GitHub Actions workflow
(`.github/workflows/deploy.yaml`) that, on push to `main`, SSHes into the VPS,
pulls `main`, rebuilds the containers, runs migrations and re-exports the static
build. See the [README](../../README.md#deployment) for details.
