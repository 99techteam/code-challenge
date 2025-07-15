var sum_to_n_a = function (n) {
  /**
   * using a for loop
   * Time Complexity: O(n) because the loop iterates n times and performs a constant time operation
   * Space Complexity: O(1) because we use the sum variable to store the result
   * */
  var sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  /**
   * Using the arithmetic formula
   * Time Complexity: O(1) because it runs in constant time regardless of the size of n
   * Space Complexity: O(1) because only n is used to perform the calculation, no extra variable
   */
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  /**
   * Create a empty array with n slots the uses the array keys to calculate
   * Remove the first element which has the value 0
   * Time Complexity: O(n) because Array(n + 1) creates an array of n + 1
   * Space Complexity: O(n) because the array occupies space proportional to n + 1
   */
  return [...Array(n + 1).keys()].slice(1).reduce((sum, num) => sum + num, 0);
};
