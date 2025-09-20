# Currency Swap Form

A modern, responsive currency swap application built with **React.js** and Vite. This application allows users to swap between different cryptocurrencies with real-time price data and an intuitive user interface.

## Features

### ✨ Core Functionality
- **Real-time Price Data**: Fetches live cryptocurrency prices from the Switcheo API
- **Token Selection**: Interactive modal for selecting from/to tokens with search functionality
- **Automatic Calculations**: Real-time conversion between different cryptocurrencies
- **Swap Direction**: One-click token swapping with animated button
- **Balance Display**: Shows mock user balances for each token

### 🎨 User Experience
- **Modern Dark Theme**: Beautiful gradient background with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: CSS transitions and hover effects throughout
- **Loading States**: Visual feedback during swap operations
- **Toast Notifications**: Success and error messages with auto-dismiss

### 🔧 Technical Features
- **React Components**: Modular, reusable component architecture
- **Custom Hooks**: Clean separation of business logic with useCurrencySwap hook
- **State Management**: React hooks for efficient state management
- **Input Validation**: Comprehensive form validation with error messages
- **Error Handling**: Graceful handling of network errors and edge cases
- **Mock Backend**: Simulated swap operations with loading delays
- **Token Icons**: Integration with Switcheo token icon repository
- **Keyboard Shortcuts**: ESC key to close modals

## Supported Tokens

The application supports the following cryptocurrencies (based on available price data):

- **ETH** - Ethereum
- **USDC** - USD Coin
- **USDT** - Tether USD
- **WBTC** - Wrapped Bitcoin
- **ATOM** - Cosmos
- **OSMO** - Osmosis
- **LUNA** - Terra Luna
- **SWTH** - Switcheo Token
- **BUSD** - Binance USD
- **KUJI** - Kujira
- **ZIL** - Zilliqa
- **OKB** - OKB

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Basic Swap Operation

1. **Select From Token**: Click on the token selector in the "From" section
2. **Select To Token**: Click on the token selector in the "To" section
3. **Enter Amount**: Type the amount you want to swap
4. **Review Exchange Rate**: Check the displayed exchange rate
5. **Confirm Swap**: Click "Confirm Swap" to execute the transaction

### Advanced Features

- **Max Balance**: Click on the balance text to set the maximum available amount
- **Swap Direction**: Use the arrow button to quickly swap the from/to tokens
- **Token Search**: Use the search box in the token selection modal
- **Keyboard Navigation**: Press ESC to close modals

## Technical Architecture

### File Structure
```
src/problem2/
├── index.html          # Main HTML structure
├── main.jsx           # React entry point
├── App.jsx            # Main React application component
├── style.css          # CSS styles and animations
├── components/        # React components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── SwapForm.jsx
│   ├── TokenSelector.jsx
│   ├── AmountInput.jsx
│   ├── SwapButton.jsx
│   ├── ExchangeRate.jsx
│   ├── SubmitButton.jsx
│   ├── TokenModal.jsx
│   └── Toast.jsx
├── hooks/             # Custom React hooks
│   └── useCurrencySwap.js
├── package.json       # Project dependencies and scripts
├── vite.config.js     # Vite configuration
└── README.md         # This documentation
```

### Key Components

#### React Components
- **App.jsx**: Main application component that orchestrates all other components
- **SwapForm.jsx**: Main form component containing token selectors and amount inputs
- **TokenModal.jsx**: Modal for selecting tokens with search functionality
- **Toast.jsx**: Notification component for success/error messages

#### Custom Hooks
- **useCurrencySwap**: Custom hook that manages all business logic including:
  - Price data fetching and processing
  - Token management and selection
  - Form validation and submission
  - State management
  - Error handling and notifications

#### Price Data Integration
- Fetches real-time prices from `https://interview.switcheo.com/prices.json`
- Processes and caches price data for optimal performance
- Handles network errors gracefully

#### Token Icon Integration
- Uses token icons from the Switcheo repository
- Fallback handling for missing icons
- Optimized loading and caching

## Customization

### Styling
The application uses CSS custom properties (variables) for easy theming:

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --background-color: #0f0f23;
  --surface-color: #1a1a2e;
  /* ... more variables */
}
```

### Adding New Tokens
To add support for new tokens:

1. Add the token to the `tokens` array in `script.js`
2. Ensure the token has price data in the API response
3. Add a corresponding icon to the Switcheo repository or provide a fallback

### Mock Data
The application uses mock balance data. In a production environment, this would be replaced with actual wallet integration.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- **React Optimization**: useCallback and useMemo for preventing unnecessary re-renders
- **Component Memoization**: Optimized component rendering
- **Lazy Loading**: Token icons are loaded on demand
- **Efficient State Management**: React hooks for optimal state updates
- **CSS Animations**: Hardware-accelerated animations for smooth UX

## Security Considerations

- **Input Sanitization**: All user inputs are validated and sanitized
- **XSS Prevention**: No innerHTML usage with user data
- **CORS Handling**: Proper handling of cross-origin requests

## Future Enhancements

- **Wallet Integration**: Connect with MetaMask or other Web3 wallets
- **Transaction History**: Track and display swap history
- **Price Charts**: Visual representation of price trends
- **Slippage Protection**: Advanced trading features
- **Multi-language Support**: Internationalization
- **PWA Features**: Offline support and app-like experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the 99Tech Code Challenge and is for demonstration purposes.

---

Built with ❤️ using **React.js**, Vite, and modern web technologies with best practices.
