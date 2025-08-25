
// npx ts-node --compiler-options '{"lib":["esnext","dom"],"module":"commonjs"}' src/problem3/index.ts

const sumToNCaseA = (n: number): number => {
    let sum = 0;

    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
}

const sumToNCaseB = (n: number): number => {
    return (n * (++n)) / 2;
}

const sumToNCaseC = (n: number): number => {
    if (n <= 1) return n;
    return n + sumToNCaseC(--n);
}

console.log(sumToNCaseA(5));
console.log(sumToNCaseB(5));
console.log(sumToNCaseC(5));
