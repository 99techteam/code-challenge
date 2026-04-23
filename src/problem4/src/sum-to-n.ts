function assertSafeInteger(n: number): void {
    if (!Number.isSafeInteger(n)) {
        throw new TypeError("n must be a safe integer");
    }
}

// Approach A: Iterative loop.
export function sum_to_n_a(n: number): number {
    assertSafeInteger(n);

    let sum = 0;

    if (n >= 0) {
        for (let i = 1; i <= n; i += 1) {
            sum += i;
        }

        return sum;
    }

    for (let i = n; i <= -1; i += 1) {
        sum += i;
    }

    return sum;
}

// Approach B: Math formula.
export function sum_to_n_b(n: number): number {
    assertSafeInteger(n);

    const abs = Math.abs(n);
    const sum = (abs * (abs + 1)) / 2;

    return n < 0 ? -sum : sum;
}

// Approach C: Pair values from both ends of the range.
export function sum_to_n_c(n: number): number {
    assertSafeInteger(n);

    if (n === 0) {
        return 0;
    }

    let left = n > 0 ? 1 : n;
    let right = n > 0 ? n : -1;
    let sum = 0;

    while (left < right) {
        sum += left + right;
        left += 1;
        right -= 1;
    }

    if (left === right) {
        sum += left;
    }

    return sum;
}
