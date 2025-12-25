// 🔄 Implementation 1: Array Magic
const sum_to_n_a = function (n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  );
};

// ⚡ Implementation 2: Gauss's Genius
const sum_to_n_b = function (n) {
  return (n * (n + 1)) >> 1;
};

// 🎯 Implementation 3: Functional Recursion
const sum_to_n_c = function (n) {
  return n <= 0 ? 0 : n + sum_to_n_c(n - 1);
};

// ✨ Test Suite
const test = (fn, name) => {
  console.log(`\n${name}`);
  [0, 1, 5, 10, 100].forEach((n) => console.log(`  ${n} → ${fn(n)}`));
};

test(sum_to_n_a, '🔄 Array Magic');
test(sum_to_n_b, "⚡ Gauss's Genius");
test(sum_to_n_c, '🎯 Functional Recursion');
