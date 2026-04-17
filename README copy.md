# My Challenge

This workspace contains my own solutions for:

- `problem4`: three TypeScript implementations of sum-to-n
- `problem5`: a TypeScript Express + PostgreSQL CRUD API with a concurrency-safe increment endpoint using TypeORM pessimistic locking
- `problem6`: an implementation-ready architecture package for a real-time scoreboard using PostgreSQL, transactional outbox, CDC/Kafka, Redis projections, and live updates

## Scripts

From this directory:

```bash
npm install
npm run test:problem4
npm run dev:problem5
npm run test:problem5
```

## Notes

- Problem 5 expects PostgreSQL for both development and integration tests.
- See `src/problem5/README.md` for database configuration and the locking test design.
- Problem 6 is a documentation and system-design deliverable under `src/problem6/`.
