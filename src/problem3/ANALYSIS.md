# Bài Toán 3: Phân Tích và Refactoring Code React Lộn Xộn

## 📋 Tóm Tắt Vấn Đề

Code React dưới đây chứa nhiều lỗi về TypeScript, logic, performance và code quality. Nhiệm vụ là xác định các vấn đề và cung cấp phiên bản refactored.

---

## 🔴 Danh Sách Các Lỗi Tìm Thấy

### **1. TypeScript Issues (Loại 1, 2, 3)**

#### ❌ Lỗi 1.1: Parameter có type `any`
**Code lỗi:**
```typescript
const getPriority = (blockchain: any): number => {
```

**Vấn đề:**
- Sử dụng `any` mất đi lợi ích của TypeScript
- Không có type safety cho input
- Khó maintain khi refactor

**Cách sửa:**
```typescript
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

const getPriority = (blockchain: Blockchain): number => {
```

---

#### ❌ Lỗi 1.2: Thiếu Interface cho `Props`
**Code lỗi:**
```typescript
interface Props extends BoxProps {
  // Trống, không định nghĩa gì
}
```

**Vấn đề:**
- `BoxProps` không được import hoặc định nghĩa
- Không rõ component này cần props gì
- Không thể type-check các props được truyền vào

**Cách sửa:**
```typescript
interface Props extends BoxProps {
  // Thêm các props cần thiết
  // Ví dụ: nếu cần
}
// Hoặc nếu không extend gì:
type Props = React.HTMLAttributes<HTMLDivElement>;
```

---

#### ❌ Lỗi 1.3: Destructuring không đúng
**Code lỗi:**
```typescript
const { children, ...rest } = props;
// Nhưng children không được sử dụng
// rest được sử dụng nhưng không rõ là gì
```

**Cách sửa:**
```typescript
// Nếu không cần children, đừng destructure nó
const WalletPage: React.FC<Props> = (props: Props) => {
  // hoặc
  const WalletPage: React.FC<Props> = ({ ...rest }: Props) => {
```

---

### **2. Logic Errors (Logic Sai)**

#### ❌ Lỗi 2.1: Biến không được định nghĩa - `lhsPriority`
**Code lỗi:**
```typescript
const sortedBalances = useMemo(() => {
  return balances.filter((balance: WalletBalance) => {
    const balancePriority = getPriority(balance.blockchain);
    if (lhsPriority > -99) {  // ❌ lhsPriority không tồn tại!
      if (balance.amount <= 0) {
        return true;
      }
    }
    return false
  })
```

**Vấn đề:**
- `lhsPriority` được sử dụng nhưng không được định nghĩa
- Có lẽ ý định là `balancePriority`
- Code sẽ throw ReferenceError khi chạy

**Cách sửa:**
```typescript
const balancePriority = getPriority(balance.blockchain);
if (balancePriority > -99) {  // ✅ Dùng đúng biến
  if (balance.amount <= 0) {
    return true;
  }
}
```

---

#### ❌ Lỗi 2.2: Logic Filter Sai (Return True khi amount <= 0)
**Code lỗi:**
```typescript
if (balancePriority > -99) {
  if (balance.amount <= 0) {
    return true;  // ❌ Filter LỌC RA những cái amount <= 0
  }
}
return false
```

**Vấn đề:**
- Ý định có lẽ là lọc những balance **có giá trị dương**
- Nhưng logic này lọc RA những cái **âm hoặc bằng 0**
- Ngược với ý định (inverted logic)

**Cách sửa:**
```typescript
// Option 1: Lọc những cái amount > 0
if (balancePriority > -99) {
  return balance.amount > 0;  // ✅ Keep những cái dương
}
return false;

// Option 2: Rõ ràng hơn
const hasValidPriority = balancePriority > -99;
const hasValidAmount = balance.amount > 0;
return hasValidPriority && hasValidAmount;
```

---

#### ❌ Lỗi 2.3: Sort Callback không return 0
**Code lỗi:**
```typescript
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  if (leftPriority > rightPriority) {
    return -1;
  } else if (rightPriority > leftPriority) {
    return 1;
  }
  // ❌ Không return gì khi priority bằng nhau (undefined)
});
```

