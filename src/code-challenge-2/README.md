# Mini Campaign Manager — AI Full-Stack Code Challenge

A full-stack email campaign management tool built with Node.js, PostgreSQL, React, TypeScript, Redux, and React Query.

## Tech Stack

| Layer    | Choice |
|----------|--------|
| Backend  | Node.js 20, Express 4, TypeScript 5 |
| Database | PostgreSQL 16, raw SQL via `pg` |
| Auth     | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| Frontend | React 19, TypeScript, Vite |
| State    | Redux Toolkit (auth) + React Query (server state) |
| Styling  | Plain CSS with design tokens |
| Tests    | Jest + ts-jest + Supertest |
| Infra    | Docker Compose |

---

## Quick Start (Docker)

```bash
cd src/code-challenge-2
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Demo login: `demo@example.com` / `password123`

---

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16 running locally

### Backend

```bash
cd backend
cp .env.example .env          # edit DB credentials if needed
npm install
npm run migrate               # run SQL migrations
npm run seed                  # load demo data
npm run dev                   # starts on :3001
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # starts on :5173
```

---

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user, returns JWT |
| POST | `/auth/login` | Login, returns JWT |

### Campaigns (all require `Authorization: Bearer <token>`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/campaigns` | List campaigns (filter: `?status=draft&page=1&limit=10`) |
| POST | `/campaigns` | Create campaign with recipients |
| GET | `/campaigns/:id` | Campaign detail + stats + recipients |
| PATCH | `/campaigns/:id` | Update (draft only) |
| DELETE | `/campaigns/:id` | Delete (draft only) |
| POST | `/campaigns/:id/schedule` | Schedule (requires `scheduled_at` ISO datetime) |
| POST | `/campaigns/:id/send` | Simulate send |
| GET | `/campaigns/:id/stats` | `{ total, sent, failed, opened, open_rate, send_rate }` |

### Business Rules
- Campaigns can only be edited or deleted when `status = 'draft'`
- `scheduled_at` must be a future timestamp
- Sending transitions status to `sent` and cannot be undone
- Status flow: `draft → scheduled → sent` or `draft → sent`

---

## Database Schema

```sql
users              — id, email, name, password, created_at
campaigns          — id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at
recipients         — id, email, name, created_at
campaign_recipients — campaign_id, recipient_id, status, sent_at, opened_at
```

**Indexes:**
- `campaigns(status)` — filter by status in list view
- `campaigns(created_by)` — scope campaigns to owner
- `campaigns(created_at DESC)` — sort by newest
- `campaign_recipients(campaign_id)` — aggregate stats per campaign
- `campaign_recipients(campaign_id, status)` — count by status efficiently

---

## Running Tests

```bash
cd backend
npm test
```

17 tests across 3 suites:
- `campaign.service.test.ts` — stats calculation (zero rates, correct percentages)
- `validators.test.ts` — Zod schema validation (past dates, invalid emails, etc.)
- `business-rules.test.ts` — HTTP-level enforcement (edit/delete only draft, no re-send)

---

## How I Used Claude Code

### What I delegated to Claude Code

- Scaffolding the full project structure (directories, package.json, tsconfig, Docker files)
- Writing boilerplate: Express router setup, middleware wiring, Zod schemas
- Generating the CSS design system (tokens, component styles)
- Writing the initial test stubs and supertest mock patterns
- Drafting the PostgreSQL migration SQL and index rationale

### Real prompts I used

1. *"Build a REST API with Express + TypeScript + pg for a campaign manager. Schema: User, Campaign (draft/scheduled/sending/sent), Recipient, CampaignRecipient. Include JWT auth middleware, Zod validation, and enforce business rules: only draft campaigns can be edited/deleted, scheduled_at must be future, send is irreversible."*

2. *"Write 3 test suites for the backend: one for the stats service (mock the pool), one for Zod validators, one for business rules using supertest with a mocked pool. Cover: zero-rate edge cases, past scheduled_at rejection, edit/delete blocked on non-draft, re-send blocked."*

3. *"Build the React frontend with Redux Toolkit for auth state, React Query for server state, react-router-dom for routing. Pages: /login, /campaigns (list with status filter tabs + pagination), /campaigns/new (form with recipient tag input), /campaigns/:id (detail with stats bar, action buttons conditionally shown by status, recipient table)."*

### Where Claude Code was wrong or needed correction

- **TypeScript strict mode**: Claude used `import { FormEvent }` instead of `import type { FormEvent }` — caught by `verbatimModuleSyntax` and fixed manually.
- **`better-sqlite3` native build**: Claude initially chose `better-sqlite3` for problem 5, which fails to compile on Node 25. Switched to `@libsql/client` (pure JS).
- **Test mock depth**: The initial business-rules tests didn't account for the `pool.connect()` call in the send route's transaction — required adding a mock for `connect()` returning a client with `query`, `release`.

### What I would not let Claude Code do — and why

- **Write the SQL migration without review**: Index choices have long-term performance implications. I reviewed and confirmed each index is justified before committing.
- **Choose the auth storage strategy**: Storing JWT in `sessionStorage` vs `httpOnly` cookie is a security decision. I chose `sessionStorage` for simplicity in this demo but would use `httpOnly` cookies in production — this is a deliberate trade-off I own.
- **Push to a public repo automatically**: The challenge involves credentials and business logic. I review all code before any public exposure.
