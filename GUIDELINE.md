# 99Tech Code Challenge — Backend Guideline

## 1. Context

- **Challenge:** 99Tech Code Challenge #1
- **Role:** Backend Engineer
- **Repository:** `99techteam/code-challenge`
- **Goal:** Implement solutions for 5 problems under `src/problem1/` through `src/problem5/`
- **Evaluation:** Correctness, code quality, architecture, TypeScript usage, error handling, test coverage, and creativity where constraints are open

## 2. Tech Stack

| Layer              | Choice                  |
| ------------------ | ----------------------- |
| Runtime            | Node.js (LTS)           |
| Language           | TypeScript (strict)     |
| Framework          | Express.js              |
| Validation         | Zod                     |
| Testing            | Vitest + Supertest      |
| Linting/Formatting | ESLint + Prettier       |
| DB (if needed)     | SQLite via better-sqlite3 (no external deps) |
| Logging            | pino                    |

## 3. Project Structure

```
code-challenge/
├── src/
│   ├── problem1/                # Independent problem
│   │   ├── index.ts             # Router + public API
│   │   ├── controller/          # HTTP layer
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Data access
│   │   ├── model/               # Domain types/interfaces
│   │   ├── middleware/          # Problem-specific middleware
│   │   ├── schema/              # Zod validation schemas
│   │   └── __tests__/           # Tests
│   │
│   ├── problem2/                # Independent problem
│   ├── problem3/                # Independent problem
│   ├── problem4/                # Independent problem
│   └── problem5/                # Independent problem
│
├── app.ts                       # Express app factory (for testing)
├── server.ts                    # Entry point — starts the server
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── .prettierrc
```

## 4. Architecture Principles

### 4.1 Layered Architecture (per problem)

```
Request → Router → Controller → Service → Repository → Data
                    ↓              ↓
                Validation    Business Logic
                (Zod)         (Domain rules)
```

**Rules:**
- Controller: receives HTTP request, validates input, calls service, formats response
- Service: pure business logic, no HTTP awareness, no Express types
- Repository: data access only, no business logic
- No layer may skip or reverse-call another layer
- Each problem is **independent** — no imports between problems
- Each problem should have its own error handling, middleware, and utilities

### 4.2 Error Handling

- Custom `AppError` base class with `statusCode`, `message`, `code`
- Specific subclasses: `ValidationError`, `NotFoundError`, `ConflictError`
- Each problem has its own error middleware in `problem{n}/middleware/error-handler.ts`
- Errors thrown in services propagate up to the error middleware

### 4.3 Response Format

```typescript
// Success
{ "data": T, "meta"?: PaginationInfo }

// Error (handled by error middleware)
{ "error": { "code": string, "message": string, "details"?: unknown } }
```

## 5. Coding Conventions

### TypeScript
- **Strict mode** — `strict: true` in tsconfig
- **No `any`** — use `unknown` + type guards when type is uncertain
- **Explicit return types** on all exported functions
- **Readonly where possible** — `readonly` properties, prefer `const`
- **Named exports** over default exports
- **Interface** for object shapes, **type** for unions/intersections/utilities

### Style
- Async/await — no raw `.then()` chains
- Descriptive names — `getUserById` not `getUser`
- Single responsibility per function (keep functions small)
- No `console.log` — use `pino` logger
- No unused imports or variables

### Testing
- File naming: `*.test.ts`
- Unit tests for services (mock repositories)
- Integration tests for controllers (Supertest against Express app)
- Cover: happy path, edge cases, error paths
- Test naming: `describe('ServiceName')` → `it('should ...')`

## 6. Dependency Flow

Each problem is **completely independent** — no dependencies between problems.

```
problem1  (standalone)
problem2  (standalone)
problem3  (standalone)
problem4  (standalone)
problem5  (standalone)
```

**What this means:**
- Each problem has its own domain models, services, and utilities
- No problem imports from any other problem
- Each problem is self-contained with its own error handling, middleware, and types

## 7. Per-Problem Workflow

For each problem, the implementation order is:

1. **Read & understand** the problem statement
2. **Define domain models** — types/interfaces in `model/`
3. **Define validation schemas** — Zod in `schema/`
4. **Implement repository** — data access layer
5. **Implement service** — business logic with unit tests
6. **Implement controller** — HTTP layer with integration tests
7. **Wire router** in `index.ts`
8. **Register** in `app.ts`
9. **Verify** — run lint + typecheck + tests

## 8. Evaluation Criteria (what reviewers score on)

| Criteria                  | What they look for                                    |
| ------------------------- | ----------------------------------------------------- |
| Correctness               | Does the solution produce the right output?           |
| Architecture              | Clean separation of concerns, layered design          |
| TypeScript quality        | Type safety, no `any`, proper generics                |
| Error handling            | Edge cases handled, meaningful error messages         |
| Test coverage             | Happy path + error paths tested                       |
| Code readability          | Clean naming, small functions, well-organized         |
| Creativity                | Thoughtful design where requirements are open-ended   |
| Documentation             | README per problem explaining design decisions        |

## 9. Maximizing Evaluation Score

### 9.1 General Principles
- **Read requirements thoroughly** — implement exactly what's asked, nothing more, nothing less
- **Follow the framework** — use the layered architecture, tech stack, and conventions defined in this document
- **Prioritize correctness** — working code beats clever code
- **Test everything** — happy paths, edge cases, error scenarios
- **Document decisions** — explain trade-offs and design choices in per-problem READMEs

### 9.2 Problem-Type Strategy

**Coding Problems** (algorithmic/data structure focused)
- Optimize for time/space complexity as specified
- Handle edge cases explicitly (empty input, null, boundary values)
- Write clear, readable code with meaningful variable names
- Include unit tests covering all scenarios
- Add comments only for non-obvious logic

**Function/Feature Problems** (API endpoints, business logic)
- Strict input validation with Zod schemas
- Proper HTTP status codes (200, 201, 400, 404, 409, 500)
- Consistent response format (`{ data, meta }` / `{ error }`)
- Integration tests with Supertest
- Error handling for all failure paths

**Architecture Problems** (system design, refactoring)
- Clear separation of concerns (controller/service/repository)
- Dependency injection where appropriate
- Extensibility and maintainability
- Document architectural decisions
- Show trade-offs considered

**Documentation Problems** (design docs, technical writing)
- Clear structure with headings, diagrams, examples
- Cover: requirements, design decisions, trade-offs, future improvements
- Use diagrams (Mermaid/ASCII) for architecture/flows
- Keep it concise but comprehensive

### 9.3 Quality Checklist Before Submission
- [ ] All requirements implemented and tested
- [ ] Lint passes with zero warnings
- [ ] TypeScript strict mode, no `any` types
- [ ] Test coverage: happy path + error paths
- [ ] README explains design decisions
- [ ] No hardcoded secrets or credentials
- [ ] Code follows project conventions

## 10. Assumptions & Notes

- Problem statements will be provided per-problem in future sessions
- Problems are **independent** — each is self-contained with no dependencies on other problems
- Each problem should have its own error handling, middleware, and utilities (no shared `common/` directory)
- In-memory data storage is acceptable unless a problem specifies otherwise
- SQLite is available if persistence is needed (no external DB setup required)
- The `app.ts` exports the Express app (without listening) for testability
- The `server.ts` imports `app.ts` and starts the HTTP listener
