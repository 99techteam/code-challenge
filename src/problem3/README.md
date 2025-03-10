# WalletPage Component Refactoring

## Problems in the Old Code

1. **Bugs**
   - Used a wrong variable name (`lhsPriority`) that didn’t exist
   - Kept balances with 0 or less when it probably shouldn’t

2. **Slow and Wasteful**
   - Went through the list too many times, making extra work
   - Kept recalculating the same priorities over and over

3. **Confusing Types**
   - Didn’t clearly say what `blockchain` should be
   - Missed adding `blockchain` to the balance info

4. **React Mistakes**
   - Used list position as a key, which can mess up updates
   - Forgot to list `getPriority` as something `useMemo` watches
   - Watched `prices` in `useMemo` when it didn’t need to

5. **Messy Sorting**
   - Sorting didn’t handle equal priorities well
   - Sorting code was longer than it needed to be

## How We Fixed It

### Fixed Bugs
- Used the right variable name for filtering
- Changed it to keep only positive amounts (assuming that’s what we want)
- Added `blockchain` to the balance info

### Made It Faster
- Cut down list processing from three steps to two
- Calculated priorities just once for each balance
- Stopped watching `prices` in `useMemo` since it wasn’t needed there

### Clearer Types
- Made `getPriority` expect a string for `blockchain`
- Added `blockchain` properly to the balance type

### Better React Code
- Used a mix of `blockchain` and `currency` for unique keys
- Made sorting simpler with a quick math trick
- Kept `getPriority` as a clean, reusable function

### What We Assumed
- We want to show only balances above 0
- `useWalletBalances` and `usePrices` don’t change too much
- Higher priority numbers should show up first