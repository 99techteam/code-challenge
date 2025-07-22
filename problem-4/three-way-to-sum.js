const sum_to_n_with_loop = (n) => {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
};

const sum_to_n_with_math = (n) => {
    return (n * (n + 1)) / 2;
};

const sum_to_n_with_recursion = (n) => {
    if (n <= 1) {
        return n;
    }

    return n + sum_to_n_with_recursion(n - 1);
};

module.exports = {
    sum_to_n_with_loop,
    sum_to_n_with_math,
    sum_to_n_with_recursion
};

