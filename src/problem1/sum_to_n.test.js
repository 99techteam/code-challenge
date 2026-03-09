/**
 * Tests for sum_to_n implementations.
 * Run with: node sum_to_n.test.js
 */

var assert = require("assert");
var { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require("./sum_to_n.js");

var implementations = [
  { name: "sum_to_n_a", fn: sum_to_n_a },
  { name: "sum_to_n_b", fn: sum_to_n_b },
  { name: "sum_to_n_c", fn: sum_to_n_c },
];

function runTests() {
  var passed = 0;
  var failed = 0;

  function test(description, n, expected) {
    implementations.forEach(function (impl) {
      try {
        var result = impl.fn(n);
        assert.strictEqual(
          result,
          expected,
          impl.name + "(" + n + ") expected " + expected + ", got " + result
        );
        passed++;
      } catch (err) {
        console.error("FAIL " + impl.name + ": " + description + " — " + err.message);
        failed++;
      }
    });
  }

  // Normal cases
  test("sum to 5", 5, 15);
  test("sum to 1", 1, 1);
  test("sum to 10", 10, 55);
  test("sum to 100", 100, 5050);

  // Edge cases
  test("n = 0", 0, 0);
  test("n negative", -5, 0);
  test("non-integer (floor)", 5.9, 15);

  console.log("Tests: " + passed + " passed, " + failed + " failed");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
