# Currency Swap Form

A modern, interactive currency swap form built with React and Vite.

## Features

- 🎨 Beautiful, modern UI with gradient design
- 💱 Real-time exchange rate calculation
- 🔄 Token swap functionality
- ✅ Input validation and error handling
- 📱 Responsive design
- 🖼️ Token icons from Switcheo token-icons repository
- 💰 Live price data from Switcheo API

## Project Structure

```
problem_2/
├── src/
│   ├── components/
│   │   ├── CurrencySwapForm.jsx
│   │   └── CurrencySwapForm.css
│   ├── lib/
│   │   ├── api.js          # API utilities for fetching prices
│   │   └── validation.js   # Input validation utilities
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── index.html
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## API Integration

- **Token Prices**: Fetched from `https://interview.switcheo.com/prices.json`
- **Token Icons**: Loaded from `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{TOKEN}.svg`

## Usage

1. Select a "From" token from the dropdown
2. Select a "To" token from the dropdown
3. Enter the amount you want to swap
4. The output amount is automatically calculated based on current exchange rates
5. Click the swap button (↕️) to swap the tokens
6. Click "Swap" to execute the transaction

## Technologies Used

- React 18
- Vite
- CSS3 (with modern features like gradients and animations)
