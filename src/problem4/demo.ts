import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum_to_n';

// Simple demo to test all three functions
console.log('Testing sum_to_n functions:\n');

const testNumbers = [5, 10, 100];

testNumbers.forEach(n => {
    console.log(`n = ${n}:`);
    console.log(`  sum_to_n_a: ${sum_to_n_a(n)}`);
    console.log(`  sum_to_n_b: ${sum_to_n_b(n)}`);
    console.log(`  sum_to_n_c: ${sum_to_n_c(n)}`);
    console.log();
});
