# Currency Swap Application

A currency exchange rate calculator with real-time conversion, built with vanilla JavaScript, HTML5, and CSS3.

## Overview

This application allows users to convert between different currencies using real-time exchange rates.

## Features

- 🔄 Real-time currency conversion with live exchange rates
- 💱 Support for 8 major currencies (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY)
- ♻️ One-click currency swap functionality
- ✅ Comprehensive form validation with user-friendly error messages
- ♿ Full accessibility support (ARIA labels, screen reader friendly)
- 📱 Responsive design for mobile and desktop
- ⚡ Performance optimized with debouncing and request cancellation
- 🎨 Modern gradient design with smooth animations

## File Structure

```
problem2/
├── index.html    # Semantic HTML5 structure with accessibility features
├── style.css     # CSS with custom properties (CSS variables) for theming
├── script.js     # JavaScript application logic
└── README.md     # This file
```

## Technologies

- **HTML5**: Semantic markup, ARIA attributes, accessibility features
- **CSS3**: Custom properties, flexbox, animations, responsive design
- **JavaScript (ES6+)**: Async/await, fetch API, AbortController, debouncing
- **API**: ExchangeRate-API (https://api.exchangerate-api.com/v4/latest/)

## Code Architecture

### Constants & Configuration

All magic numbers and strings are extracted into constants at the top of `script.js`:

```javascript
const API_URL = 'https://api.exchangerate-api.com/v4/latest/';
const DEFAULT_BASE_CURRENCY = 'USD';
const MAX_AMOUNT = 1000000;
const MIN_AMOUNT = 0;
const DECIMAL_PLACES = 2;
const INPUT_DEBOUNCE_MS = 300;
```

### State Management

The application maintains state using module-level variables:

- `exchangeRates`: Cached exchange rates from API
- `currentBaseCurrency`: Currently loaded base currency
- `abortController`: For cancelling ongoing API requests
- `inputDebounceTimer`: For debouncing input events

### DOM Element Caching

All DOM elements are queried once at initialization and cached for performance:

```javascript
const inputAmount = document.getElementById('input-amount');
const outputAmount = document.getElementById('output-amount');
// ... etc
```

## Key Functions

### `fetchExchangeRates(base)`

Fetches exchange rates from the API for a given base currency.

**Features:**

- Uses `AbortController` to cancel previous requests and prevent race conditions
- Validates API response structure
- Handles errors gracefully (ignores aborted requests)

**Logic Flow:**

1. Cancel any ongoing request
2. Create new AbortController
3. Fetch rates from API
4. Validate response
5. Update cached rates and base currency

### `calculateConversion()`

Calculates the converted amount based on input and selected currencies.

**Conversion Logic:**

- If base currency matches input currency: Direct rate lookup
- If base currency matches output currency: Inverse calculation
- Otherwise: Convert through base currency (input → base → output)

**Example:**

- Base: USD, Input: USD → EUR: `rate = exchangeRates.EUR`
- Base: USD, Input: EUR → USD: `rate = 1 / exchangeRates.EUR`
- Base: USD, Input: GBP → EUR: `rate = (1 / exchangeRates.GBP) * exchangeRates.EUR`

### `validateForm()`

Validates the form before submission with multiple checks:

1. **Input Amount Validation:**

   - Must not be empty
   - Must be greater than 0
   - Must not exceed MAX_AMOUNT (1,000,000)

2. **Output Amount Validation:**

   - Must have a valid calculated value

3. **Currency Validation:**
   - Input and output currencies must be different

### `debounce(func, wait)`

Limits function calls to improve performance. Used for input field changes to prevent excessive calculations while typing.

**How it works:**

- Delays function execution until user stops typing for specified time (300ms)
- Cancels previous pending execution if new event occurs
- Reduces API calls and DOM manipulations

### Event Handlers

**`handleInputChange()`** - Debounced handler for input amount changes

- Clears errors and success messages
- Recalculates conversion

**`handleInputCurrencyChange()`** - Handler for input currency selection

- Fetches new exchange rates for selected currency
- Updates icons and recalculates

**`handleOutputCurrencyChange()`** - Handler for output currency selection

- Updates icons and recalculates (uses existing rates)

**`handleSwap()`** - Swaps input and output currencies/amounts

- Swaps currency values
- Swaps amount values
- Updates icons
- Recalculates if input has value

**`handleFormSubmit()`** - Handles form submission

- Validates form
- Shows loading state
- Simulates API call (2 second delay)
- Shows success message for 5 seconds

## Accessibility Features (WCAG 2.1 Compliant)

### HTML Semantics

- Semantic HTML5 elements (`<main>`, `<header>`, `<fieldset>`, `<section>`)
- Proper heading hierarchy
- Form labels and legends

### ARIA Attributes

- `aria-label` and `aria-labelledby` for form controls
- `aria-describedby` linking inputs to error messages
- `aria-invalid` for error states
- `aria-required` for required fields
- `aria-live` regions for dynamic content (errors, success, rate info)
- `aria-busy` for loading states
- `aria-hidden="true"` for decorative elements

### Screen Reader Support

- `.sr-only` class for visually hidden but accessible text
- Descriptive labels for all interactive elements
- Full currency names in option labels (e.g., "USD - US Dollar")

### Keyboard Navigation

- Full keyboard accessibility
- Focus management for error states
- Proper tab order

## Performance Optimizations

### 1. Debouncing

- Input changes are debounced (300ms) to reduce calculations
- Prevents excessive function calls while typing

### 2. Request Cancellation

- Uses `AbortController` to cancel previous API requests
- Prevents race conditions when changing currencies quickly
- Reduces unnecessary network traffic

### 3. DOM Caching

- All DOM elements queried once and cached
- Avoids repeated `getElementById` calls

### 4. CSS Custom Properties

- Centralized theming with CSS variables
- Easy to maintain and modify
- Reduced CSS duplication

### 5. Null Safety

- Optional chaining (`?.`) throughout code
- Prevents errors if DOM elements are missing

## Styling Architecture

### CSS Custom Properties

The CSS uses CSS variables for maintainability:

```css
:root {
  --color-primary: #14b8a6;
  --color-gradient-start: #14b8a6;
  --color-gradient-end: #3b82f6;
  --spacing-md: 12px;
  --transition-base: 0.3s ease;
  /* ... etc */
}
```

**Benefits:**

- Easy theme changes (modify variables only)
- Consistent spacing and colors
- Better maintainability

### Design System

- **Colors**: Teal/blue gradient theme with semantic color variables
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- **Typography**: System font stack for optimal performance
- **Animations**: Smooth transitions and slide-up animations

### Responsive Design

- Mobile-first approach
- Breakpoint at 480px
- Adjusted padding and font sizes for mobile

## Error Handling

### User-Facing Errors

The application provides clear, actionable error messages:

1. **Invalid Amount**: "Please enter an amount greater than 0"
2. **Amount Too Large**: "Amount exceeds maximum limit of 1,000,000"
3. **Invalid Conversion**: "Invalid conversion amount"
4. **Same Currency**: "Please select different currencies"

### Error Display

- Errors appear inline below relevant fields
- Visual indicators (red border, error icon)
- ARIA live regions for screen readers
- Automatic error clearing when user corrects input

## API Integration

### Exchange Rate API

**Endpoint:** `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`

**Response Format:**

```json
{
  "rates": {
    "USD": 1.0,
    "EUR": 0.85,
    "GBP": 0.73,
    ...
  },
  "base": "USD",
  "date": "2024-01-01"
}
```

### Rate Caching Strategy

- Rates are cached in memory after first fetch
- Base currency determines which rates are cached
- New rates fetched when input currency changes
- Output currency changes use cached rates

## Usage Flow

1. **Initialization:**

   - Fetches USD exchange rates on load
   - Updates currency icons
   - Attaches event listeners

2. **User Input:**

   - User enters amount in input field
   - Conversion calculated in real-time (debounced)
   - Rate information displayed

3. **Currency Selection:**

   - User selects input currency → Fetches new rates
   - User selects output currency → Uses cached rates
   - Conversion recalculated automatically

4. **Currency Swap:**

   - User clicks swap button
   - Currencies and amounts swapped
   - Conversion recalculated

5. **Form Submission:**
   - Validates all fields
   - Shows loading state
   - Simulates API call
   - Shows success message

## Code Quality Features

- **Comments**: All functions documented
- **Consistent Code Style**: Uniform formatting
- **Error Boundaries**: Null checks and error handling
- **Separation of Concerns**: Functions organized by responsibility
- **DRY Principle**: Reusable utility functions
- **Defensive Programming**: Null safety throughout

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features (async/await, fetch API, AbortController)
- CSS Custom Properties (CSS Variables)
- Flexbox layout

## Future Enhancements

Potential improvements:

- Add more currencies
- Historical rate charts
- Rate refresh mechanism
- Offline support with service workers
- Currency symbols instead of flags
- Dark mode support
