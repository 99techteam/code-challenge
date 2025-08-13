import { describe, it, expect } from "vitest";
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./solution";

describe("Solution 1", () => {
  it("Using formula to calculate sum", () => {
    expect(() => sum_to_n_a(-1)).toThrowError();
    expect(sum_to_n_a(3)).toEqual(6);
    expect(sum_to_n_a(5)).toEqual(15);
  });

  it("Using loop to calulate sum", () => {
    expect(() => sum_to_n_b(-1)).toThrowError();
    expect(sum_to_n_b(3)).toEqual(6);
    expect(sum_to_n_b(5)).toEqual(15);
  });

  it("Using recursion to calculate sum", () => {
    expect(() => sum_to_n_c(-1)).toThrowError();
    expect(sum_to_n_c(3)).toEqual(6);
    expect(sum_to_n_c(5)).toEqual(15);
  });
});
