import * as readline from "readline";
import {
  sumToN_A_formula,
  sumToN_A_loop,
  sumToN_A_recursive,
} from "./assume/first_assume";
import {
  sumToN_B_formula,
  sumToN_B_loop,
  sumToN_B_recursive,
} from "./assume/second_assume";

function run(n: number) {
  console.log(`\nInput n = ${n}`);
  console.log("\nFirst ASSUME (support negative)");
  console.log("loop:     ", sumToN_A_loop(n));
  console.log("formula:  ", sumToN_A_formula(n));
  console.log("recursive:", sumToN_A_recursive(n));
  console.log("\nSecond ASSUME (no negative)");
  try {
    console.log("loop:     ", sumToN_B_loop(n));
    console.log("formula:  ", sumToN_B_formula(n));
    console.log("recursive:", sumToN_B_recursive(n));
  } catch (err) {
    console.log("Error:", (err as Error).message);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question("\nEnter n (or 'q' to quit): ", (answer) => {
    if (answer.trim().toLowerCase() === "q") {
      console.log("Bye!");
      rl.close();
      return;
    }

    const n = Number(answer.trim());

    if (Number.isNaN(n)) {
      console.error("Invalid input. Please enter a valid integer.");
    } else {
      run(n);
    }

    prompt();
  });
}

console.log("=== sum_to_n Demo ===");
prompt();
