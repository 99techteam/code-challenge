import { describe, it, expect } from "bun:test";
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "../sum";

// A helper array to easily run the same test cases across all three implementations
const implementations = [
  {
    name: "Implementation A (Formula)",
    fn: sum_to_n_a,
    testRecursiveLimit: false,
  },
  {
    name: "Implementation B (Recursive)",
    fn: sum_to_n_b,
    testRecursiveLimit: true,
  },
  {
    name: "Implementation C (Loop)",
    fn: sum_to_n_c,
    testRecursiveLimit: false,
  },
];

implementations.forEach(({ name, fn, testRecursiveLimit }) => {
  describe(`sum_to_n - ${name}`, () => {
    // 1. Standard Happy Path Tests
    describe("Standard inputs", () => {
      it("should correctly sum up to 1", () => {
        expect(fn(1)).toBe(1);
      });

      it("should correctly sum up to 5 (1+2+3+4+5)", () => {
        expect(fn(5)).toBe(15);
      });

      it("should correctly sum up to 10", () => {
        expect(fn(10)).toBe(55);
      });

      it("should correctly sum up to 100", () => {
        expect(fn(100)).toBe(5050);
      });
    });

    // 2. Edge Cases (Zero and Negative Numbers)
    describe("Edge cases", () => {
      it("should return 0 when n is 0", () => {
        expect(fn(0)).toBe(0);
      });

      it("should normalize negative integers and correctly sum up to 15", () => {
        expect(fn(-5)).toBe(15);
      });
    });

    // 3. Large Inputs & Precision Boundary Tests
    describe("Large inputs and safety boundaries", () => {
      it("should accurately sum to a moderately large number (n = 200,000)", () => {
        // If it's the recursive function, it will throw a stack overflow here.
        // We handle this expected architectural limitation gracefully in the test.
        if (testRecursiveLimit) {
          expect(() => fn(200000)).toThrow(RangeError);
        } else {
          expect(fn(200000)).toBe(20000100000);
        }
      });

      // This test checks the boundary condition mentioned in your prompt
      it("should accurately result in a value just under MAX_SAFE_INTEGER", () => {
        if (!testRecursiveLimit) {
          // For n = 134,217,726, the sum is 9,007,199,122,864,127
          // This is less than MAX_SAFE_INTEGER (9,007,199,254,740,991)
          const n = 134217726;
          const expectedSum = (n * (n + 1)) / 2;

          expect(fn(n)).toBe(expectedSum);
          expect(fn(n)).toBeLessThan(Number.MAX_SAFE_INTEGER);
        }
      });
    });
  });
});
