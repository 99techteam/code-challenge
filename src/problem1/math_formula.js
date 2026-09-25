var sum_to_n_c = function(n) {
    if (!Number.isInteger(n)) {
        throw new TypeError('n must be a finite integer.');
    }
    if (Math.abs(n) > 134217727) {
        throw new RangeError('The sum exceeds the safe integer range.');
    }

    const magnitude = Math.abs(n);
    // Divide the even factor first to keep intermediate integers safe.
    const total = magnitude % 2 === 0
        ? (magnitude / 2) * (magnitude + 1)
        : magnitude * ((magnitude + 1) / 2);
    return n < 0 ? -total : total;
};
