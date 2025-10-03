# Problem 2 Solution and Guideline

## Issuses & Anti-Patterns

### 1. Incorrect / Missing Type Annotations

-   **WalletBalance** does not declare **blockchain**, but **getPriority** expects **balance.blockchain**.

-   **getPriority** accepts **blockchain: any**, which defeats the purpose of Typescript
-   **row** map overs **sortBalances** but assumes they are **FormattedWalletBalance** (wrong type)

### 2. Inefficient **useMemo**

```ts
const sortedBalances = useMemo(() => { ... }, [balances, prices]);
```

-   **prices** is not used inside the computation
-   **getPriority** is defined inside the component → a new function instance is created on every render.

### 3. Broken Filter Logic

```ts
if (lhsPriority > -99) {
    if (balance.amount <= 0) {
        return true;
    }
}
return false;
```

-   Variable **lhsPriority** is not defined
-   User don't want to see negative balances

### 4. Inefficient **.map** Usage

```ts
const formattedBalances = sortedBalances.map(...);
const rows = sortedBalances.map(...);
```

-   **formattedBalances** is never used
-   **rows** does not use **formattedBalances**, so **balance.formatted** is missing

### 5. Using **index** as React Key

```ts
key = { index };
```

-   If the order of sortedBalances changes (due to filtering/sorting), React will reuse the wrong DOM nodes → UI bugs.
-   Should use a stable unique key.

### 6. Unnecessary Child Extraction

```ts
const { children, ...rest } = props;
```

-   **children** is extracted but never used

## Solution

### 1. Add blockchain type

```ts
type Blockchain =
    | 'Osmosis'
    | 'Ethereum'
    | 'Arbitrum'
    | 'Zilliqa'
    | 'Neo'
    | string;

interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: Blockchain;
}
```

### 2. Reformat **FormattedWalletBalance** interface

```ts
interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}
```

### 3. Refactor **PRIORITY_MAP** and move **getPriority** & **priority map** outside component

```ts
const PRIORITY_MAP: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
};

const getPriority = (blockchain: Blockchain): number =>
    PRIORITY_MAP[blockchain] ?? -99;
```

### 4. Combined formatting + sorting in a single useMemo

```ts
function useSortedWalletBalances(balances: WalletBalance[]) {
    return useMemo<FormattedWalletBalance[]>(() => {
        return balances
            .filter((b) => b.amount > 0)
            .map((b) => ({
                ...b,
                formatted: b.amount.toFixed(),
            }))
            .sort(
                (a, b) => getPriority(b.blockchain) - getPriority(a.blockchain)
            );
    }, [balances]);
}
```

### 5. Change React key

-   Use "balance.currency + balance.blockchain" to stable unique key.

```ts
 key={`${balance.currency}-${balance.blockchain}`}
```

### 6. Filters for amount > 0

### 7. Create Custom Hooks to seperate the main component

-   **useSortedBalances** hook responsibly processed (sort, format) data

```tsx
function useSortedBalances(
    balances: WalletBalance[],
    prices: Record<string, number>
) {
    return useMemo<FormattedWalletBalance[]>(() => {
        return balances
            .filter((b) => b.amount > 0)
            .map((b) => ({
                ...b,
                formatted: b.amount.toFixed(),
                usdValue: (prices[b.currency] ?? 0) * b.amount,
            }))
            .sort(
                (a, b) => getPriority(b.blockchain) - getPriority(a.blockchain)
            );
    }, [balances, prices]);
}
```

-   **getPriority** calculates the priority of balance

```ts
const PRIORITY_MAP: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
};

const getPriority = (blockchain: Blockchain): number =>
    PRIORITY_MAP[blockchain] ?? -99;
```

-   Finally, the main component is very clean and easy to maintain

```tsx
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
    const { ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
    const sortedBalances = useSortedWalletBalances(balances);

    return (
        <div {...rest}>
            {sortedBalances.map((balance) => {
                const usdPrice = prices[balance.currency] ?? 0;
                const usdValue = usdPrice * balance.amount;

                return (
                    <WalletRow
                        className={classes.row}
                        key={`${balance.currency}-${balance.blockchain}`} // use stable key
                        amount={balance.amount}
                        usdValue={usdValue}
                        formattedAmount={balance.formatted}
                    />
                );
            })}
        </div>
    );
};
```

## Project Structure after refactoring code

```bash

src/
├── features/
│   └── wallet/
│       ├── components/
│       │   ├── WalletRow.tsx
│       │
│       │
│       ├── hooks/
│       │   ├── useSortBalances.ts
│       │   ├── useWalletBalances.ts
│       │   ├── usePrices.ts
│       │
│       ├── types.ts                 # Centralized TypeScript interfaces & types (Token, Balance, etc.)
│       ├── utils.ts                 # Helper functions
│       │   │── getPriority.ts
│       ├── WalletPage.tsx
│
├── assets/                          # Static files, token icons, images
│
├── App.tsx
├── main.tsx
└── index.css
```

## 🚀 Getting Started

1️⃣ Install Dependencies
pnpm install

```bash

pnpm install
# or
yarn install
# or
npm install
```

2️⃣ Start Development Server

```bash

pnpm dev
# or
yarn dev
# or
npm run dev
```

Vite will start a local server (usually at http://localhost:5173).
