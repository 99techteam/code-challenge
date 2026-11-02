# Problem 2: Fancy Form

Vite, React 18 and TypeScript. No UI libraries.

```
cd src/problem2
npm install
npm run dev
npm test
```

`npm run dev` starts the app. `npm test` runs the unit tests for price selection and number formatting.

Behavior

- Prices come from `https://interview.switcheo.com/prices.json`. The newest quote per currency wins and tokens without a price are dropped.
- Either amount can be edited, the other side is derived from the price ratio.
- Selecting the token already used on the other side swaps the two.
- Inputs accept digits and one decimal separator only, with a clear message for tiny or oversized results.
- Submit simulates a backend call with a 1.6 second delay, then shows a receipt.
- Icons load lazily from the Switcheo repo and fall back to a badge when missing.
