import { performance } from "node:perf_hooks";

function sum_to_n_a(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}

function sum_to_n_b(n: number): number {
  if (n <= 0) {
    return 0;
  }
  return n + sum_to_n_b(n - 1);
}

function sum_to_n_c(n: number): number {
  return (n * (n + 1)) / 2;
}

const BENCHMARK_N = 8_000;
const BENCHMARK_ITERATIONS = 100_000;

type SumFunction = (n: number) => number;

function benchmarkSumFunction(
  name: string,
  fn: SumFunction,
  n: number,
  iterations: number
): void {
  fn(n);

  let resultSink = 0;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    resultSink += fn(n);
  }

  const totalMs = performance.now() - start;
  const averageMs = totalMs / iterations;

  console.log(name);
  console.log(`  total time:   ${totalMs.toFixed(3)} ms`);
  console.log(`  average time: ${averageMs.toFixed(6)} ms per call`);
  void resultSink;
  console.log("");
}

function runTests(): void {
  const testValues = [0, 1, 5, 10, 100];

  console.log("=== sum_to_n test cases ===\n");

  for (const n of testValues) {
    const a = sum_to_n_a(n);
    const b = sum_to_n_b(n);
    const c = sum_to_n_c(n);

    console.log(`n = ${n}`);
    console.log(`  sum_to_n_a (loop):      ${a}`);
    console.log(`  sum_to_n_b (recursion): ${b}`);
    console.log(`  sum_to_n_c (formula):   ${c}`);
    console.log(`  all match: ${a === b && b === c}\n`);
  }

  console.log("Assignment example: sum_to_n(5) =", sum_to_n_c(5));
}

function runBenchmarks(): void {
  console.log("\n=== Performance benchmark ===");
  console.log(`n = ${BENCHMARK_N}, iterations = ${BENCHMARK_ITERATIONS}\n`);

  benchmarkSumFunction("sum_to_n_a (loop)", sum_to_n_a, BENCHMARK_N, BENCHMARK_ITERATIONS);
  benchmarkSumFunction("sum_to_n_b (recursion)", sum_to_n_b, BENCHMARK_N, BENCHMARK_ITERATIONS);
  benchmarkSumFunction("sum_to_n_c (formula)", sum_to_n_c, BENCHMARK_N, BENCHMARK_ITERATIONS);
}

runTests();
runBenchmarks();
