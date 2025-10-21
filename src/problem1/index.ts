var sum_to_n_a = function (n: number): number {
    return Array.from({ length: n + 1 }).reduce((total: number, _, i: number) => {
        return total + i
    }, 0)
};

var sum_to_n_b = function (n: number): number {
    if (n === 1) return 1
    return n + sum_to_n_b(n - 1)
};

var sum_to_n_c = function (n: number): number {
    return (n * (n + 1)) / 2
};