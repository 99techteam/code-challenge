# Found Inefficiencies and Anti-patterns

### 1. Inside the `filter()` callback and in the outer scope, there's no declaration of `lhsPriority`
Suggested fix: replacing `lshPriority` with `balancePriority` 

### 2. Inverted filter logic in the in `filter()` callback return.

Suggested fix:
replace:
```
if (lhsPriority > -99) {
  if (balance.amount <= 0) {
    return true;
  }
}
```

with
```
return lhsPriority > -99 && balance.amount > 0
```

### 3. Incomplete sort function, missing return for equal priority

- Most recommended solution: sorting the list in the API

- Front-end logic solution:
 
```
return rightPriority - leftPriority
```

### 4. Type `any` inferrence in `getPriority`
- Suggested fix: replace `balance: any` to `string`
- Better approach: refactor the `getPriority()`, use index annotation:
  ```
    interface BlockchainPriority {
      [key: string]: number;
    }
    const getPriority = (blockchain: string): number => {
      // In the future may be stored persistently in the database and Redis cache for better performance and scalability, and responds to front-end whenever requested
      // Trade-off: latency because of API communcation through http
      
      const blockchainPriority: BlockchainPriority = {
        Osmosis: 100,
        Ethereum: 50,
        Arbitrum: 30
        Zilliqa: 20,
        Neo: 20
      }
      
      return blockchainPriority[blockchain as keyof BlockchainPriority] || -99;
    }
  ```

### 5. `prices` is the redundant dependencies of sortedBalances memo

Inside the computed callback, there's no usage of `prices`, which also added to the `useMemo()` dependencies array => This means even if not using `prices`, the dependency change detected by sortedBalances computing function is unecessary and will also cause unecessary recalculated (while the result remains the same)

Fix: remove the `prices` out of the dependencies array

### 6. `formattedBalances` is recalculrated in every re-render.

The recalculation of `formattedBalances` on every re-render is also unecessary because the results remain the same if the `sortedBalances` stay unchanged

Fix: wrap the computation inside `useMemo()` with `sortedBalances` as the only one dependencies.

### 7. Using index as React key

Using index as React key causes issues in list re-rendering. It is a good practices to use another unique identifier instead. (Such as: `id` fields returns from the API with database querying or `useId()` value)

Fix: in this case specifically, we can use currency as the identifier because the currency name is unique

### 8. Missing `blockchain` field in the `WalletBalance` interface

in the `sortedBalances` computed value, there's an access of `balance.blockchain` which is previously infered with type `WalletBalance.

Suggested fix:
```
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Add missing property
}
```

### 9. Unsafe price computation

In the statement `const usdValue = prices[balance.currency] * balance.amount;`, the logic can't guarantee and predict if `balance.currency` exists in prices because the balance.currency is unpredictable. This can leads to make the calculation to `undefined * balance.amount` which results in `NaN`.

There should be a fallback for accessing `prices[balance.currency]`.

Fix: update it to:
``` const usdValue = (prices[balance.currency] || 0) * balance.amount;`

### 10. Code repetation in 2 interfaces `WalletBalance` and `FormattedWalletBalance`

Use TypeScript interface extension (inheritance) for better reusability. Fix:

```
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // fixed for 8.
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}
```

### [Optional for scalability] 11. API should have supported and returned a sorted list of balances by priority