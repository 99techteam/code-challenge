export function sum_to_n_a(n: number): number {
  // Iterative approach: O(|n|) time, O(1) space.
  let total = 0;

  if (n >= 0) {
    for (let value = 1; value <= n; value += 1) {
      total += value;
    }

    return total;
  }

  for (let value = 0; value >= n; value -= 1) {
    total += value;
  }

  return total;
}

export function sum_to_n_b(n: number): number {
  // Closed-form arithmetic series: O(1) time, O(1) space.
  if (n >= 0) {
    return (n * (n + 1)) / 2;
  }

  return (Math.abs(n) * (n - 1)) / 2;
}

export function sum_to_n_c(n: number): number {
  // Recursive walk: O(|n|) time, O(|n|) call stack space.
  const step = n >= 0 ? 1 : -1;
  const stop = n >= 0 ? n + 1 : n - 1;

  const walk = (current: number, total: number): number => {
    if (current === stop) {
      return total;
    }

    return walk(current + step, total + current);
  };

  return walk(step > 0 ? 1 : 0, 0);
}
