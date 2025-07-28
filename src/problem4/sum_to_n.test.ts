import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n"

describe("sum_to_n", () => {
  it("small input: method a", () => {
    expect(sum_to_n_a(10)).toBe(55)
  })

  it("small input: method b", () => {
    expect(sum_to_n_b(10)).toBe(55)
  })

  it("small input: method c", () => {
    expect(sum_to_n_c(10)).toBe(55)
  })

  const largeInputNumber = Math.floor(Math.sqrt(2 * Number.MAX_SAFE_INTEGER))
  const result = (largeInputNumber * (largeInputNumber + 1)) / 2

  it("large input: method a", () => {
    expect(sum_to_n_a(largeInputNumber)).toBe(result)
  })

  it("large input: method b", () => {
    expect(sum_to_n_b(largeInputNumber)).toBe(result)
  })

  it("large input: method c", () => {
    expect(sum_to_n_c(largeInputNumber)).toBe(result)
  })

  it("negative input: method a", () => {
    expect(sum_to_n_a(-1)).toBe(0)
  })

  it("negative input: method b", () => {
    expect(sum_to_n_b(-1)).toBe(0)
  })

  it("negative input: method c", () => {
    expect(sum_to_n_c(-1)).toBe(0)
  })
})
