/**
 * Problem 4: Three different ways to calculate sum from 1 to n
 * Bài 4: Ba cách khác nhau để tính tổng từ 1 đến n
 *
 * Mỗi hàm đều tính: 1 + 2 + 3 + ... + n
 * Ví dụ: sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15
 */

/**
 * Cách A: Dùng vòng lặp for
 *
 * Time complexity: O(n) – chạy n vòng lặp
 * Space complexity: O(1) – chỉ dùng một biến đếm
 *
 * Ưu/nhược điểm:
 * - Cân bằng giữa dễ hiểu và hiệu quả
 * - Dùng ít bộ nhớ
 * - Vẫn ổn cho hầu hết trường hợp thực tế, trừ khi n quá lớn
 */
function sum_to_n_a(n: number): number {
  if (n <= 0) return 0;

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Cách B: Dùng đệ quy
 *
 * Time complexity: O(n) – gọi hàm n lần
 * Space complexity: O(n) – do stack của đệ quy
 *
 * Ưu/nhược điểm:
 * - Code gọn, dễ liên hệ toán học
 * - Không phù hợp với n lớn (dễ bị stack overflow)
 * - Ít dùng trong thực tế, chủ yếu để minh họa
 */
function sum_to_n_b(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  return n + sum_to_n_b(n - 1);
}

/**
 * Cách C: Dùng công thức toán học
 *
 * Time complexity: O(1) – chỉ 1 phép tính
 * Space complexity: O(1)
 *
 * Ưu/nhược điểm:
 * - Nhanh nhất, đơn giản nhất
 * - Không phụ thuộc vào độ lớn của n
 * - Là lựa chọn tốt nhất trong thực tế
 */
function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
}

// Xuất hàm để dùng bên ngoài
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

// Kiểm tra thử
console.log("=== Test ba cách tính tổng từ 1 đến n ===");
const testCases = [0, 1, 5, 10, 100];

testCases.forEach((n) => {
  console.log(`\nTest với n = ${n}:`);
  const a = sum_to_n_a(n);
  const b = sum_to_n_b(n);
  const c = sum_to_n_c(n);

  console.log(`sum_to_n_a(${n}) = ${a}`);
  console.log(`sum_to_n_b(${n}) = ${b}`);
  console.log(`sum_to_n_c(${n}) = ${c}`);

  if (a === b && b === c) {
    console.log(`✅ Kết quả trùng nhau: ${a}`);
  } else {
    console.log(`❌ Khác kết quả: a=${a}, b=${b}, c=${c}`);
  }
});

/**
 * Tóm tắt hiệu suất:
 * - sum_to_n_a (for loop): O(n), bộ nhớ O(1), dễ hiểu, hiệu quả vừa phải
 * - sum_to_n_b (recursion): O(n), bộ nhớ O(n), gọn nhưng không thực tế khi n lớn
 * - sum_to_n_c (formula): O(1), bộ nhớ O(1), nhanh nhất, khuyên dùng
 */
