const { test } = require('node:test');
const assert = require('node:assert');
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./index.js');

const implementations = [
    ['sum_to_n_a', sum_to_n_a],
    ['sum_to_n_b', sum_to_n_b],
    ['sum_to_n_c', sum_to_n_c],
];

for (const [name, fn] of implementations) {
    test(`${name}: spec example (n=5)`, () => {
        assert.strictEqual(fn(5), 15);
    });

    test(`${name}: base cases`, () => {
        assert.strictEqual(fn(0), 0);
        assert.strictEqual(fn(1), 1);
    });

    test(`${name}: negative input yields empty sum`, () => {
        assert.strictEqual(fn(-1), 0);
        assert.strictEqual(fn(-100), 0);
    });

    test(`${name}: larger input`, () => {
        assert.strictEqual(fn(100), 5050);
    });
}

test('all three implementations agree across a range of inputs', () => {
    for (let n = -5; n <= 200; n++) {
        const results = [sum_to_n_a(n), sum_to_n_b(n), sum_to_n_c(n)];
        assert.ok(results.every((r) => r === results[0]), `disagreement at n=${n}`);
        assert.strictEqual(results[0], n > 0 ? (n * (n + 1)) / 2 : 0);
    }
});
