# Mini Ticket Tracker

A small support-ticket tracker: a REST API over PostgreSQL with a lightweight web UI.

- **API:** FastAPI (async) + SQLAlchemy 2.0 + Alembic, validated with Pydantic v2
- **Database:** PostgreSQL
- **Web:** Next.js (App Router), consuming a client generated from the API's OpenAPI schema

> Status: the API is complete and covered by integration tests. The Next.js web UI is in
> progress and consumes the same OpenAPI contract.

## Run it

### With Docker (API + database)
```bash
docker compose up --build        # API on :8000 ( /docs for Swagger ), Postgres on :5432
```

### Locally
```bash
docker compose up -d db          # Postgres only
cd api
uv sync
export DATABASE_URL=postgresql+asyncpg://tickets:tickets@localhost:5432/tickets
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

### Tests
```bash
cd api && uv run pytest          # spins an ephemeral Postgres via testcontainers
```

## Configuration
| Variable       | Used by | Example |
|----------------|---------|---------|
| `DATABASE_URL` | api     | `postgresql+asyncpg://tickets:tickets@localhost:5432/tickets` |
| `CORS_ORIGINS` | api     | `http://localhost:3000` |

## API
| Method | Path             | Description |
|--------|------------------|-------------|
| POST   | `/tickets`       | Create a ticket |
| GET    | `/tickets`       | List tickets; `?status=` filter, `?page=&limit=` pagination |
| PATCH  | `/tickets/{id}`  | Update a ticket's status and/or priority |
| GET    | `/tickets/stats` | Ticket counts grouped by status |

A ticket has: `id` (uuid), `title`, `description?`, `status` (`open|in_progress|closed`),
`priority` (`low|medium|high`), `created_at`, `updated_at`. Interactive docs at `/docs`.

## Deployment
The API is a standalone container, deployable to any container host (the reference target is
GCP Cloud Run with a managed Postgres such as Neon; the same image runs on Azure Container
Apps). The web app deploys to Vercel and talks to the API server-side.

## Decisions & Tradeoffs
- **Contract-first across the stack.** Pydantic models are the single source of truth; the
  API publishes an OpenAPI schema and the frontend generates its TypeScript client from it, so
  the client and server can't silently drift. One extra codegen step buys end-to-end type safety.
- **Separate persistence and API models.** The SQLAlchemy table and the Pydantic request/response
  schemas are distinct, so storage shape never leaks over the wire and the two can evolve
  independently. Slightly more code; the right call beyond a toy.
- **Validation at the boundary.** Enum and length checks live in Pydantic; the database adds
  CHECK constraints as defense in depth rather than as the primary gate.
- **Offset pagination + UUID keys.** Matches the spec's `page`/`limit`; UUIDs avoid enumerable
  ids. Keyset pagination and time-ordered UUIDs are the changes I'd make once the table is large.
- **Integration tests over a real Postgres**, not mocks — they exercise the actual query and
  migration paths, which is what I'd trust before shipping.
- **Assumptions:** new tickets default to `status=open` and `priority=medium`; `PATCH` requires at
  least one of status/priority; `limit` is capped at 1–100 (default 20).
- **Deliberately out of scope** (the point of the exercise is knowing where to stop): auth,
  multi-tenancy, soft-delete, audit history, full-text search, real-time updates, and caching.
  With more time I'd add authentication and an assignee/field for filtering first.
