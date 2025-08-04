# Currency Swap Interface

A modern, responsive cryptocurrency swap interface built with **Vite + React 18 + TypeScript + Tailwind CSS**. Features real-time pricing, glassmorphism design, and comprehensive token management.

## ✨ Key Features

### 🎨 **Modern UI/UX**
- **Glassmorphism Design**: Translucent cards with backdrop blur effects
- **Responsive Layout**: Mobile-first design that works on all devices
- **Smooth Animations**: Loading states, transitions, and hover effects
- **Dark Theme**: Modern dark interface with gradient backgrounds

### 💱 **Advanced Swap Features**
- **Real-time Pricing**: Live price feeds from Switcheo API
- **Token Selection**: Searchable dropdown with token icons and balances
- **Smart Validation**: Input validation, balance checking, and error handling
- **Flip Functionality**: Quick swap between From/To tokens with animation
- **Swap Simulation**: Mock backend with realistic loading states
- **Transaction History**: Track completed swaps with timestamps

### 🔧 **Technical Excellence**
- **TypeScript**: Full type safety and better developer experience
- **Component Architecture**: Modular, reusable React components
- **State Management**: Efficient local state with React hooks
- **Error Handling**: Graceful fallbacks for network issues and missing icons
- **Accessibility**: ARIA compliant with keyboard navigation support

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd currency-swap-ui
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
   Visit [http://localhost:5173](http://localhost:5173) to see the application

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | ^5.0.8 | Build tool and dev server |
| **React** | ^18.2.0 | UI library with hooks |
| **TypeScript** | ^5.2.2 | Type safety and developer experience |
| **Tailwind CSS** | ^4.1.11 | Utility-first CSS framework |
| **ESLint** | ^8.55.0 | Code linting and formatting |

## � Project Structure

```
src/
├── components/              # React components
│   ├── SwapForm.tsx        # Main swap interface container
│   ├── TokenAmountInput.tsx # Combined token selector + amount input
│   ├── TokenSelector.tsx   # Token dropdown with search
│   ├── SwapHistory.tsx     # Transaction history display
│   ├── AmountInput.tsx     # Standalone amount input field
│   ├── AppLogo.tsx         # Application logo component
│   └── TokenOption.tsx     # Individual token option component
├── data/                   # Mock data and constants
│   └── mockData.ts         # Mock balances and token utilities
├── hooks/                  # Custom React hooks
│   └── useLocalStorage.ts  # Local storage state management
├── types/                  # TypeScript type definitions
│   └── index.ts           # Shared type definitions
├── utils/                  # Utility functions
│   └── api.ts             # API calls and number formatting
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles and Tailwind imports
```

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

### Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Code Quality**
   - ESLint runs automatically in your editor
   - TypeScript provides real-time type checking
   - Tailwind CSS purges unused styles automatically

3. **Build for Production**
   ```bash
   npm run build
   npm run preview  # Test production build
   ```

## 📱 Supported Tokens

The application dynamically loads available tokens from the Switcheo API. Common tokens include:

| Symbol | Name | Type |
|--------|------|------|
| **ETH** | Ethereum | Native |
| **USDC** | USD Coin | Stablecoin |
| **USDT** | Tether | Stablecoin |
| **BTC** | Bitcoin | Native |
| **SWTH** | Switcheo | Exchange |
| **BNB** | Binance Coin | Exchange |
| **WETH** | Wrapped Ethereum | Wrapped |
| **DAI** | Dai Stablecoin | Stablecoin |
| **LINK** | Chainlink | Oracle |
| **UNI** | Uniswap | DEX |
| **MATIC** | Polygon | Layer 2 |
| **SOL** | Solana | Native |

> **Note**: Token availability depends on the Switcheo API response. The app gracefully handles missing tokens and price data.

## 🎨 Design System

### Color Palette
- **Primary**: Indigo gradients (`from-indigo-500 to-purple-600`)
- **Background**: Dark theme with glassmorphism effects
- **Text**: White/gray hierarchy for readability
- **Success**: Green tones for positive actions
- **Warning**: Amber/red for alerts and errors

### Typography
- **Headings**: Font weights 600-700 for hierarchy
- **Body**: Clean, readable font sizes with proper line heights
- **Code**: Monospace font for transaction hashes and technical data

### Components
- **Cards**: Glassmorphism with `backdrop-blur-md` and translucent backgrounds
- **Buttons**: Gradient backgrounds with hover states and transitions
- **Inputs**: Clean borders with focus states and validation feedback
- **Dropdowns**: Smooth animations with search functionality

## 📊 API Integration

### 🔗 **Price Data API**
```
Endpoint: https://interview.switcheo.com/prices.json
Method: GET
Response: Array of token price objects
```

**Example Response:**
```json
[
  {
    "currency": "ETH",
    "date": "2023-01-01T00:00:00.000Z",
    "price": 1234.56
  }
]
```

### 🖼️ **Token Icons**
```
Base URL: https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/
Pattern: {TOKEN_SYMBOL}.svg
Fallback: First letter of token symbol in gradient circle
```

**Special Mappings:**
- `STEVMOS` → `stEVMOS.svg` (handled automatically)

### 🔄 **Error Handling**
- **Network Issues**: Graceful fallback to cached data
- **Missing Icons**: Automatic fallback to letter-based icons
- **Invalid Responses**: User-friendly error messages
- **Loading States**: Skeleton loaders and spinners

## �️ Security & Validation

### Input Validation
- **Amount Validation**: Numeric input with decimal precision
- **Balance Checking**: Prevents swaps exceeding available balance
- **Token Validation**: Ensures valid token selection
- **XSS Prevention**: Proper input sanitization

### Error Boundaries
- Graceful error handling for component failures
- Network error recovery with retry mechanisms
- User-friendly error messages and recovery suggestions

## 🚧 Recent Improvements

### ✅ **Completed Features**
- [x] **TokenAmountInput Component**: Combined token selector and amount input
- [x] **ARIA Accessibility**: Full screen reader support with proper ARIA attributes
- [x] **Icon Error Handling**: Robust fallback system for missing token icons
- [x] **Transaction History**: Complete swap history with timestamps
- [x] **Mobile Responsiveness**: Optimized for all device sizes
- [x] **TypeScript Strict Mode**: Full type safety across the application

### � **Future Enhancements**
- [ ] **Slippage Tolerance**: User-configurable slippage settings
- [ ] **Price Charts**: Historical price data visualization
- [ ] **Multiple Wallets**: Support for various wallet connections
- [ ] **Advanced Orders**: Limit orders and stop-loss functionality
- [ ] **Multi-chain Support**: Cross-chain token swapping
- [ ] **DeFi Integration**: Liquidity pool information and yields

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain component modularity
- Write descriptive commit messages
- Include proper error handling

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

