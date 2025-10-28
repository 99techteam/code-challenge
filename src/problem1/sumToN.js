/** 
 * Method 1: Using for a loop
 * Initialize sum = 0
 * Loop from 1 to n, and in the each add the current number to sum
 * Finally, return sum
 * **/
var sum_to_n_a = function (n) {
    let sum = 0
    for (let i = 1; i <= n; i++) {
        sum += i
    }
    return sum;
}

/**
 * Method 2: Using a recursive
 * Add the current number to the result of calling the same function with (n-1)
 * Continue until n equals 1, then return 1
 */
var sum_to_n_b = function (n) {
    if (n === 1)
        return 1;
    return n + sum_to_n_b(n - 1)
}

/**
 * Method 3: Using math formula (Using Gauss method to find the formula)
 * If Sum = 1+2+...+(n-2)+(n-1)+n (1)
 * When write Sum in reverse:
 * Sum = n + (n-1) +(n-2) + ... + 2 + 1 (2)
 * Add (1) and (2)
 * 2*Sum =  (1+n) + (2+(n-1)) + (3+(n-2))+...+(n+1)
 * Each pair equals (n+1), and there are n pairs:
 * 2*Sum = n(n+1)
 * => Sum = n(n+1)/2
 */
var sum_to_n_c = function (n) {
    return (n * (n + 1) / 2)
}
