import { it } from "bun:test";
import { sum_to_n_c, sum_to_n_b, sum_to_n_a  } from "../src/sum_to_n";

/**
 * Simple performance comparison between implementations
 * Not a strict unit test — for insight only
 */
it("benchmark (compare speed)", () => {
  const N = 100_000;
  console.log(`\nBenchmark N=${N}`);

  const t0 = performance.now();
  const r1 = sum_to_n_a(N);
  const t1 = performance.now();
  console.log(`sum_to_n_a (Gauss):     ${(t1 - t0).toFixed(4)} ms`);

  const t2 = performance.now();
  const r2 = sum_to_n_b(N);
  const t3 = performance.now();
  console.log(`sum_to_n_b (Reduce):    ${(t3 - t2).toFixed(4)} ms`);

  const t4 = performance.now();
  const r3 = sum_to_n_c(N);
  const t5 = performance.now();
  console.log(`sum_to_n_c (Generator): ${(t5 - t4).toFixed(4)} ms`);

  if (r1 !== r2 || r1 !== r3) {
    throw new Error("Results mismatch between implementations");
  }
});
