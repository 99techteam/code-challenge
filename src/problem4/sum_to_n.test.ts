import { describe, it, expect } from "vitest";
import { sumIterative, sumRecursive, sumFormula } from "./sum_to_n";

// Tests for iterative approach - handles large numbers but O(n) time
describe("sumIterative", () => {
  it("should return 15 for n = 5", () => {
    expect(sumIterative(5)).toBe(15);
  });

  it("should return 1 for n = 1", () => {
    expect(sumIterative(1)).toBe(1);
  });

  it("should return 0 for n = 0", () => {
    expect(sumIterative(0)).toBe(0);
  });

  it("should return 0 for n = -1", () => {
    expect(sumIterative(-1)).toBe(0);
  });

  it("should return -2 for n = -2", () => {
    expect(sumIterative(-2)).toBe(-2);
  });

  it("should return -5 for n = -3", () => {
    expect(sumIterative(-3)).toBe(-5);
  });

  it("should return 5050 for n = 100", () => {
    expect(sumIterative(100)).toBe(5050);
  });

  it("should handle large numbers without overflow", () => {
    expect(sumIterative(100000)).toBe(5000050000);
  });

  it("should handle large negative numbers", () => {
    expect(sumIterative(-100000)).toBe(-5000049999);
  });
});

// Tests for recursive approach - uses trampoline to avoid stack overflow
describe("sumRecursive", () => {
  it("should return 15 for n = 5", () => {
    expect(sumRecursive(5)).toBe(15);
  });

  it("should return 1 for n = 1", () => {
    expect(sumRecursive(1)).toBe(1);
  });

  it("should return 0 for n = 0", () => {
    expect(sumRecursive(0)).toBe(0);
  });

  it("should return 0 for n = -1", () => {
    expect(sumRecursive(-1)).toBe(0);
  });

  it("should return -2 for n = -2", () => {
    expect(sumRecursive(-2)).toBe(-2);
  });

  it("should return -5 for n = -3", () => {
    expect(sumRecursive(-3)).toBe(-5);
  });

  it("should return 5050 for n = 100", () => {
    expect(sumRecursive(100)).toBe(5050);
  });

  it("should handle large numbers without stack overflow", () => {
    expect(sumRecursive(100000)).toBe(5000050000);
  });

  it("should handle large negative numbers without stack overflow", () => {
    expect(sumRecursive(-100000)).toBe(-5000049999);
  });
});

// Tests for formula approach - uses BigInt for intermediate overflow protection
describe("sumFormula", () => {
  it("should return 15 for n = 5", () => {
    expect(sumFormula(5)).toBe(15);
  });

  it("should return 1 for n = 1", () => {
    expect(sumFormula(1)).toBe(1);
  });

  it("should return 0 for n = 0", () => {
    expect(sumFormula(0)).toBe(0);
  });

  it("should return 0 for n = -1", () => {
    expect(sumFormula(-1)).toBe(0);
  });

  it("should return -2 for n = -2", () => {
    expect(sumFormula(-2)).toBe(-2);
  });

  it("should return -5 for n = -3", () => {
    expect(sumFormula(-3)).toBe(-5);
  });

  it("should return 5050 for n = 100", () => {
    expect(sumFormula(100)).toBe(5050);
  });

  it("should handle large numbers with BigInt precision", () => {
    expect(sumFormula(100000000)).toBe(5000000050000000);
  });

  it("should handle large negative numbers with BigInt precision", () => {
    expect(sumFormula(-100000000)).toBe(-5000000049999999);
  });
});
