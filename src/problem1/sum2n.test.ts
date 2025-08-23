import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum2n";

describe("sum_to_n_a", () => {
  test("should throw an error when n is not an integer", () => {
    expect(() => sum_to_n_a(0.5)).toThrow("Invalid input");
  });
  test("should throw an error when n greater than Number.MAX_SAFE_INTEGER", () => {
    expect(() => sum_to_n_a(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      "Invalid input"
    );
  });
  test("should return 0 when n is 0", () => {
    expect(sum_to_n_a(0)).toBe(0);
  });
  test("should return 0 when n is negative", () => {
    expect(sum_to_n_a(-1)).toBe(0);
  });
  test("should return the sum of numbers from 1 to n when n is negative", () => {
    expect(sum_to_n_a(5)).toBe(15);
  });
});

describe("sum_to_n_b", () => {
  test("should throw an error when n is not an integer", () => {
    expect(() => sum_to_n_b(0.5)).toThrow("Invalid input");
  });
  test("should throw an error when n greater than Number.MAX_SAFE_INTEGER", () => {
    expect(() => sum_to_n_b(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      "Invalid input"
    );
  });
  test("should return 0 when n is 0", () => {
    expect(sum_to_n_b(0)).toBe(0);
  });
  test("should return 0 when n is negative", () => {
    expect(sum_to_n_b(-1)).toBe(0);
  });
  test("should return the sum of numbers from 1 to n when n is negative", () => {
    expect(sum_to_n_b(5)).toBe(15);
  });
});

describe("sum_to_n_c", () => {
  test("should throw an error when n is not an integer", () => {
    expect(() => sum_to_n_c(0.5)).toThrow("Invalid input");
  });
  test("should throw an error when n greater than Number.MAX_SAFE_INTEGER", () => {
    expect(() => sum_to_n_c(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      "Invalid input"
    );
  });
  test("should return 0 when n is 0", () => {
    expect(sum_to_n_c(0)).toBe(0);
  });
  test("should return 0 when n is negative", () => {
    expect(sum_to_n_c(-1)).toBe(0);
  });
  test("should return the sum of numbers from 1 to n when n is negative", () => {
    expect(sum_to_n_c(5)).toBe(15);
  });
});
