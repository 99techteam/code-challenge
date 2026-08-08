# Currency Swap Application

A modern, production-ready currency swap application built with React, TypeScript, and Vite.

## 🚀 Features

### Core Functionality

- ✅ Real-time currency conversion
- ✅ Bidirectional amount input (from/to)
- ✅ Currency swap functionality
- ✅ Live exchange rates from API
- ✅ Token icons from Switcheo repository

### Production Optimizations

- ✅ **Performance**
  - Icon caching mechanism
  - Memoized calculations and component renders
  - Debounced input handling
  - Optimized re-renders with React.memo
- ✅ **Error Handling**
  - Error Boundary for crash protection
  - API retry logic with exponential backoff
  - Toast notifications for user feedback
  - Loading states and spinners
- ✅ **Validation**
  - Input validation with min/max limits
  - Decimal precision control
  - Same currency selection prevention
  - Invalid amount handling
- ✅ **Accessibility (A11y)**
  - ARIA labels and roles
  - Keyboard navigation support (Arrow keys, Enter, Escape)
  - Screen reader friendly
  - Focus management
- ✅ **User Experience**
  - Visual feedback for all actions
  - Loading indicators
  - Smooth animations
  - Responsive design
  - Clear error messages

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + TypeScript ESLint

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## 🏃 Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://interview.switcheo.com
VITE_TOKEN_ICONS_BASE_URL=https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens
```

## 📁 Project Structure

```
src/
├── components/
│   ├── CurrencySwap/       # Main swap component
│   ├── SearchableSelect/   # Custom select with search
│   ├── ErrorBoundary/      # Error boundary wrapper
│   └── Toast/              # Toast notification
├── store/
│   └── Currencies/         # Zustand store for currency data
├── utils/
│   ├── constants.ts        # App constants
│   ├── iconCache.ts        # Icon caching utility
│   └── validation.ts       # Input validation utilities
├── App.tsx                 # Root component
└── main.tsx               # Entry point
```

## 🎯 Key Improvements for Production

### 1. Performance Optimizations

- **Icon Cache**: Global cache prevents redundant image URL generation
- **Memoization**: `useMemo` and `useCallback` prevent unnecessary re-renders
- **React.memo**: Components wrapped to prevent re-renders when props unchanged
- **Lazy Loading**: Components loaded only when needed

### 2. Error Handling

- **Error Boundary**: Catches and displays errors gracefully
- **API Retry Logic**: Automatic retry with exponential backoff
- **Toast Notifications**: User-friendly error messages
- **Fallback States**: Loading and error states properly handled

### 3. Validation & Type Safety

- **TypeScript**: Full type coverage
- **Input Validation**: Amount limits, decimal precision
- **Business Logic**: Prevents invalid operations (same currency swap)
- **Null Safety**: Proper null/undefined checks

### 4. Accessibility

- **ARIA Labels**: All interactive elements labeled
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Screen Reader**: Compatible with screen readers

### 5. Code Quality

- **ESLint**: Configured with React and TypeScript rules
- **Type Safety**: Strict TypeScript configuration
- **Modular Architecture**: Separated concerns
- **Clean Code**: Following best practices

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Watch mode
npm test -- --watch
```

## 📊 API Integration

### Price Data

- **Endpoint**: `https://interview.switcheo.com/prices.json`
- **Retry Logic**: 3 attempts with exponential backoff
- **Timeout**: 10 seconds
- **Error Handling**: User-friendly error messages

### Token Icons

- **Source**: Switcheo Token Icons Repository
- **Fallback**: Hide icon if loading fails
- **Cache**: Images cached to prevent redundant requests

## 🎨 UI/UX Features

- **Responsive Design**: Works on all screen sizes
- **Loading States**: Visual feedback during API calls
- **Toast Notifications**: Success, error, warning messages
- **Smooth Animations**: Transitions and hover effects
- **Exchange Rate Display**: Real-time rate shown
- **Swap Animation**: Visual feedback on currency swap

## 🔒 Security Considerations

- **Environment Variables**: Sensitive data in .env
- **Input Sanitization**: All inputs validated
- **XSS Prevention**: React's built-in protection
- **API Timeout**: Prevents hanging requests

## 🚀 Deployment

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service (Vercel, Netlify, AWS S3, etc.).

## 📝 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Follow existing code style

## 📄 License

MIT

## 👨‍💻 Author

HungLuuThe

---

**Built with ❤️ using React + TypeScript + Vite**
