const firstSolutionSum = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};
console.log(firstSolutionSum(5));

const secondSolutionSum = function (n) {
  if (n <= 1) return 1;
  return n + secondSolutionSum(n - 1);
};
console.log(secondSolutionSum(5));

const thirdSolutionSum = function (n) {
  return (n * (n + 1)) / 2;
};
console.log(thirdSolutionSum(5));
