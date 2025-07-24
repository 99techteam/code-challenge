# Swap Form Challenge

![Preview 1](/src/problem2/preview/light-mode.png)
![Preview 2](/src/problem2/preview/dark-mode.png)

## 🔗 Demo

👉 [Live Demo on Vercel](https://code-challenge-three-wine.vercel.app/)

## 📋 Functional Requirements

1. **Real-time Pricing**: Prices are fetched from the provided API using an interval to keep the latest data updated.
2. **Random Token Balances**: Random balances are generated for a variety of tokens on initial load.
3. **From Token Filtering**: Inspired by _Problem 3_, only allow selecting "from" tokens that:
   - Are in a predefined priority list
   - Have a non-zero balance
   - Exist in the current price list
4. **To Token Constraints**:
   - Can only select the "to" token after the "from" token is selected
   - The "to" token must be different from the "from" token and must have a valid price
5. **Amount Input Logic**:
   - Input for "from amount" is only enabled after both tokens are selected
   - The "to amount" is automatically calculated based on the current prices and input amount
6. **Balance Validation**: Users cannot input a "from amount" greater than the available balance
7. **Swap Preview**: Preview section shows how the balances of both tokens will change after the swap
8. **Wallet Overview**: Displays current balances of all tokens in the wallet

## 🎨 Non-Functional Requirements

1. **Dark/Light Theme Support**: Supports both dark and light modes using CSS; modern UI using some components from Radix UI
2. **Simple & Maintainable Styling**:
   - Styling is primarily handled with CSS Modules
   - CSS variables are defined for both themes
3. **Accurate Arithmetic**:
   - All calculations with amounts and prices use `BigNumber` to avoid precision loss
   - Displayed values are limited to 10 decimal places for clarity
4. **Responsive UI**: Fully responsive layout optimized for both desktop and mobile devices

## 🧪 Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
