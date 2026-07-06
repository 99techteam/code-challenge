function createRateLimiter({ windowMs, maxActions }) {
  const buckets = new Map();

  return function allow(userId) {
    const now = Date.now();
    const recent = (buckets.get(userId) || []).filter((t) => now - t < windowMs);

    if (recent.length >= maxActions) {
      return false;
    }

    recent.push(now);
    buckets.set(userId, recent);
    return true;
  };
}

module.exports = { createRateLimiter };
