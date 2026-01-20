import assert from "assert"
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./index"

const functions = [
  { name: 'sum_to_n_a', fn: sum_to_n_a },
  { name: 'sum_to_n_b', fn: sum_to_n_b },
  { name: 'sum_to_n_c', fn: sum_to_n_c }
]

console.log("Starting Tests...\n")

let passed = 0
let failed = 0

function runTest(testName, action) {
  try {
    action()
    console.log(`✅ [PASS] ${testName}`)
    passed++
  } catch (e) {
    console.error(`❌ [FAIL] ${testName}`)
    console.error(`   Error: ${e.message}`)
    failed++
  }
}

functions.forEach(function(impl) {
  const fn = impl.fn
  const name = impl.name

  console.log(`Testing implementation: ${name}`)

  // Test Case 1: Standard Input
  runTest(`${name}(5) should be 15`, function() {
    assert.strictEqual(fn(5), 15)
  })

  // Test Case 2: Base Case 1
  runTest(`${name}(1) should be 1`, function() {
    assert.strictEqual(fn(1), 1)
  })

  // Test Case 3: Base Case 0
  runTest(`${name}(0) should be 0`, function() {
    assert.strictEqual(fn(0), 0)
  })

  // Test Case 4: Large Input (within stack limit for recursion)
  runTest(`${name}(100) should be 5050`, function() {
    assert.strictEqual(fn(100), 5050)
  })

  // Test Case 5: Negative Input
  runTest(`${name}(-1) should throw Error`, function() {
    assert.throws(function() {
      return fn(-1)
    }, /Input must be a non-negative integer/)
  })

  // Test Case 6: Non-integer Input
  runTest(`${name}(5.5) should throw Error`, function() {
    assert.throws(function() {
      return fn(5.5)
    }, /Input must be an integer/)
  })

  // Test Case 7: String Input
  runTest(`${name}('5') should throw Error`, function() {
    assert.throws(function() {
      return fn('5')
    }, /Input must be a number/)
  })

  console.log('---')
})

console.log(`\nTest Summary:`)
console.log(`Total: ${passed + failed}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)

if (failed > 0) {
  process.exit(1)
}
