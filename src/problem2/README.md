# Currency Swap Exchange

A modern, real-time currency exchange application built with React, TypeScript, and Tailwind CSS. Swap between global currencies with up-to-date exchange rates.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38B2AC?logo=tailwind-css)

## Features

- **Real-time Currency Conversion** - Instant conversion between multiple cryptocurrencies
- **Modern UI/UX** - Beautiful glassmorphism design with smooth animations
- **Live Exchange Rates** - Fetches real-time prices from Switcheo API
- **Smart Validation** - Prevents same-token swaps and enforces maximum limits
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Maximum Amount Control** - Set maximum exchange limit (100,000)
- **Toast Notifications** - User-friendly feedback for all actions
- **Icon Fallback System** - Graceful handling of missing token icons
- **Duplicate Token Filtering** - Removes duplicate tokens from the list
- **Fast & Lightweight** - Built with Vite for optimal performance

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd problem2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   ```
   Navigate to http://localhost:5173
   ```

5. **Live Demo**

   ```
   Navigate to https://code-challenge-from-99tech.vercel.app/
   ```

## Available Scripts

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## Tech Stack

### Core

- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Build tool and dev server

### UI & Styling

- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
  - Select
  - Label
  - Separator
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### API & Data

- **Axios 1.13.4** - HTTP client
- **Switcheo API** - Real-time token prices

## Project Structure

```
currency-swap/
├── src/
│   ├── api/
│   │   └── token.ts              # API calls and data fetching
│   ├── components/
│   │   ├── CurrencySwap.tsx      # Main swap component
│   │   ├── SwapInput.tsx         # Reusable input component
│   │   └── ui/                   # UI components (Radix)
│   ├── types/
│   │   └── currency.d.ts         # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts              # Utility functions
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
├── public/                        # Static assets
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                # Vite config
├── tailwind.config.js            # Tailwind config
└── README.md                      # You are here!
```

## Key Features Explained

### 1. Real-time Currency Conversion

The app fetches live token prices from the Switcheo API and calculates conversion rates in real-time as you type.

### 2. Maximum Amount Limit

Users can exchange up to **100,000 units** per transaction. The app provides:

- Quick "Max" button to set maximum amount
- Visual warning when exceeding limit
- Disabled swap button for invalid amounts

### 3. Icon Fallback System

If a token icon fails to load or is unavailable, the app displays a fallback avatar with:

- Token's first letter
- Gradient background
- Consistent styling

### 4. Duplicate Token Removal

The app automatically filters out duplicate tokens (e.g., multiple USDC entries) keeping only the first occurrence.

### 5. Swap Token Feature

Users can quickly reverse the exchange direction with a single click on the swap button.

## UI Components

### CurrencySwap

Main component that manages:

- Token state
- Amount state
- Exchange rate calculations
- Swap functionality
- Validation logic

### SwapInput

Reusable input component with:

- Token selection dropdown
- Amount input field
- Icon display with fallback
- Max button integration

## Usage Example

1. **Select Source Token** - Choose the currency you want to send
2. **Enter Amount** - Type the amount or click "Max" for maximum
3. **Select Target Token** - Choose the currency you want to receive
4. **View Exchange Rate** - See the real-time conversion rate
5. **Click "Swap Now"** - Execute the exchange (simulated)

## Future Enhancements

- [ ] Transaction history
- [ ] Multiple currency pairs
- [ ] Price charts
- [ ] Wallet integration
- [ ] Dark/Light theme toggle
- [ ] More token networks
- [ ] Advanced filtering
- [ ] Favorite tokens
