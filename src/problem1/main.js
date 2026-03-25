// Iterative: For loop
var sum_to_n_a = function(n) {
  if (n <= 0) {
    return 0;
  }

  let sum = 0;

  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
};

// Iterative: While loop
var sum_to_n_b = function(n) {
  if (n <= 0) {
    return 0;
  }
  
  let sum = 0;
  let i = 1;
  while (i <= n) {
    sum += i;
    i++;
  }

  return sum;
};

// Mathematical formula: SUM = N * (N + 1) / 2
// The result of expression can exceed the MAX_SAFE_INTEGER, so I divide it before the multiplication to avoid overflow
var sum_to_n_c = function(n) {
  if (n <= 0) {
    return 0;
  }

  return n % 2 === 0 ? (n / 2) * (n + 1) : ((n + 1) / 2) * n;
};

const testCaseList = [
  { n: -2, expected: 0 },
  { n: 0, expected: 0 },
  { n: 1, expected: 1 },
  { n: 10, expected: 55 },
  { n: 100, expected: 5050 },
  { n: 1000000, expected: 500000500000 },
]

testCaseList.forEach(testCase => {
  const functionList = [sum_to_n_a, sum_to_n_b, sum_to_n_c];

  functionList.forEach(func => {
    const result = func(testCase.n);
    if (result === testCase.expected) {
      console.log(`✅ Passed: ${func.name}(${testCase.n}) = ${result} === ${testCase.expected}`);
    } else {
      console.log(`❌ Failed: ${func.name}(${testCase.n}) = ${result} !== ${testCase.expected}`);
    }
  });
});

/*
  I try to use tail recursion to solve the problem, but it seems that the JavaScript engine does not support tail recursion, so I use a while loop instead.
*/