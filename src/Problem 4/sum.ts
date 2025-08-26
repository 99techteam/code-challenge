function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
// Complexity: O(n) - Sử dụng vòng lặp để cộng từng số, hiệu quả với n nhỏ.
//  Phương pháp dễ hiểu nhưng phụ thuộc vào n, hiệu suất bình thường

function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}
// Complexity: O(1) - Sử dụng công thức toán học, rất hiệu quả cho mọi n.
// Cách rất hiệu quả vì dùng công thức tính tổng, tránh được lặp

function sum_to_n_c(n: number): number {
  return [...new Array(n)].map((_, i) => i + 1).reduce((a, b) => a + b, 0);
}

// Complexity: O(n) - Tạo mảng và dùng reduce, rõ ràng nhưng không tối ưu bằng công thức.
// Cách này dùng mảng và reduce, dễ hiểu nhưng không hiệu quả bằng công thức
console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));
