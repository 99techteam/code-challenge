var sum_to_n_b = function(n) {
    if (!Number.isInteger(n)) {
        throw new TypeError('n must be a finite integer.');
    }
    if (Math.abs(n) > 134217727) {
        throw new RangeError('The sum exceeds the safe integer range.');
    }

    function sumPositive(value) {
        if (value === 0) return 0;
        const half = Math.floor(value / 2);
        // S(2m) = 2*S(m) + m*m; an odd length adds its last term.
        return 2 * sumPositive(half) + half * half + (value % 2 ? value : 0);
    }

    const total = sumPositive(Math.abs(n));
    return n < 0 ? -total : total;
};
