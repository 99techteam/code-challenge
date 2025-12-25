# Sum to N - Three Creative Implementations

## 📋 Problem Statement

Calculate the sum of all integers from 1 to n.

**Example:** `sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15`

---

## 🔄 Implementation 1: Array Magic

```javascript
var sum_to_n_a = function (n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  );
};
```

### How It Works

1. **`Array.from({length: n})`** - Creates an array with n empty slots
2. **`(_, i) => i + 1`** - Maps each index to its value (0→1, 1→2, etc.)
3. **`.reduce((acc, val) => acc + val, 0)`** - Sums all elements starting from 0

### Characteristics

- ✅ **Declarative & Functional** - Expresses _what_ to do, not _how_
- ✅ **Readable** - Clear intent with modern JavaScript
- ⚠️ **Performance** - O(n) time, O(n) space (creates array)
- 🎯 **Best for** - Small to medium values, code readability

---

## ⚡ Implementation 2: Gauss's Genius

```javascript
var sum_to_n_b = function (n) {
  return (n * (n + 1)) >> 1;
};
```

### How It Works

Uses the famous **Gauss Summation Formula**: `sum = n × (n + 1) / 2`

**The Insight:** Pair numbers from opposite ends:

```
1 + 2 + 3 + 4 + 5
= (1 + 5) + (2 + 4) + 3
= 6 + 6 + 3 = 15
```

**Bitwise Trick:** `>> 1` shifts bits right by 1 position, equivalent to dividing by 2 (faster!)

### Characteristics

- ✅ **Ultra-Fast** - O(1) constant time
- ✅ **Memory Efficient** - O(1) space
- ✅ **Mathematically Elegant** - Direct formula
- 🎯 **Best for** - Production code, large values, performance-critical applications

---

## 🎯 Implementation 3: Functional Recursion

```javascript
var sum_to_n_c = function (n) {
  return n <= 0 ? 0 : n + sum_to_n_c(n - 1);
};
```

### How It Works

**Recursive Definition:**

- **Base Case:** If n ≤ 0, return 0
- **Recursive Case:** `sum(n) = n + sum(n - 1)`

**Example:** `sum(5) = 5 + sum(4) = 5 + (4 + sum(3)) = 5 + 4 + 3 + 2 + 1 + 0`

### Characteristics

- ✅ **Elegant & Minimal** - One-liner solution
- ✅ **Self-Documenting** - Matches mathematical definition
- ⚠️ **Stack Overhead** - O(n) space for call stack
- ⚠️ **Stack Limit Risk** - May overflow with very large n
- 🎯 **Best for** - Educational purposes, functional programming style

---

## 📊 Performance Comparison

| Implementation        | Time | Space | Speed           | Best Use Case |
| --------------------- | ---- | ----- | --------------- | ------------- |
| **A: Array Magic**    | O(n) | O(n)  | 🐢 Slow         | Readability   |
| **B: Gauss's Genius** | O(1) | O(1)  | 🚀 Blazing Fast | Production    |
| **C: Recursion**      | O(n) | O(n)  | 🐌 Slowest      | Learning      |

---

## 🧪 Testing

All three implementations produce identical results:

```javascript
sum_to_n_a(5); // 15
sum_to_n_b(5); // 15
sum_to_n_c(5); // 15

sum_to_n_a(100); // 5050
sum_to_n_b(100); // 5050
sum_to_n_c(100); // 5050
```

---

## 💡 When to Use Each

- **Use Array Magic** when code clarity and modern JS style are priorities
- **Use Gauss's Genius** in production for optimal performance
- **Use Recursion** for educational purposes or when working in functional paradigm

---
