const n = 10;

function formulaSumToN(n) {
  return (n * (n + 1)) / 2;
}

function recursiveSumToN(n) {
  if (n <= 1) return n;
  return n + recursiveSumToN(n - 1);
}

function loopSumToN(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

console.log(formulaSumToN(n)); //55
console.log(recursiveSumToN(n)); //55
console.log(loopSumToN(n)); //55