**Vấn đề:**
- Sort callback phải return `-1`, `0`, hoặc `1`
- Khi bằng nhau, không return sẽ trả về `undefined`
- Behavior không xác định, có thể gây bug

**Cách sửa:**
```typescript
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  
  if (leftPriority > rightPriority) {
    return -1;
  } else if (rightPriority > leftPriority) {
    return 1;
  }
  return 0;  // ✅ Return 0 khi bằng nhau
});

// Hoặc ngắn gọn hơn:
return rightPriority - leftPriority;  // Descending order
```

---

### **3. Performance Issues (Hiệu Năng Kém)**

#### ❌ Lỗi 3.1: `useMemo` phụ thuộc vào `prices` nhưng không sử dụng
**Code lỗi:**
```typescript
const sortedBalances = useMemo(() => {
  return balances.filter(...).sort(...);
}, [balances, prices]);  // ❌ prices trong dependency nhưng không dùng
```

**Vấn đề:**
- `prices` được thêm vào dependency array nhưng không được sử dụng trong logic
- Mỗi khi `prices` thay đổi, `useMemo` tính toán lại dù không cần
- Làm giảm performance

**Cách sửa:**
```typescript
const sortedBalances = useMemo(() => {
  return balances.filter(...).sort(...);
}, [balances]);  // ✅ Chỉ phụ thuộc vào balances
```

---

#### ❌ Lỗi 3.2: `formattedBalances` được tạo nhưng không sử dụng
**Code lỗi:**
```typescript
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})

const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
  // ❌ Map từ sortedBalances, không phải formattedBalances
  // ❌ balance không có property 'formatted'
```

**Vấn đề:**
- `formattedBalances` được tạo nhưng không sử dụng
- `rows` map từ `sortedBalances` (không có property `formatted`)
- Type-checking sẽ fail

**Cách sửa:**
```typescript
// Xóa formattedBalances không cần thiết, hoặc:
const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
  const usdValue = prices[balance.currency] * balance.amount;
  const formatted = balance.amount.toFixed(2);  // ✅ Format inline
  return (
    <WalletRow 
      key={balance.currency}  // ✅ Use unique key
      amount={balance.amount}
      usdValue={usdValue}
      formattedAmount={formatted}
    />
  )
})
```

---

#### ❌ Lỗi 3.3: `toFixed()` không có tham số (sẽ là integer)
**Code lỗi:**
```typescript
formatted: balance.amount.toFixed()  // ❌ No decimal places
```

**Vấn đề:**
- `toFixed()` mà không truyền tham số sẽ làm tròn thành integer
- Ví dụ: `123.456.toFixed()` → `"123"`
- Mất đi thông tin small balances

**Cách sửa:**
```typescript
formatted: balance.amount.toFixed(2)  // ✅ 2 decimal places
```

---

### **4. Code Quality & Anti-patterns (Chất Lượng Code)**

#### ❌ Lỗi 4.1: Sử dụng `index` làm React key
**Code lỗi:**
```typescript
key={index}  // ❌ Anti-pattern
```

**Vấn đề:**
- Nếu list được sắp xếp/lọc lại, index sẽ thay đổi
- React sẽ re-render components không cần thiết
- Có thể gây bug với component state

**Cách sửa:**
```typescript
key={balance.currency}  // ✅ Use unique, stable identifier
```

---

#### ❌ Lỗi 4.2: Tên biến không rõ ràng
**Code lỗi:**
```typescript
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  // lhs = left-hand side (tên viết tắt kỳ lạ)
  // rhs = right-hand side (tên viết tắt kỳ lạ)
```

**Vấn đề:**
- Tên biến kỳ lạ, không rõ ý nghĩa
- Khó đọc code

**Cách sửa:**
```typescript
.sort((leftBalance: WalletBalance, rightBalance: WalletBalance) => {
  // Hoặc:
  .sort((a: WalletBalance, b: WalletBalance) => {
```

---

#### ❌ Lỗi 4.3: Biến `balancePriority` tạo nhưng không dùng
**Code lỗi:**
```typescript
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {  // ❌ Sử dụng biến khác
```

