var sum_to_n_a = function(n) {
    if (!Number.isInteger(n)) return null;
    if (n <= 0) return 0;
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function(n) {
    if (!Number.isInteger(n)) return null;
    if (n <= 0) return 0;
    
    return Object.keys(Array(n + 1).fill(null))
        .slice(1)
        .map(Number)
        .reduce((sum, num) => sum + num, 0);
};

var sum_to_n_c = function(n) {
    if (!Number.isInteger(n)) return null;
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    return n + sum_to_n_c(n - 1);
};

function main() {
    const dataTest = [
        0,
        1,
        10,
        -10,
        '10',
        'a',
        null,
        undefined,
        NaN,
        true, 
        false
    ];

    for (const data of dataTest) {
        console.log('--------------------------------');
        console.log('Input: ', data);
        console.log('Output sum_to_n_a: ', sum_to_n_a(data));
        console.log('Output sum_to_n_b: ', sum_to_n_b(data));
        console.log('Output sum_to_n_c: ', sum_to_n_c(data));
        console.log('--------------------------------');
    }
}

main();