// Iterative
var sum_to_n_a = function (n: number) : number {
  let sum = 0;

  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
};

// Functional (reduce)
var sum_to_n_b = function (n : number) : number {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (a, b) => a + b,
    0
  );
};

// Recursive
var sum_to_n_c = function (n: number) : number {
  if(n === 1) return 1

  return n + sum_to_n_c(n - 1);
};

// Test cases
function runTests() {
  const testCases = [1, 5, 10, 100];

  const functions = [
    { name: "Iterative", fn: sum_to_n_a },
    { name: "Functional", fn: sum_to_n_b },
    { name: "Recursive", fn: sum_to_n_c },
  ];

  functions.forEach(({ name, fn }) => {
    console.log(`\n${name}:`);

    testCases.forEach((n) => {
      console.log(`sum_to_n(${n}) = ${fn(n)}`);
    });
  });
}

runTests();