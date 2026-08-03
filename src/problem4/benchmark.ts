import {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} from "./index";

function benchmark(
  name: string,
  implementation: (n: number) => number,
  input: number,
  iterations: number,
): void {
  let checksum = 0;
  const startedAt = performance.now();

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    checksum += implementation(input);
  }

  const elapsed = performance.now() - startedAt;

  console.log(
    [
      name.padEnd(14),
      `total=${elapsed.toFixed(3)}ms`,
      `avg=${(elapsed / iterations).toFixed(6)}ms`,
      `checksum=${checksum}`,
    ].join("  "),
  );
}

const input = 100_000_000;
const iterations = 20_000;

console.log(`Input: ${input}`);
console.log(`Iterations: ${iterations}`);
benchmark("Gauss", sum_to_n_a, input, iterations);
benchmark("Matrix", sum_to_n_b, input, iterations);
benchmark("Binary blocks", sum_to_n_c, input, iterations);
