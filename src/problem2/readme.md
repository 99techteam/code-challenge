# Problem 2 – Fancy Form

## Overview
The swap experience in `src/problem2/` is a stand‑alone vanilla HTML/CSS/JS build that fetches live token prices from `https://interview.switcheo.com/prices.json` and renders a glassmorphism-inspired swap card. Users can pick any priced token pair, enter amounts in either direction, see live USD equivalents, flip the direction, and submit a simulated swap with validation plus a loading indicator and toast confirmation.

Key capabilities:
- Token selector modal with search, avatars sourced from `https://github.com/Switcheo/token-icons`, and mock balances for MAX/validation flows.
- Real-time quote calculation (`1 FROM ≈ X TO`) plus auto-synced receive amounts when typing either side.
- Inline form guardrails (same-token prevention, balance checks, numeric parsing) and accessible error messaging.
- Refresh control for prices, animated flip button, and responsive layout tuned for 360px+ widths.

## Running the solution
No build step is required—open `src/problem2/index.html` directly in a browser. For a smoother DX you can also serve the folder (e.g., `npx serve src/problem2`) or drop it into a lightweight Vite vanilla template; the scripts/styles work as-is.

## Implementation notes
- Styles live in `style.css` and define the grid background, swap card, modal, and toast system.
- `script.js` centralizes state management: fetching/normalizing prices, handling token selection, amount syncing, mock balances, form validation, and the simulated submit delay.
- The code stays framework-free per instructions but is structured so it can be migrated into a Vite project if desired for the “bonus” requirement.