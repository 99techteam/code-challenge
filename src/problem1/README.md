# Problem 1 — Sum to n

**Input:** `n` (integer). **Output:** `1 + 2 + ... + n`. Result &lt; `Number.MAX_SAFE_INTEGER`.

## Run

```bash
npm install
npm run start
```

## Implementations

**A — Formula**

```ts
var sum_to_n_a = function(n: number): number {
    if (n <= 0) return 0;
    return n * (n + 1) / 2;
};
```

**B — Loop**

```ts
var sum_to_n_b = function(n: number): number {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) sum += i;
    return sum;
};
```

**C — Recursion**

```ts
var sum_to_n_c = function(n: number): number {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
};
```

## Structure

```
problem1/
├── index.ts
├── package.json
└── README.md
```
