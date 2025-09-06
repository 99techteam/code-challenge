// Implementation 1: Loop-based approach
// Time Complexity: O(n) - iterates through n numbers
// Space Complexity: O(1) - uses constant extra space
function sumToNLoop(n: number): number {
  let sum = 0
  for (let i = 1; i <= n; i++) {
    sum += i
  }
  return sum
}

// Implementation 2: Recursive approach
// Time Complexity: O(n) - makes n recursive calls
// Space Complexity: O(n) - uses call stack space proportional to n
// Note: This approach may lead to stack overflow for large n
function sumToNRecursive(n: number): number {
  if (n <= 1) {
    return n
  }
  return n + sumToNRecursive(n - 1)
}

// Implementation 3: Mathematical formula approach
// Time Complexity: O(1) - constant time operation
// Space Complexity: O(1) - uses constant extra space
// Uses the formula: sum = n * (n + 1) / 2
function sumToNMath(n: number): number {
  return (n * (n + 1)) / 2
}

// Test all implementations
console.log('Testing sumToN(5):')
console.log('Loop approach:', sumToNLoop(5))
console.log('Recursive approach:', sumToNRecursive(5))
console.log('Math approach:', sumToNMath(5))

console.log('\nTesting sumToN(100):')
console.log('Loop approach:', sumToNLoop(100))
console.log('Recursive approach:', sumToNRecursive(100))
console.log('Math approach:', sumToNMath(100))

console.log('\nTesting sumToN(1000):')
console.log('Loop approach:', sumToNLoop(1000))
console.log('Recursive approach:', sumToNRecursive(1000))
console.log('Math approach:', sumToNMath(1000))

console.log('\nTesting sumToN(10000):')
console.log('Loop approach:', sumToNLoop(10000))
try {
  console.log('Recursive approach:', sumToNRecursive(10000))
} catch (error) {
  console.log(
    'Recursive approach: Stack overflow error - exceeds call stack limit'
  )
}
console.log('Math approach:', sumToNMath(10000))

console.log('\nTesting sumToN(100000):')
console.log('Loop approach:', sumToNLoop(100000))
try {
  console.log('Recursive approach:', sumToNRecursive(100000))
} catch (error) {
  console.log(
    'Recursive approach: Stack overflow error - exceeds call stack limit'
  )
}
console.log('Math approach:', sumToNMath(100000))
