# 💱 Currency Swap Application

A modern, responsive currency swap interface built with vanilla JavaScript, SCSS, and Vite. This application provides a sleek dark-themed UI for swapping between different cryptocurrencies with real-time exchange rates.

![Currency Swap Demo](https://fancy-form-ashy.vercel.app/)

## ✨ Features

- **🌙 Modern Dark Theme** - Beautiful gradient-based dark UI with glassmorphism effects
- **💱 Real-time Exchange Rates** - Fetches live cryptocurrency prices from Switcheo API
- **🔄 Currency Swapping** - Intuitive swap functionality between different tokens
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🎛️ Custom Number Controls** - Custom increment/decrement buttons for amount inputs
- **💰 Balance Display** - Shows available balance for selected currencies
- **📊 Transaction Details** - Clear breakdown of swap details and fees
- **⚡ Fast Performance** - Built with Vite for lightning-fast development and builds
- **🎨 Smooth Animations** - Polished transitions and hover effects

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (version 16.0 or higher)
- **npm** (comes with Node.js) or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fancy-form
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📦 Build for Production

To create a production build:

```bash
npm run build
```
or
```bash
yarn build
```

To preview the production build locally:

```bash
npm run preview
```
or
```bash
yarn preview
```

## 🛠️ Development

### Project Structure

```
fancy-form/
├── public/
│   ├── tokens/          # Token icon assets (SVG/PNG)
│   └── vite.svg
├── src/
│   ├── main.js          # Main application logic
│   └── style.scss       # Styles and theming
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Key Components

- **CONFIG** - Application configuration and constants
- **DOM** - DOM element references organized by category
- **AppState** - Application state management
- **Utils** - Utility functions for common operations
- **API** - API integration for fetching exchange rates
- **CurrencyManager** - Currency dropdown and selection logic
- **TransactionManager** - Transaction details management
- **ExchangeCalculator** - Exchange rate calculations
- **InputHandlers** - User input handling and validation
- **EventHandlers** - Event listener management
- **App** - Application initialization

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🎨 Customization

### Theming

The application uses CSS custom properties for theming. You can customize colors by modifying the `:root` variables in `src/style.scss`:

```scss
:root {
  --bg-primary: #0a0e27;
  --bg-secondary: #131740;
  --accent-primary: #00d4aa;
  --accent-secondary: #0099cc;
  // ... more variables
}
```

### Adding New Tokens

1. Add token icons to the `public/tokens/` directory (SVG format recommended)
2. The application will automatically detect and display available tokens from the API

### API Configuration

To use a different API endpoint, modify the `CONFIG.API_URL` in `src/main.js`:

```javascript
const CONFIG = {
  API_URL: 'your-api-endpoint-here',
  // ... other config
};
```

## 🌐 API Integration

The application fetches exchange rates from the Switcheo API:
- **Endpoint**: `https://interview.switcheo.com/prices.json`
- **Format**: JSON array with currency prices
- **Update Frequency**: On application load

### API Response Format

```json
[
  {
    "currency": "EVMOS",
    "date": "2023-01-01T00:00:00.000Z",
    "price": 0.0625
  }
]
```

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5173
   npx kill-port 5173
   # Or use a different port
   npm run dev -- --port 3000
   ```

2. **Dependencies not installing**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build fails**
   ```bash
   # Check Node.js version
   node --version
   # Should be 16.0 or higher
   ```

### Performance Tips

- Token icons are lazy-loaded with fallback images
- API calls are cached during the session
- Animations use CSS transforms for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Switcheo** for providing the exchange rate API
- **Inter Font** for the beautiful typography
- **Vite** for the excellent development experience

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing issues in the repository
3. Create a new issue with detailed information

---

**Happy Swapping! 💱✨** 