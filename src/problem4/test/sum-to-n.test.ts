import assert from "node:assert/strict";
import test from "node:test";

import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "../src/index.js";

const cases = [
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: 5, expected: 15 },
  { input: -3, expected: -6 },
  { input: 10, expected: 55 }
] as const;

for (const fn of [sum_to_n_a, sum_to_n_b, sum_to_n_c]) {
  test(`${fn.name} returns the expected summation`, () => {
    for (const { input, expected } of cases) {
      assert.equal(fn(input), expected);
    }
  });
}
