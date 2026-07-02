# Problem 4 – Sum to N (Golang)

## Overview

This repository contains three different implementations of the classic **sum-to-n** problem.

Although the original challenge task mentioned **TypeScript**, the example code was in **Golang** so I figured the intended language to implement **problem4** is **Golang**. So, the implementations below follow the requirements while taking advantage of Go's language features.

The functions also support **negative integers** by normalizing the input and restoring the sign before returning the result.

---

## Solution A – Arithmetic Series (Gauss Formula)

Uses the arithmetic series formula:

```text
1 + 2 + ... + n = n(n + 1) / 2
```

Since the result is computed mathematically, no iteration is required.

**Complexity**

* **Time:** O(1)
* **Space:** O(1)

**When to use**

This is the optimal solution for this problem and would be the preferred implementation in production whenever the mathematical formula is applicable.

---

## Solution B – Iterative Accumulation

Iterates from `1` to `n`, adding each value to a running total.

**Complexity**

* **Time:** O(n)
* **Space:** O(1)

**When to use**

While it isn't the fastest approach, it's simple, easy to understand, and serves as a good baseline implementation.

---

## Solution C – Parallel Divide & Conquer

This solution takes a different approach.

Instead of processing the entire range sequentially, it recursively splits the range into smaller subranges and computes them in parallel using goroutines. To avoid creating an excessive number of goroutines, parallelism is only applied to the upper levels of recursion. Once a configurable depth or range threshold is reached, the remaining work is completed sequentially.

**Complexity**

* **Time:** O(n)
* **Space:** O(p + log n)

Where:

* `p` is the number of concurrently executing goroutines.
* `log n` is the recursion stack depth.

Although the asymptotic complexity remains **O(n)**, this implementation demonstrates a practical optimization often used in real-world systems: limiting parallelism so that concurrency overhead does not outweigh the work being performed.

For a problem like this, the mathematical solution is still unquestionably the fastest. The goal of this implementation is not to outperform Solution A, but to demonstrate how divide-and-conquer and controlled parallel execution can improve the runtime characteristics of computational workloads that cannot be reduced to a closed-form expression.

---

## Benchmark (reference run)

Benchmarks were executed locally on:

* Go: `1.26.4`
* OS: Linux (Arch)
* CPU: Intel i5-1135G7

```text
Benchmark_sum_to_n_a   ~0.62 ns/op     0 allocs
Benchmark_sum_to_n_c   ~119 µs/op      60 allocs
Benchmark_sum_to_n_b   ~171 µs/op      0 allocs
```

> Results will vary across machines and compiler versions. These are provided as a reference for relative performance only.

---


## Why Three Different Approaches?

Each implementation focuses on a different way of thinking about the same problem.

| Function     | Demonstrates                                          |
| ------------ | ----------------------------------------------------- |
| `sum_to_n_a` | Mathematical optimization                             |
| `sum_to_n_b` | Straightforward iterative solution                    |
| `sum_to_n_c` | Divide-and-conquer with controlled parallel execution |

Rather than implementing the same algorithm three different ways, the intention was to showcase different techniques and the trade-offs between simplicity, mathematical optimization, and practical concurrency.

---

## Running

Run the program:

```bash
go run .
```

Run the benchmarks:

```bash
go test -bench=. -benchmem
```

---

## Notes

Only **Solution A** achieves constant-time complexity and is the clear production choice for this specific problem.

Solutions **B** and **C** are included to demonstrate alternative algorithmic approaches. In particular, Solution **C** explores how Go's concurrency model can be applied in a controlled way to recursive workloads, reflecting techniques that are useful in real-world computational problems where no closed-form solution exists.
