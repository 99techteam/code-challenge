import ApiClient from "./apiClient";

export interface PriceData {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: string;
  value: string;
  priceUsd: number;
}

class TokenService {
  private static instance: TokenService;
  private apiClient: ApiClient;

  private constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  public async fetchPrices(): Promise<PriceData[]> {
    try {
      const response = await this.apiClient.get<PriceData[]>("/prices.json");

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format received from API");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching prices:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch price data");
    }
  }

  public transformPriceDataToTokens(priceData: PriceData[]): Token[] {
    if (!Array.isArray(priceData) || priceData.length === 0) {
      throw new Error("No price data available");
    }

    // Get the latest price for each currency
    const latestPrices = new Map<string, PriceData>();

    priceData.forEach((item) => {
      // Validate data structure
      if (!item.currency || typeof item.price !== "number" || !item.date) {
        console.warn("Invalid price data item:", item);
        return;
      }

      const existing = latestPrices.get(item.currency);
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        latestPrices.set(item.currency, item);
      }
    });

    if (latestPrices.size === 0) {
      throw new Error("No valid price data found");
    }

    // Convert to Token format with mock balance data
    const tokens: Token[] = Array.from(latestPrices.values()).map(
      (priceItem) => {
        const mockBalance = Math.random() * 1000; // Random balance for demo
        const totalValue = mockBalance * priceItem.price;

        return {
          symbol: priceItem.currency,
          name: this.getCurrencyName(priceItem.currency),
          icon: this.getCurrencyIcon(priceItem.currency),
          balance: mockBalance.toFixed(4),
          value: `$${totalValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          priceUsd: priceItem.price,
        };
      }
    );

    // Sort by market cap (price * balance) descending
    return tokens.sort((a, b) => {
      const aValue = parseFloat(a.balance) * a.priceUsd;
      const bValue = parseFloat(b.balance) * b.priceUsd;
      return bValue - aValue;
    });
  }

  private getCurrencyIcon(currency: string): string {
    // Handle special cases where API currency names don't match file names
    const CURRENCY_MAPPING: Record<string, string> = {
      STEVMOS: "stEVMOS",
      RATOM: "rATOM",
      STOSMO: "stOSMO",
      STATOM: "stATOM",
      STLUNA: "stLUNA",
    };

    // Use mapped name if available, otherwise use original currency name
    const iconName = CURRENCY_MAPPING[currency] || currency;

    // Return just the filename - the TokenIcon component will handle the path construction
    return `${iconName}.svg`;
  }

  private getCurrencyName(currency: string): string {
    const CURRENCY_NAMES: Record<string, string> = {
      ETH: "Ethereum",
      WBTC: "Wrapped Bitcoin",
      USDC: "USD Coin",
      BUSD: "Binance USD",
      USD: "US Dollar",
      ATOM: "Cosmos",
      OSMO: "Osmosis",
      LUNA: "Terra Luna",
      BLUR: "Blur",
      GMX: "GMX",
      OKB: "OKB",
      ZIL: "Zilliqa",
      bNEO: "Binance NEO",
      STEVMOS: "Staked EVMOS",
      RATOM: "Rocket Pool ATOM",
      STRD: "Stride",
      EVMOS: "Evmos",
      IBCX: "IBC Index",
      IRIS: "IRISnet",
      ampLUNA: "Amplified Luna",
      KUJI: "Kujira",
      STOSMO: "Staked Osmosis",
      axlUSDC: "Axelar USDC",
      STATOM: "Staked ATOM",
      rSWTH: "Rocket SWTH",
      STLUNA: "Staked Luna",
      LSI: "Liquid Staking Index",
      OKT: "OKT Chain",
      SWTH: "Switcheo",
      USC: "USC",
      wstETH: "Wrapped Staked ETH",
      YieldUSD: "Yield USD",
    };

    return CURRENCY_NAMES[currency] || currency;
  }

  public async getTokens(): Promise<Token[]> {
    const priceData = await this.fetchPrices();
    return this.transformPriceDataToTokens(priceData);
  }
}

export default TokenService;
