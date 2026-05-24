const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./sum_to_n');

function expected(n) {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
}

const cases = [-3, 0, 1, 2, 5, 10, 100];
let allPass = true;
for (const n of cases) {
  const a = sum_to_n_a(n);
  const b = sum_to_n_b(n);
  const c = sum_to_n_c(n);
  const exp = expected(n);
  const pass = (a === exp) && (b === exp) && (c === exp);
  console.log(`n=${n}: a=${a}, b=${b}, c=${c}, expected=${exp} -> ${pass ? 'PASS' : 'FAIL'}`);
  if (!pass) allPass = false;
}

if (!allPass) {
  console.error('Some tests failed');
  process.exit(1);
} else {
  console.log('All tests passed');
}
