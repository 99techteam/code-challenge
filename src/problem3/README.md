# Bài Toán 3: Phân Tích & Refactoring Code React Lộn Xộn

## 📋 Tóm Tắt

Đây là bài tập refactoring một component React viết tệ. Công việc yêu cầu:
1. ✅ Xác định tất cả lỗi (inefficiencies và anti-patterns)
2. ✅ Giải thích cách sửa từng lỗi
3. ✅ Cung cấp phiên bản code refactored

## 📁 Các File

| File | Mô Tả |
|------|-------|
| `ANALYSIS.md` | **Phân tích chi tiết 14 lỗi** - giải thích vấn đề và cách sửa |
| `WalletPage.messy.tsx` | Code gốc lộn xộn (đánh dấu lỗi) |
| `WalletPage.refactored.tsx` | Code đã refactor - sạch và tối ưu |
| `README.md` | File này |

## 🔴 Tóm Tắt 14 Lỗi Phát Hiện

### **TypeScript Issues (3 lỗi)**
- ❌ Parameter `blockchain: any` - không type safety
- ❌ `Props extends BoxProps` - BoxProps không được định nghĩa
- ❌ Destructure `children` nhưng không dùng

### **Logic Errors (4 lỗi)**
- ❌ Sử dụng `lhsPriority` - biến không tồn tại → ReferenceError
- ❌ Filter logic inverted - lọc những cái amount <= 0 (sai ý định)
- ❌ Sort callback không return 0 - undefined behavior
- ❌ Biến `balancePriority` tạo nhưng không dùng (dead code)

### **Performance Issues (3 lỗi)**
- ❌ `useMemo` phụ thuộc vào `prices` nhưng không sử dụng
- ❌ `formattedBalances` tạo nhưng không sử dụng
- ❌ `toFixed()` không tham số - format sai (integer thay vì 2 decimal)

### **Code Quality (4 lỗi)**
- ❌ Tên biến `lhs`, `rhs` - khó đọc
- ❌ Sử dụng `index` làm React key - anti-pattern
- ❌ Map từ `sortedBalances` nhưng type là `FormattedWalletBalance` - type mismatch
- ❌ Cấu trúc code có thể rearrange

## ✅ Cải Tiến Chính

### Trước (Code Lộn Xộn)
```typescript
// ❌ any type
const getPriority = (blockchain: any): number => {

// ❌ lhsPriority không tồn tại
if (lhsPriority > -99) {

// ❌ Logic inverted
if (balance.amount <= 0) {
  return true;  // Filter OUT positive balances!
}

// ❌ useMemo dependency sai
}, [balances, prices]);  // prices not used

// ❌ index key
key={index}
```

### Sau (Code Clean)
```typescript
// ✅ Proper type union
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

// ✅ Using correct variable
const priority = getPriority(balance.blockchain);

// ✅ Logic fixed
return hasValidPriority && hasPositiveAmount;

// ✅ Correct dependency
}, [balances]);  // Only balances

// ✅ Stable key
key={balance.currency}
```

## 📊 Chi Tiết So Sánh

### Performance
| Aspect | Before | After |
|--------|--------|-------|
| useMemo unnecessary recalculations | ❌ Yes (prices in deps) | ✅ No |
| Dead code | ❌ formattedBalances unused | ✅ Removed |
| React re-renders | ❌ More (index key) | ✅ Less |

### Type Safety
| Aspect | Before | After |
|--------|--------|-------|
| `blockchain` type | ❌ `any` | ✅ Union type |
| ReferenceError bugs | ❌ Yes (lhsPriority) | ✅ No |
| Type mismatch | ❌ Yes (sortedBalances vs FormattedWalletBalance) | ✅ No |

### Code Quality
| Aspect | Before | After |
|--------|--------|-------|
| Variable names | ❌ `lhs`, `rhs` | ✅ Clear names |
| Logic clarity | ❌ Inverted filter | ✅ Clear intent |
| Dead code | ❌ Yes | ✅ No |
| Comments | ❌ No | ✅ Detailed JSDoc |

## 🎓 Key Learnings

### 1. **Type Safety First**
```typescript
// ❌ Bad
const getPriority = (blockchain: any): number => {

// ✅ Good
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
const getPriority = (blockchain: Blockchain): number => {
```

### 2. **Verify Variables Exist**
```typescript
// ❌ Bad - lhsPriority không tồn tại
if (lhsPriority > -99) {

// ✅ Good
const priority = getPriority(balance.blockchain);
if (priority > -99) {
```

### 3. **useMemo Dependency Optimization**
```typescript
// ❌ Bad - prices not used
}, [balances, prices]);

// ✅ Good - only dependencies used
}, [balances]);
```

### 4. **Filter Logic Clarity**
```typescript
// ❌ Bad - confusing logic
if (lhsPriority > -99) {
  if (balance.amount <= 0) {
    return true;
  }
}
return false;

// ✅ Good - clear intent
return balancePriority > -99 && balance.amount > 0;
```

### 5. **React Key Best Practice**
```typescript
// ❌ Anti-pattern
key={index}

// ✅ Best practice - use unique, stable identifier
key={balance.currency}
```

### 6. **Clean Up Dead Code**
```typescript
// ❌ Bad - unused variable
const formattedBalances = sortedBalances.map(...);

// ✅ Good - use or remove
const formattedBalances = useMemo(() => {
  return sortedBalances.map(...);
}, [sortedBalances, prices]);
```

### 7. **Format Numbers Correctly**
```typescript
// ❌ Bad - loses decimal places
formatted: balance.amount.toFixed()  // → "123"

// ✅ Good - maintain precision
formatted: balance.amount.toFixed(2)  // → "123.45"
```

## 🚀 How to Use These Files

### 1. Study the Analysis
```bash
# Read detailed explanation of each issue
cat ANALYSIS.md
```

### 2. Compare Code Versions
```bash
# View original messy code with inline comments
cat WalletPage.messy.tsx

# View refactored clean code
cat WalletPage.refactored.tsx
```

### 3. Key Differences to Note
- Types and interfaces
- Filter and sort logic
- useMemo dependencies
- Variable naming
- React keys
- Code comments

## 📝 Summary Table

| Category | Issues Found | Status |
|----------|--------------|--------|
| TypeScript Issues | 3 | ✅ Fixed |
| Logic Errors | 4 | ✅ Fixed |
| Performance | 3 | ✅ Optimized |
| Code Quality | 4 | ✅ Improved |
| **Total** | **14** | **✅ All Resolved** |

## 🎯 Main Takeaways

1. ✅ Always use proper TypeScript types (never `any`)
2. ✅ Define all variables before using them
3. ✅ Test filter/sort logic carefully
4. ✅ Keep useMemo dependencies minimal and accurate
5. ✅ Use stable, unique identifiers for React keys
6. ✅ Remove dead code
7. ✅ Use clear, descriptive variable names
8. ✅ Add comments explaining complex logic

---

**Created:** February 14, 2026  
**Component Type:** React Functional Component with TypeScript  
**Frameworks:** React, TypeScript  
**Status:** ✅ Analysis Complete & Code Refactored
