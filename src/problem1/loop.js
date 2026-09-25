var sum_to_n_a = function(n) {
    if (!Number.isInteger(n)) {
        throw new TypeError('n must be a finite integer.');
    }
    // Largest magnitude whose triangular sum is a safe JavaScript integer.
    if (Math.abs(n) > 134217727) {
        throw new RangeError('The sum exceeds the safe integer range.');
    }

    let sum = 0;

    if (n > 0) {
        for (let i = 1; i <= n; i++) {
            sum += i;
        }
    } else {
        for (let i = -1; i >= n; i--) {
            sum += i;
        }
    }

    return sum;
};
