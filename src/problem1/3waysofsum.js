/**
 * Method A: Iterative approach using a for loop.
 * The complexity is O(n): need to interate through a loop from 1 to n
 * @param {number} n The integer to sum up to.
 * @returns {number} The sum of integers from 1 to n.
 */
var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Method B: Formulaic approach (arithmetic series formula).
 * The complexity is O(1): It performs a fixed number of simple operations: one addition (n+1), one multiplication (n * (n + 1)), one division ( / 2)
 * @param {number} n The integer to sum up to.
 * @returns {number} The sum of integers from 1 to n.
 */
var sum_to_n_b = function (n) {
  if (n < 0) return 0;
  return (n * (n + 1)) / 2;
};

/**
 * Method C: Functional approach using Array.prototype.reduce().
 * The complexity is O(n): 
 * - Array.from() create a new array with a length of n. It has to perform an operation for each element, from 1 to n
 * - .reduce() iterates over this new array, performing an addition for each of the n elements.
 * @param {number} n The integer to sum up to.
 * @returns {number} The sum of integers from 1 to n.
 */
var sum_to_n_c = function (n) {
  if (n < 0) return 0;
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (sum, current) => sum + current,
    0
  );
};

/**
 * Retrieves the input, calculates the sum using all three methods,
 * and displays the results in the respective result blocks.
 */
const numberInput = document.getElementById("number-input");
const calculateBtn = document.getElementById("calculate-btn");
const resultA = document.getElementById("result-a");
const resultB = document.getElementById("result-b");
const resultC = document.getElementById("result-c");

function calculateAndDisplay() {
  const n = parseInt(numberInput.value, 10);

  if (isNaN(n) || n < 0) {
    resultA.textContent =
      resultB.textContent =
      resultC.textContent =
        "Invalid Input";
    return;
  }

  resultA.textContent = sum_to_n_a(n);
  resultB.textContent = sum_to_n_b(n);
  resultC.textContent = sum_to_n_c(n);
}

calculateBtn.addEventListener("click", calculateAndDisplay);

window.onload = function () {
  calculateAndDisplay();
};
