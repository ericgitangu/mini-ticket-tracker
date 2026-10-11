# Mini Ticket Tracker

A small support-ticket tracker: a REST API over PostgreSQL with a lightweight web UI.

- **API** — FastAPI (async): typed, generates OpenAPI for free, and async I/O suits a
  database-bound CRUD service. Python also matches the reviewing team's stack.
- **Database** — PostgreSQL: relational integrity for filtered/aggregated data, with enum
  CHECK constraints and indexes on the columns we filter and sort by.
- **Web** — Next.js (App Router, React 19) as a BFF: Server Components read the API, Server
  Actions handle mutations, and the UI is built with shadcn/ui + Lucide. Its TypeScript client is
  generated from the API's OpenAPI schema, so client and server can't silently drift.

Both services are complete, run together with one command, and the whole stack is containerized.

## Prerequisites

Pick one path.

- **Containers only** — Docker + Docker Compose. Nothing else is required to run the stack.
- **On the host** — Python 3.12, [uv](https://docs.astral.sh/uv/) (dependency + venv manager),
  Docker (for Postgres via `make db`), and [moon](https://moonrepo.dev/) if you want the
  `make`/`moon` task shortcuts. Node 20+ is needed for the web app.

The test suite needs Docker running — it starts an ephemeral Postgres via `testcontainers`.

## Run it

### With Docker (full stack)
```bash
docker compose up --build        # web :3000, API :8000 ( /docs ), Postgres :5432
```
Host ports are configurable to avoid clashes: `DB_PORT=5433 API_PORT=8080 WEB_PORT=3001 docker compose up`.

### On the host
```bash
# API
docker compose up -d db          # Postgres only
cd api
uv sync
export DATABASE_URL=postgresql+asyncpg://tickets:tickets@localhost:5432/tickets
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000

# Web (separate shell)
cd web
pnpm install
pnpm dev                         # http://localhost:3000, reaches the API at API_BASE_URL
```

### Tests
```bash
cd api && uv run pytest          # or: make test   /   moon run api:test
```

## Configuration
| Variable       | Used by | Example |
|----------------|---------|---------|
| `DATABASE_URL` | api     | `postgresql+asyncpg://tickets:tickets@localhost:5432/tickets` |
| `CORS_ORIGINS` | api     | `http://localhost:3000` |
| `API_BASE_URL` | web (server) | `http://localhost:8000` |
| `NEXT_PUBLIC_API_DOCS_URL` | web | `http://localhost:8000/redoc` (footer "API docs" link) |
| `DB_PORT`      | compose | host port for Postgres (default `5432`) |
| `API_PORT`     | compose | host port for the API (default `8000`) |
| `WEB_PORT`     | compose | host port for the web app (default `3000`) |

## API
| Method | Path             | Description |
|--------|------------------|-------------|
| POST   | `/tickets`       | Create a ticket |
| GET    | `/tickets`       | List tickets; `?status=` filter, `?page=&limit=` pagination |
| PATCH  | `/tickets/{id}`  | Update a ticket's status and/or priority |
| GET    | `/tickets/stats` | Ticket counts grouped by status |

A ticket has: `id` (uuid), `title`, `description?`, `status` (`open|in_progress|closed`),
`priority` (`low|medium|high`), `created_at`, `updated_at`. Interactive docs at `/docs`
(Swagger) and `/redoc` (ReDoc).

## Layout
A moon monorepo: `api/` (FastAPI service) and `web/` (Next.js + shadcn/ui). `make` wraps the
common moon tasks; `docker compose` runs the whole stack with Postgres on a persistent volume
and both app sources bind-mounted for live reload.

## Deployment
The API is a standalone container, deployable to any container host (the reference target is
GCP Cloud Run with a managed Postgres such as Neon; the same image runs on Azure Container
Apps). The web app deploys to Vercel and talks to the API server-side.

## Decisions & Tradeoffs
- **Contract-first across the stack.** Pydantic models are the single source of truth; the API
  publishes an OpenAPI schema and the frontend generates its TypeScript client from it, so client
  and server can't drift. One extra codegen step buys end-to-end type safety across a language
  boundary — and keeps the API reusable by non-web consumers (mobile, reporting/BI).
- **Separate persistence and API models.** The SQLAlchemy table and the Pydantic request/response
  schemas are distinct, so storage shape never leaks over the wire and the two evolve independently.
- **Validation at the boundary, integrity in the database.** Enum and length checks live in
  Pydantic; the database adds CHECK constraints and indexes as defense in depth, not as the primary
  gate.
- **Migrations, not `create_all`.** Schema changes go through Alembic so the path that builds the
  database in production is the same one exercised in tests.
- **Offset pagination + UUID keys.** Matches the spec's `page`/`limit`; UUIDs avoid enumerable ids.
  Keyset pagination and time-ordered UUIDs are the changes I'd make once the table is large.
- **Integration tests over a real Postgres**, not mocks — they exercise the actual query and
  migration paths, which is what I'd trust before shipping.
- **Mutations via Server Actions**, with optimistic status updates; shadcn/ui is themed to the
  app's own palette rather than shipped as-is, so the UI reads as deliberate, not templated.
- **Assumptions:** new tickets default to `status=open` and `priority=medium`; `PATCH` requires at
  least one of status/priority; `limit` is capped at 1–100 (default 20).
- **Deliberately out of scope** (the point of the exercise is knowing where to stop): auth,
  multi-tenancy, soft-delete, audit history, full-text search, real-time updates, and caching. With
  more time I'd add authentication and an assignee field for filtering first.
