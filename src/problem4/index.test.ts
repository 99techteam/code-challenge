import { strictEqual } from "node:assert";
import { test } from "node:test";

import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./index";

const implementations = [
  ["sum_to_n_a", sum_to_n_a],
  ["sum_to_n_b", sum_to_n_b],
  ["sum_to_n_c", sum_to_n_c],
] as const;

for (const [name, sumToN] of implementations) {
  test(`${name} returns the summation from 1 to n`, () => {
    strictEqual(sumToN(1), 1);
    strictEqual(sumToN(5), 15);
    strictEqual(sumToN(10), 55);
    strictEqual(sumToN(100), 5050);
  });

  test(`${name} returns 0 for non-positive input`, () => {
    strictEqual(sumToN(0), 0);
    strictEqual(sumToN(-5), 0);
  });
}
