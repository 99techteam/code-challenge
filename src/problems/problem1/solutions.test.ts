import { describe, expect, it } from 'vitest'
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './solutions'

// ── sum_to_n_a (Gaussian closed-form) ────────────────────────────────────────
describe('sum_to_n_a', () => {
  it('returns expected output for typical input', () => {
    expect(sum_to_n_a(5)).toBe(15)
  })

  it('returns neutral value for zero input', () => {
    expect(sum_to_n_a(0)).toBe(0)
  })

  it('returns neutral value for negative input', () => {
    expect(sum_to_n_a(-3)).toBe(0)
  })

  it('handles minimum valid input', () => {
    expect(sum_to_n_a(1)).toBe(1)
  })

  it('handles input at the upper boundary', () => {
    expect(sum_to_n_a(1000)).toBe(500500)
  })
})

// ── sum_to_n_b (iterative loop) ───────────────────────────────────────────────
describe('sum_to_n_b', () => {
  it('returns expected output for typical input', () => {
    expect(sum_to_n_b(5)).toBe(15)
  })

  it('returns neutral value for zero input', () => {
    expect(sum_to_n_b(0)).toBe(0)
  })

  it('returns neutral value for negative input', () => {
    expect(sum_to_n_b(-3)).toBe(0)
  })

  it('handles minimum valid input', () => {
    expect(sum_to_n_b(1)).toBe(1)
  })

  it('handles input at the upper boundary', () => {
    expect(sum_to_n_b(1000)).toBe(500500)
  })
})

// ── sum_to_n_c (recursion) ────────────────────────────────────────────────────
describe('sum_to_n_c', () => {
  it('returns expected output for typical input', () => {
    expect(sum_to_n_c(5)).toBe(15)
  })

  it('returns neutral value for zero input', () => {
    expect(sum_to_n_c(0)).toBe(0)
  })

  it('returns neutral value for negative input', () => {
    expect(sum_to_n_c(-3)).toBe(0)
  })

  it('handles minimum valid input', () => {
    expect(sum_to_n_c(1)).toBe(1)
  })

  it('handles input at the upper boundary', () => {
    expect(sum_to_n_c(1000)).toBe(500500)
  })
})

// ── Parity ────────────────────────────────────────────────────────────────────
describe('parity across all three implementations', () => {
  it('all implementations produce the same output', () => {
    const inputs = [1, 2, 5, 10, 100, 1000]
    for (const input of inputs) {
      expect(sum_to_n_b(input)).toBe(sum_to_n_a(input))
      expect(sum_to_n_c(input)).toBe(sum_to_n_a(input))
    }
  })
})
