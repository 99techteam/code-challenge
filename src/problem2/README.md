# Currency Swap Form

A modern, responsive currency swap interface built with React, TypeScript, and Vite. This application provides real-time currency conversion with advanced features for handling large numbers and smooth user interactions.

## Features

### Core Functionality
- **Real-time Currency Conversion**: Live exchange rate calculations with debounced input
- **Token Selection**: Comprehensive dropdown with token icons and search functionality  
- **Currency Switching**: One-click swap between source and target currencies
- **Transaction Confirmation**: Modal confirmation with swap details

### Advanced Features
- **Debounced Input**: 300ms delay for smooth real-time updates without performance issues
- **Compact Number Notation**: Intelligent formatting for large numbers (1.23M, 456.78B, 1.23T, etc.)
- **Loading States**: Visual feedback during calculations and API calls
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization

### Number Formatting
- **12-digit limit**: All displayed numbers limited to 12 digits maximum
- **Smart decimal handling**: Dynamic decimal places based on number size
- **Large number support**: Handles numbers up to sextillions (10^21) with compact notation
- **Scientific notation fallback**: For extremely large numbers beyond compact notation range

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Chakra UI for components and styling
- **Build Tool**: Vite for fast development and building
- **HTTP Client**: Axios for API requests
- **Linting**: ESLint with TypeScript support

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project**
  ```bash
  cd src/problem2
  ```

2. **Install dependencies**
  ```bash
  npm install
  ```

3. **Set up environment variables**
  Create a `.env` file in the root directory:
  ```env
  VITE_API_BASE_URL=https://interview.switcheo.com
  VITE_TOKEN_ICON_BASE_URL=https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens
  ```

4. **Start development server**
  ```bash
  npm run dev
  ```

5. **Open in browser**
  Navigate to `http://localhost:5173`

## Available Scripts

```bash
# Development
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run type-check   # Run TypeScript compiler check
```

## Project Structure

```
src/
├── components/           # React components
│   ├── CurrencySwapForm.tsx    # Main swap form component
│   └── ErrorBoundary.tsx       # Error boundary wrapper
├── hooks/               # Custom React hooks
│   └── useDebounce.ts          # Debouncing hook
├── services/            # API and external services
│   └── tokenService.ts         # Token price fetching
├── types/               # TypeScript type definitions
│   └── index.ts               # Shared interfaces
├── utils/               # Utility functions
│   └── numberFormatter.ts     # Number formatting utilities
├── App.tsx             # Root component
├── main.tsx           # Application entry point
└── index.css         # Global styles
```

## Key Components

### CurrencySwapForm
The main component handling the swap interface with:
- Debounced amount input (300ms delay)
- Token selection with icons
- Real-time conversion calculations
- Compact number formatting
- Loading states and error handling

### useDebounce Hook
Custom hook providing smooth input debouncing:
```typescript
const debouncedAmount = useDebounce(formData.amount, 300);
```

### Number Formatting
Advanced number formatting supporting:
- Compact notation: `1,234,567` → `1.23M`
- Large numbers: `600,000,000,000,000,000,000,000` → `600.00Sx`
- 12-digit maximum display limit
- Scientific notation fallback for extreme values

## API Integration

### Token Prices
- **Endpoint**: `https://interview.switcheo.com/prices.json`
- **Caching**: Results cached for performance
- **Error Handling**: Graceful fallback for failed requests

### Token Icons
- **Base URL**: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens`
- **Format**: SVG icons with fallback placeholder
- **Dynamic Loading**: Icons loaded on-demand

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for token price API | `https://interview.switcheo.com` |
| `VITE_TOKEN_ICON_BASE_URL` | Base URL for token icons | `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens` |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations

- **Debounced Input**: Prevents excessive API calls during typing
- **Memoized Calculations**: Exchange rates cached using useMemo
- **Lazy Loading**: Token icons loaded on demand
- **Bundle Splitting**: Automatic code splitting with Vite

## Contributing

1. Follow the existing code style and TypeScript patterns
2. Add appropriate error handling for new features
3. Include responsive design considerations
4. Test with large numbers to ensure compact notation works
5. Update documentation for any new environment variables

## License

This project is part of a coding challenge and is for educational purposes.
