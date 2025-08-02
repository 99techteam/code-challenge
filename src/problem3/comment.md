## 1. Overview
Please take a look my response in this question

## 2. Issues 
```
01.
interface WalletBalance { 
    currency: string; 
    amount: number; 
    // blockchain property not declared
}

02.
In the inner **sortedBalances** function, the **lhsPriority** variable is not defined; however, it is used as a condition state (line 39).

03. **formattedBalances** is a redundant function (defined but not used).

04.
The logic and condition of **balances.filter** are incorrect.

05. 
The rows data should use **formattedBalances** to map rather than **sortedBalances**.
```

## 3. Solution
```
01. Add the blockchain property to the WalletBalance interface.
02. Shorten the PROPS declarations.
03. Pause rendering before fetching data using the **isLoading** variable.
04. Instead of using the **getPriority** function, convert it to a PRIORITY_MAP:
    - Performance Optimization: faster lookup of the result.
    - Reduced Code Complexity compared to switch-case.
    - Scalability: easier to add/modify the Map.
    - Optimizing Code Execution Time
05. Convert **formattedBalances** data to have the **FormattedWalletBalance** interface before implementing and rendering the **rows** data.
