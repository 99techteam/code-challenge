const firstSolutionSumTS = (n: number): number => {
  let sum: number = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};
console.log(firstSolutionSumTS(5));

const secondSolutionSumTS = (n: number): number => {
  if (n <= 1) return 1;
  return n + secondSolutionSumTS(n - 1);
};
console.log(secondSolutionSumTS(5));

const thirdSolutionSumTS = (n: number): number => {
  return (n * (n + 1)) / 2;
};
console.log(thirdSolutionSumTS(5));
