var sum_to_n_a = function (n) {
    // your code here
    if (n === 0) return 0
    if (n > 0) {
        return sum_to_n_a(n - 1) + n
    }
    return sum_to_n_a(n + 1) + n
};

var sum_to_n_b = function (n) {
    // your code here
    return n * (Math.abs(n) + 1) / 2
};

var sum_to_n_c = function (n) {
    // your code here
    let sum = 0
    let abs_n = Math.abs(n)
    for (let i = 1; i <= abs_n; ++i) {
        sum += i
    }
    return n > 0 ? sum : -1 * sum
};

// They provided input could be any integers, so they are either negative or positive values

const fn_list = [sum_to_n_a, sum_to_n_b, sum_to_n_c]
const input_values = [-1000, -5, 10, 1000]
const main = () => {
    for (let val of input_values) {
        console.log(`Input value: ${val}`);
        for (const fn of fn_list) {
            if (typeof fn === 'function') {
                console.log(`${fn.name}: ${fn(val)}`);
            }
        }
    }
}

main()

