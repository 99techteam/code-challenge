# Currency Swap Form

A modern, interactive currency swap interface built with Vite, vanilla JavaScript, and a beautiful UI.

## Features

- 🎨 **Modern Design**: Clean, gradient-based UI with smooth animations
- 🔄 **Token Swapping**: Intuitive token selection and swapping mechanism
- 💰 **Real-time Pricing**: Fetches live token prices from Switcheo API
- 🔍 **Token Search**: Filter tokens by name or symbol
- ✨ **Interactive Elements**: Hover effects, loading states, and feedback
- 📱 **Responsive**: Works on desktop and mobile devices
- ⚡ **Fast**: Built with Vite for optimal performance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the problem2 directory:
   ```bash
   cd src/problem2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Select Tokens**: Click on the "Select Token" dropdown for both "From" and "To" sections
2. **Search Tokens**: Use the search bar in the modal to find specific tokens
3. **Enter Amount**: Type the amount you want to swap in the "From" field
4. **View Exchange Rate**: The app automatically calculates and displays the exchange rate
5. **Swap Direction**: Click the swap button in the middle to reverse the token order
6. **MAX Button**: Click "MAX" to use your full token balance
7. **Confirm Swap**: Click "Confirm Swap" to execute the transaction (simulated)

## Features Demonstrated

### Token Management
- Dynamic token list with real token icons from Switcheo repository
- Live price fetching from `https://interview.switcheo.com/prices.json`
- Mock balance management for demonstration

### User Experience
- Real-time exchange rate calculations
- Input validation with helpful error messages
- Loading states and success feedback
- Responsive design for all screen sizes

### Technical Implementation
- Modern ES6+ JavaScript
- Modular code organization
- Async/await for API calls
- Event-driven architecture
- CSS Grid/Flexbox for layouts

## API Integration

The app integrates with:
- **Token Icons**: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{symbol}.svg`
- **Price Data**: `https://interview.switcheo.com/prices.json`

## Technologies Used

- **Build Tool**: Vite
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS with modern features
- **Icons**: Font Awesome
- **API**: Fetch API for HTTP requests

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

This project is for demonstration purposes as part of a coding challenge. 