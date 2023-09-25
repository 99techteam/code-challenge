/**
 * It's applied the formula of Carl Friedrich Gauss
 * If n is positive: Sum(1...n) = n * (n + 1) / 2
 * If n is negative: SUM(-n...1) = (n * (1 - n) / 2) + 1
 * @param {*} n 
 * @returns 
 */
var sum_to_n_a = function(n) {
    if (n === 0) return 1;
    return (n > 0) ? n * (n + 1) / 2 : (n * (1 - n) / 2) + 1;
};

/**
 * When we do the sum of numbers from 1 to n, the sum of 1 to 9 is repeated when n > 20.
 * So my idea is, we can define the formula like that:
 * 
 * See the README.MD
 * 
 * 
 * @param {*} n > 0
 * @returns 
 */

var sum_to_n_b = function(n) {
        if (n === 0) return 1;
        if (n < 10) return n * (n + 1) / 2;

        const modTen = n % 10;
        const numberWithoutMod = n - modTen;
        const count = numberWithoutMod / 10;

        const sumFrom1To9 = sum_to_n_c(9);
        if (modTen === 9) {
            return 100 * sum_to_n_c(count) + sumFrom1To9*(count + 1);
        } else if (count === 1) {
            return sumFrom1To9 + 10*(modTen + 1) + sum_to_n_c(modTen);
        } else {
            return 100 * sum_to_n_c(count-1) + (10 + sumFrom1To9 + 10*modTen)*count + sum_to_n_c(modTen);
        }
};

/**
 * Same with solution 
 * 
 * @param {*} n > 0 
 * @returns 
 */
var sum_to_n_c = function(n) {
    if (n === 0) return 1;
    if (n < 10) return n * (n + 1) / 2;

    const modTen = n % 10;
    const numberWithoutMod = n - modTen;
    const count = numberWithoutMod / 10;
    let sum = 0;

    for (let i = 0; i <= count; i++) {
        const countTo = (i === count && modTen < 9) ? modTen : 9;
        console.log(countTo);
        sum += 10*i + 10*i*countTo + (countTo * (countTo + 1) / 2);
    }

    return sum;
};

document.querySelector('#result-1').innerHTML = sum_to_n_a(133);
document.querySelector('#result-2').innerHTML = sum_to_n_b(133);
document.querySelector('#result-3').innerHTML = sum_to_n_c(133);

