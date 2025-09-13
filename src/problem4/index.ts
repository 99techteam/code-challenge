function sum_to_n_for(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

function sum_to_n_while(n: number): number {
  let sum = 0,
    i = 1;
  while (i <= n) {
    sum += i;
    i++;
  }
  return sum;
}

function sum_to_n_avg(n: number): number {
  return n * ((n + 1) / 2);
}

function sum_to_n_reduce(n: number): number {
  const arr: number[] = [];
  for (let i = 1; i <= n; i++) {
    arr.push(i);
  }
  return arr.reduce((acc, curr) => acc + curr, 0);
}

console.log(sum_to_n_for(5));
console.log(sum_to_n_while(5));
console.log(sum_to_n_avg(5));
console.log(sum_to_n_reduce(5));
