import { tokenApi } from "../services/api.js";

class AppState {
  constructor() {
    this.state = {
      fromToken: { symbol: "ETH", name: "Ethereum", price: 0 },
      toToken: { symbol: "USDC", name: "USD Coin", price: 0 },
      tokens: [],
      prices: {},
      selectingFor: null,
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  async loadTokens() {
    try {
      const tokens = await tokenApi.fetchPrices();
      this.state.tokens = tokens;

      this.state.prices = {};
      tokens.forEach((token) => {
        this.state.prices[token.symbol] = token.price;
      });

      const ethToken = tokens.find((t) => t.symbol === "ETH");
      const usdcToken = tokens.find((t) => t.symbol === "USDC");

      if (ethToken) this.state.fromToken = ethToken;
      if (usdcToken) this.state.toToken = usdcToken;

      console.log(`Loaded ${tokens.length} tokens`);
      this.notify();
    } catch (error) {
      this.state.tokens = [];
      this.notify();
    }
  }

  setFromToken(token) {
    this.state.fromToken = token;
    this.notify();
  }

  setToToken(token) {
    this.state.toToken = token;
    this.notify();
  }

  swapTokens() {
    const temp = this.state.fromToken;
    this.state.fromToken = this.state.toToken;
    this.state.toToken = temp;
    this.notify();
  }

  openTokenModal(type) {
    this.state.selectingFor = type;
    this.notify();
  }

  closeTokenModal() {
    this.state.selectingFor = null;
    this.notify();
  }

  getState() {
    return this.state;
  }
}

export const appState = new AppState();
