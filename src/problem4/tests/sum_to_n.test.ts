import { describe, it, expect } from "bun:test";
import { sum_to_n_c, sum_to_n_b, sum_to_n_a  } from "../src/sum_to_n";


const cases = [
  { n: 0, expected: 0 },
  { n: 1, expected: 1 },
  { n: 5, expected: 15 },
  { n: 10, expected: 55 },
  { n: 100, expected: 5050 },
];

describe("sum_to_n functions", () => {
  it("sum_to_n_a (formula)", () => {
    for (const c of cases) expect(sum_to_n_a(c.n)).toBe(c.expected);
  });

  it("sum_to_n_b (reduce)", () => {
    for (const c of cases) expect(sum_to_n_b(c.n)).toBe(c.expected);
  });

  it("sum_to_n_c (generator)", () => {
    for (const c of cases) expect(sum_to_n_c(c.n)).toBe(c.expected);
  });
});

describe("validation", () => {
  it("throws for invalid input", () => {
    
    expect(() => sum_to_n_a(-1)).toThrow();
    
    expect(() => sum_to_n_b(4.2)).toThrow();
    
    expect(() => sum_to_n_c(NaN)).toThrow();
  });
});
