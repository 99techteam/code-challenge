# 🔁 Swap Currency App

A simple currency swap form built with **React**, **TypeScript**, and **Vite**, designed to fetch live token data and provide real-time conversion from one currency to another.

# Stack
- ⚡️ [Vite](https://vitejs.dev/) for fast development build
- ⚛️ [React](https://reactjs.org/)
- 🟦 [TypeScript](https://www.typescriptlang.org/)
- 🟢 Node.js version ">=18"

# Run dev: yarn install -> yarn dev
# Link demo: https://pham-thi-bich-fe-code-challenge-48z.vercel.app/

# ✨ Features
- Live Token Fetching:
  Tokens and their prices are loaded from API.
  If the API fails, the form is not rendered to prevent inaccurate or outdated information.
  No default data is used due to the constantly changing nature of token prices.

- Real-Time Swap Calculation:
  When the user inputs a number into the From field, the equivalent To amount is automatically calculated using live exchange rates.
  Support switching from/to currencies

- User-Friendly Validation:
  The form only accepts numeric input.
  Validation is handled gracefully:
  Non-numeric characters are automatically ignored or blocked.
  No disruptive or technical error messages are shown to the user.

- Clean UX:
Avoids exposing raw error messages (e.g., no "network error" or "undefined" in UI).
Form is only visible when data is fully and correctly loaded.

❓ Developer Question
The token API occasionally returns multiple records with the same currency Id. Should the app:
Filter duplicates, keeping only one entry per currency?
If yes, should we keep the most recently updated one?