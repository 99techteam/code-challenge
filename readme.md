## Solutions (Frontend Engineer application)

Applying for the **Frontend Engineer** role, so Problems 1–3 were attempted;
Problems 4–5 are left as-is (out of scope for this role).

### [Problem 1 — Three ways to sum to n](src/problem1/sum_to_n.js)

Three implementations (iterative loop, closed-form Gauss formula, recursive),
plus a `runTestCases()` function that checks all three against a shared set
of inputs, including large values where the recursive version is
intentionally skipped (it would overflow the call stack).

```bash
node src/problem1/sum_to_n.js
```

### [Problem 2 — Fancy Form](src/problem2/)

Currency swap form built with React + TypeScript + Vite. Uses live prices
from `interview.switcheo.com/prices.json` and token icons from
[Switcheo/token-icons](https://github.com/Switcheo/token-icons). See
[src/problem2/README.md](src/problem2/README.md) for details and how it's
structured.

```bash
cd src/problem2
npm install
npm run dev
```

### [Problem 3 — Messy React](src/problem3/analysis.md)

Write-up of the inefficiencies/anti-patterns found in the given code block,
plus a refactored version with an explanation of each change.
