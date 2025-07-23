# Token Swap Application

A simple web application for swapping cryptocurrency tokens with a beautiful interface and comprehensive features.

## 📁 Project Structure

Make sure you have the following folder structure:

```
token-swap/
│
├── index.html          # Main HTML file
├── script.js           # JavaScript logic file
├── style.css           # CSS styling file
└── README.md           # This guide file
```

## 🚀 How to Run the Application

### Method 1: Open Directly in Browser

1. **Create a new folder** on your computer (e.g., `token-swap`)

2. **Save the files** with exact names:
   - `index.html` - Copy the HTML content into this file
   - `script.js` - Copy the JavaScript content into this file  
   - `style.css` - Copy the CSS content into this file

3. **Open the index.html file**:
   - Right-click on `index.html`
   - Select "Open with" → "Chrome" (or another browser)
   - Or drag and drop the file into a browser window

### Method 2: Using Live Server (Recommended)

If you have Visual Studio Code:

1. **Install Live Server extension**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server" and install it

2. **Open folder in VS Code**:
   - File → Open Folder → Select the folder containing your files

3. **Run Live Server**:
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - The website will automatically open at `http://localhost:5500`

### Method 3: Using Python Server

If you have Python installed:

```bash
# Open terminal/command prompt in the folder containing files
# For Python 3:
python -m http.server 8000

# For Python 2:
python -m SimpleHTTPServer 8000

# Then open browser and visit:
# http://localhost:8000
```

## 🎯 Interface and Features

When running successfully, you will see:

### 🏠 Main Interface
- **Header**: Logo and "Token Swap" title
- **From Section**: Select source token and enter amount
- **Swap Button**: Button to swap token positions
- **To Section**: Display destination token and received amount
- **Exchange Rate**: Exchange rate between tokens
- **Confirm Button**: Transaction confirmation button

### ✨ Key Features

1. **Token Selection**:
   - Click "Select Token" to open modal
   - Search tokens by name or symbol
   - Choose from popular token list

2. **Amount Input**:
   - Enter the amount of tokens to swap
   - Click "MAX" to select entire balance
   - Received amount is automatically calculated

3. **Position Swap**:
   - Click the ⇄ button to swap From/To token positions
   - Amounts will be updated accordingly

4. **Execute Transaction**:
   - Click "Confirm Swap" to start
   - Show loading during processing
   - Success modal when completed

## 🔧 Troubleshooting

### CORS Error (Cross-Origin)
If you encounter CORS errors when opening HTML file directly:

**Solution**: Use Live Server or Python server instead of opening file directly

### Token Icons Not Loading
- Token icons are loaded directly from GitHub
- Internet connection required to display icons
- Features still work normally without icons

### Token Prices Not Loading
- Token prices are fetched from API `https://interview.switcheo.com/prices.json`
- Internet connection required for real-time prices
- Will display "Price not available" if connection fails

## 🎨 Responsive Design

The application is designed to be responsive and works well on:
- 💻 Desktop (large screens)
- 📱 Mobile (phones)
- 📧 Tablet (tablets)

## 🌟 Supported Tokens

The application supports popular tokens:
- ETH (Ethereum)
- USDC (USD Coin) 
- USDT (Tether USD)
- WBTC (Wrapped Bitcoin)
- SWTH (Switcheo Token)
- ATOM (Cosmos)
- BNB (Binance Coin)
- MATIC (Polygon)
- AVAX (Avalanche)
- SOL (Solana)
- DOT (Polkadot)
- LINK (Chainlink)
- UNI (Uniswap)
- AAVE (Aave)
- COMP (Compound)

## 📝 Important Notes

- This is a demo application, no real transactions are performed
- Token balances and transactions are simulated only
- Exchange rates are calculated based on real API prices
- Application requires internet connection for full functionality

## 🆘 Need Help?

If you encounter issues:
1. Check internet connection
2. Try refreshing the page (F5)
3. Check browser console (F12) for errors
4. Ensure all 3 files are in the same folder with correct names

## 🔗 External Dependencies

The application uses:
- **Font Awesome 6.0.0** - For icons (loaded from CDN)
- **Switcheo Token Icons** - For token images (GitHub repository)
- **Prices API** - For real-time token prices

## 🎉 Getting Started

1. **Download/Create** the three files mentioned above
2. **Follow** one of the running methods
3. **Open** your browser to see the beautiful Token Swap interface
4. **Select** tokens and start swapping!

Enjoy using your Token Swap application! 🚀
