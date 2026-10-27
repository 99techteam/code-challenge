# 99Tech Fullstack Code Challenge

Solutions to the four problems in the **Fullstack** tab of the challenge brief:

| Problem | Solution | Run |
| --- | --- | --- |
| 2 — Fancy Form | [React + Vite currency swap preview](src/problem2/README.md) | `cd src/problem2 && npm install && npm run dev` |
| 4 — Three ways to sum to n | [TypeScript functions and complexity notes](src/problem4/README.md) | `cd src/problem4 && npm install && npm test` |
| 5 — A Crude Server | [Express + SQLite CRUD API](src/problem5/README.md) | `cd src/problem5 && npm install && npm run dev` |
| 6 — Architecture | [Live scoreboard module specification](src/problem6/README.md) | Read the specification and sequence diagram |

Use **Node.js 24+**. Each runnable problem has its own package, lockfile, commands and README. Problem 2 consumes the supplied reference price snapshot and simulates confirmation; it does not perform a real asset transfer. Problem 5 persists data to a local SQLite file. No secrets are required.

To verify all runnable solutions from their respective directories, run `npm test` for Problems 2, 4 and 5; run `npm run build` for Problems 2 and 5, and `npm run typecheck` for Problem 4. See the per-problem notes for assumptions and API details.
