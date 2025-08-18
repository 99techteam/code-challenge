import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './index';

function test(name: string, fn: () => boolean) {
  const result = fn();
  console.log(`${result ? '✅' : '❌'} ${name}`);
}

function allEqual(n: number, expected: number) {
  return (
    sum_to_n_a(n) === expected &&
    sum_to_n_b(n) === expected &&
    sum_to_n_c(n) === expected
  );
}

console.log('Testing sum functions...\n');

test('sum_to_n(5) = 15', () => allEqual(5, 15));
test('sum_to_n(1) = 1', () => allEqual(1, 1));
test('sum_to_n(0) = 0', () => allEqual(0, 0));
test('negative returns 0', () => allEqual(-5, 0));
test('sum_to_n(100) = 5050', () => allEqual(100, 5050));

// Check consistency across different values
test('all methods consistent', () => {
  for (const n of [1, 5, 10, 25]) {
    const [a, b, c] = [sum_to_n_a(n), sum_to_n_b(n), sum_to_n_c(n)];
    if (a !== b || b !== c) return false;
  }
  return true;
});

console.log('\nDemo:');
[5, 10, 100].forEach(n => {
  console.log(`n=${n}: ${sum_to_n_a(n)} (all methods match)`);
});