**Vấn đề:**
- Dead code
- Gây confusing

**Cách sửa:**
```typescript
const balancePriority = getPriority(balance.blockchain);
if (balancePriority > -99) {  // ✅ Dùng đúng biến
```

---

#### ❌ Lỗi 4.4: Cấu trúc if-else có thể simplify
**Code lỗi:**
```typescript
if (balancePriority > -99) {
  if (balance.amount <= 0) {
    return true;
  }
}
return false
```

**Cách sửa:**
```typescript
// Rõ ràng hơn:
return balancePriority > -99 && balance.amount > 0;
```

---

## ✅ Refactored Code (Phiên Bản Sửa Lại)

```typescript
// ===== TYPES & INTERFACES =====
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {
  // Define any additional props here if needed
}

// ===== HELPER FUNCTIONS =====

/**
 * Get priority for blockchain
 * Higher priority = displayed first
 */
const getPriority = (blockchain: Blockchain): number => {
  const priorityMap: Record<Blockchain, number> = {
    'Osmosis': 100,
    'Ethereum': 50,
    'Arbitrum': 30,
    'Zilliqa': 20,
    'Neo': 20,
  };
  
  return priorityMap[blockchain] ?? -99;
};

// ===== MAIN COMPONENT =====
const WalletPage: React.FC<Props> = (props: Props) => {
  const { ...rest } = props;
  
  // Hooks
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoized: Filter and sort balances
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((a: WalletBalance, b: WalletBalance) => {
        const aPriority = getPriority(a.blockchain);
        const bPriority = getPriority(b.blockchain);
        return bPriority - aPriority; // Descending
      });
  }, [balances]);

  // Memoized: Format and calculate USD values
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance): FormattedWalletBalance => {
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
      return {
        ...balance,
        formatted: balance.amount.toFixed(2),
        usdValue,
      };
    });
  }, [sortedBalances, prices]);

  // Render rows
  const rows = formattedBalances.map((balance: FormattedWalletBalance) => (
    <WalletRow 
      key={balance.currency}  // ✅ Stable unique key
      className={classes.row}
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;
```

---

## 📊 Bảng So Sánh: Code Cũ vs Code Mới

| Vấn Đề | Code Cũ | Code Mới | Lợi Ích |
|--------|---------|---------|---------|
| Type `blockchain` | `any` | `Blockchain` type union | Type safety, autocomplete |
| Biến không được định | `lhsPriority` | `balancePriority` hoặc `aPriority` | Không runtime error |
| Filter logic | Inverted (sai) | `priority > -99 && amount > 0` | Logic đúng |
| Sort return | `undefined` | `return 0` / `bPriority - aPriority` | Consistent behavior |
| useMemo dependency | `[balances, prices]` | `[balances]` | Tránh re-calculate không cần |
| formattedBalances | Tạo không dùng | Dùng trong map | Không dead code |
| toFixed() | Không tham số | `toFixed(2)` | Format đúng |
| React key | `index` | `balance.currency` | Tránh re-render |
| Tên biến | `lhs, rhs` | `a, b` hoặc `leftBalance, rightBalance` | Dễ đọc hơn |
| Priority map | Switch case | `Record<Blockchain, number>` | Dễ extend |

---

## 🎯 Tóm Tắt Cải Tiến

| Hạng Mục | Số Lỗi | Tình Trạng |
|---------|--------|-----------|
| TypeScript Issues | 3 | ✅ Sửa |
| Logic Errors | 4 | ✅ Sửa |
| Performance | 3 | ✅ Sửa |
| Code Quality | 4 | ✅ Sửa |
| **Total** | **14** | **✅ All Fixed** |

---

## 🔑 Key Takeaways

1. **Luôn định nghĩa type rõ ràng** - Không dùng `any`
2. **Check biến trước khi sử dụng** - Tránh ReferenceError
3. **Logic test trước khi code** - Filter/sort phải đúng ý định
4. **Cleanup unused code** - Dead code làm confusing
5. **Use stable keys trong loops** - Tránh re-render không cần
6. **Optimize dependency arrays** - useMemo/useCallback phải đúng
7. **Improve readability** - Tên biến rõ ràng, code cấu trúc tốt

