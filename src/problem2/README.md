# Problem 2 - Fancy Form assignment #

## Project Overview
Create a **currency swap form** based on the template provided in the project folder.  
This form allows users to swap assets from one currency to another.

## Implementation Idea

The application is designed as a **simple wallet management app** for a single user.

### Initial State
- The user starts with **1,000,000 USD** in their USD wallet.
- Each currency is represented as a separate wallet.

### Pricing & Token Data
- Token prices are fetched from the following API:  
  https://interview.switcheo.com/prices.json
- Conversion rates are applied **in real time**:
  - When the user selects/search the target currency
  - When the user enters the amount to swap
  - Conversion also works in reverse (changing the target amount recalculates the source amount)

### Validation Rules
The form validates the following cases:
- Empty input fields
- Negative or zero amounts
- Insufficient balance in the source wallet

### API Simulation
- A small artificial delay is added to simulate a real API call during the swap process


## folder structures
```
problem2/
├── public/                 # Static assets
└── src/
    ├── main.tsx           # Contain provider and render app
    ├── App.tsx            # Simple App component
    ├── theme.ts           # Configure Material-UI theme
    ├── api/               # API layer contain data fetching logic hooks and services
    ├── atom/              # Reusable UI components (Atomic Design)
    ├── components/        # Feature components containing business UI and logic
    ├── contexts/          # React contexts for modal and notification
    ├── types/             # TypeScript types & schemas
    └── common/            # Utilities & constants
```

## Tech Stack

### Core Framework
- **React 19.2.0** with **TypeScript ~5.9.3**
  - Uses React built-in hooks and Context API for state management
  - Type-safe development with strict TypeScript configuration

### Build Tool & Development
- **Vite (Rolldown-Vite 7.2.5)** - Next-gen build tool with HMR
  - Path alias mapping (`@components`, `@api`, `@types`, etc.)

### UI Framework
- **Material-UI v7.3.7** (@mui/material)
  - Component library with Material Design
  - Responsive Grid system

### State Management & Data Fetching
- **TanStack React Query v5.90.18**
  - Server state management
  - Automatic caching, refetching and background updates

### Form Handling & Validation
- **Zod v4.3.5** - TypeScript-first schema validation
  - Runtime type checking

### HTTP Client
- **Axios v1.13.2**
  - Promise-based HTTP client
  - Request/response interceptors

---

## Architecture & Best Practices

### 1. **Layered Architecture**
```
Presentation Layer (Components)
      ↓
Business Logic Layer (Hooks)
      ↓
Data Access Layer (Services)
      ↓
API Client Layer (Axios)
```

#### **Separation of Concerns**
- **Components**: Handle UI rendering and user interaction only
- **Custom Hooks**: Business logic, state management, side effects
- **Services**: API calls, data transformation
- **Contexts**: Cross-cutting concerns (modals, notifications)

### 2. **Atomic Design Pattern**
```
src/atom/          # Atomic components (Button, Input, Autocomplete)
src/components/    # Feature components (WalletCard, ExchangeForm)
```

- Reusable UI components in `/atom`
- Composition-based component design
- Props typing with generics for reusability

**Example**: `CommonAutocomplete<T>` - Generic component that works with any data type

### 3. **Custom Hooks Pattern**

#### **Data Fetching Hooks** (`useWallets`, `useAllPrices`)
```typescript
// Query keys pattern for cache management
export const walletQueryKeys = {
  all: ["wallets"] as const,
};

// Shared query config
export const queryConfig = {
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 30 * 60 * 1000,    // 30 minutes
  retry: 2,
};
```

#### **Business Logic Hooks** (`useExchangeForm`)
- Form state management
- Field-level validation
- Real-time conversion calculation
- Bidirectional data sync (from ↔ to amounts)

### 4. **Performance Optimizations**

#### **Memoization**
```typescript
// useMemo for expensive calculations
const pricesMap = useMemo(() => getLatestPricesMap(prices), [prices]);

// useCallback for event handlers
const handleAmountChange = useCallback((field, value) => {
  // ...
}, [dependencies]);
```

#### **React Query Caching**
- 5 minutes stale time → Reduce unnecessary refetches
- 30 minutes garbage collection → Balance memory usage
- Background refetching on window focus

#### **Component Optimization**
- Skeleton loading states
- Conditional rendering with early returns
- Grid virtualization with MUI Grid v2

## Key Takeaways

✅ **Type Safety First**: TypeScript strict mode + Zod validation  
✅ **Separation of Concerns**: Layered architecture with clear boundaries  
✅ **Performance**: React Query caching + memoization  
✅ **Developer Experience**: Path aliases + hot reload + ESLint  
✅ **User Experience**: Loading states + error handling + real-time validation  
✅ **Code Quality**: Consistent patterns + reusable components + documentation  
✅ **Scalability**: Modular structure + easy to extend

