import { describe, expect, it } from "vitest";
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n.js";

const implementations = [
  ["sum_to_n_a", sum_to_n_a],
  ["sum_to_n_b", sum_to_n_b],
  ["sum_to_n_c", sum_to_n_c],
] as const;

describe.each(implementations)("%s", (_, sum) => {
  it("matches 1 + … + n for small n", () => {
    expect(sum(5)).toBe(15);
    expect(sum(1)).toBe(1);
    expect(sum(10)).toBe(55);
  });

  it("returns 0 for n < 1", () => {
    expect(sum(0)).toBe(0);
    expect(sum(-1)).toBe(0);
    expect(sum(-100)).toBe(0);
  });

  it("agrees with naive reference for 0..100", () => {
    for (let n = 0; n <= 100; n++) {
      let ref = 0;
      for (let i = 1; i <= n; i++) ref += i;
      expect(sum(n)).toBe(ref);
    }
  });

  it("rejects non-number at runtime (TS types are erased in JS)", () => {
    expect(() => sum("5" as unknown as number)).toThrow(TypeError);
    expect(() => sum("5" as unknown as number)).toThrow(/n must be a number/);

    expect(() => sum(null as unknown as number)).toThrow(TypeError);
    expect(() => sum(undefined as unknown as number)).toThrow(TypeError);

    expect(() => sum(true as unknown as number)).toThrow(TypeError);
    expect(() => sum({} as unknown as number)).toThrow(TypeError);
    expect(() => sum([] as unknown as number)).toThrow(TypeError);
  });

  it("rejects NaN and infinities", () => {
    expect(() => sum(NaN)).toThrow(/finite/);
    expect(() => sum(Number.POSITIVE_INFINITY)).toThrow(/finite/);
    expect(() => sum(Number.NEGATIVE_INFINITY)).toThrow(/finite/);
  });

  it("rejects non-integer finite numbers", () => {
    expect(() => sum(1.5)).toThrow(/integer/);
    expect(() => sum(-2.25)).toThrow(/integer/);
  });
});

describe("implementations agree", () => {
  it("for a range of n", () => {
    for (let n = -5; n <= 200; n++) {
      const a = sum_to_n_a(n);
      expect(sum_to_n_b(n)).toBe(a);
      expect(sum_to_n_c(n)).toBe(a);
    }
  });
});
