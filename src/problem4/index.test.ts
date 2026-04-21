import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./index";

function assertEquals(actual: number, expected: number, name: string) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
  console.log(`${name}: PASS`);
}

assertEquals(sum_to_n_a(5), 15, "sum_to_n_a(5)");
assertEquals(sum_to_n_a(10), 55, "sum_to_n_a(10)");
assertEquals(sum_to_n_a(0), 0, "sum_to_n_a(0)");

assertEquals(sum_to_n_b(5), 15, "sum_to_n_b(5)");
assertEquals(sum_to_n_b(10), 55, "sum_to_n_b(10)");
assertEquals(sum_to_n_b(0), 0, "sum_to_n_b(0)");

assertEquals(sum_to_n_c(5), 15, "sum_to_n_c(5)");
assertEquals(sum_to_n_c(10), 55, "sum_to_n_c(10)");
assertEquals(sum_to_n_c(0), 0, "sum_to_n_c(0)");

console.log("All tests passed!");
