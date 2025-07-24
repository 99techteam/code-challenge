import { performance } from "perf_hooks";
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "../src/sum_to_n";

function benchmark(fn: (n: number) => number, label: string, n: number): void {
  const start = performance.now();
  const result = fn(n);
  const end = performance.now();
  console.log(
    `${label} → result: ${result}, time: ${(end - start).toFixed(4)}ms`
  );
}

const n = 5000;
console.log(`Benchmarking with n = ${n}\n`);
benchmark(sum_to_n_a, "sum_to_n_a (O(1))", n);
benchmark(sum_to_n_b, "sum_to_n_b (O(n) loop)", n);
benchmark(sum_to_n_c, "sum_to_n_c (O(n) recursion)", n); // May stack overflow
