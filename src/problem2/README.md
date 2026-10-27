# Problem 2 — Fancy Form

React, TypeScript and Vite currency swap preview. The price endpoint supplies a dated reference snapshot; the interface labels the quote as a simulation and does not claim to execute trades.

```sh
npm install
npm run dev
npm test
npm run build
```

Open the URL Vite prints (typically http://localhost:5173). The app includes a snapshot of the provided https://interview.switcheo.com/prices.json feed in `public/prices.json` (36 records, dated August 2023). The endpoint did not advertise browser CORS access during development, so a static frontend cannot fetch it directly without a proxy. Optional token icons need network access; missing icons fall back to initials. A local fetch failure offers a retry button. Duplicate currency prices are resolved by newest date (last row wins ties); invalid or unpriced entries are omitted. Conversion uses amount × source USD price ÷ destination USD price; display rounding never changes the underlying quote.

No backend, wallet, fees or asset transfer is implied by this frontend task. Submit displays a short mocked processing state and an explicit simulated result.
