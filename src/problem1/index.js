// Method A: Using a loop
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
 };
 
 
 // Method B: Using the arithmetic formula
 var sum_to_n_b = function(n) {
    return n * (n + 1) / 2;
 };
 
 
 // Method C: Using recursion
 var sum_to_n_c = function(n) {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
 };
 
 
 // Example usage
 console.log("sum_to_n_a(5):", sum_to_n_a(5)); // 15
 console.log("sum_to_n_b(5):", sum_to_n_b(5)); // 15
 console.log("sum_to_n_c(5):", sum_to_n_c(5)); // 15