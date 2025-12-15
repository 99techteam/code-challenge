export interface Token {
  currency: string;
  price: number;
  symbol: string;
  name: string;
  icon: string;
  logo: string;
}

// Price data with logos
export const priceData = [
  { currency: "BLUR", price: 0.20811525423728813, logo: "/tokens/BLUR.svg" },
  { currency: "bNEO", price: 7.1282679, logo: "/tokens/bNEO.svg" },
  { currency: "BUSD", price: 0.999183113, logo: "/tokens/BUSD.svg" },
  { currency: "USD", price: 1, logo: "/tokens/USD.svg" },
  { currency: "ETH", price: 1645.9337373737374, logo: "/tokens/ETH.svg" },
  { currency: "GMX", price: 36.345114372881355, logo: "/tokens/GMX.svg" },
  {
    currency: "STEVMOS",
    price: 0.07276706779661017,
    logo: "https://ui-avatars.com/api/?name=STEVMOS&background=random&size=128&bold=true",
  },
  { currency: "LUNA", price: 0.40955638983050846, logo: "/tokens/LUNA.svg" },
  {
    currency: "RATOM",
    price: 10.250918915254237,
    logo: "https://ui-avatars.com/api/?name=RATOM&background=random&size=128&bold=true",
  },
  { currency: "STRD", price: 0.7386553389830508, logo: "/tokens/STRD.svg" },
  { currency: "EVMOS", price: 0.06246181355932203, logo: "/tokens/EVMOS.svg" },
  { currency: "IBCX", price: 41.26811355932203, logo: "/tokens/IBCX.svg" },
  { currency: "IRIS", price: 0.0177095593220339, logo: "/tokens/IRIS.svg" },
  {
    currency: "ampLUNA",
    price: 0.49548589830508477,
    logo: "/tokens/ampLUNA.svg",
  },
  { currency: "KUJI", price: 0.675, logo: "/tokens/KUJI.svg" },
  {
    currency: "STOSMO",
    price: 0.431318,
    logo: "https://ui-avatars.com/api/?name=STOSMO&background=random&size=128&bold=true",
  },
  { currency: "USDC", price: 0.989832, logo: "/tokens/USDC.svg" },
  { currency: "axlUSDC", price: 0.989832, logo: "/tokens/axlUSDC.svg" },
  { currency: "ATOM", price: 7.186657333333334, logo: "/tokens/ATOM.svg" },
  {
    currency: "STATOM",
    price: 8.512162050847458,
    logo: "https://ui-avatars.com/api/?name=STATOM&background=random&size=128&bold=true",
  },
  { currency: "OSMO", price: 0.3772974333333333, logo: "/tokens/OSMO.svg" },
  { currency: "rSWTH", price: 0.00408771, logo: "/tokens/rSWTH.svg" },
  {
    currency: "STLUNA",
    price: 0.44232210169491526,
    logo: "https://ui-avatars.com/api/?name=STLUNA&background=random&size=128&bold=true",
  },
  { currency: "LSI", price: 67.69661525423729, logo: "/tokens/LSI.svg" },
  { currency: "OKB", price: 42.97562059322034, logo: "/tokens/OKB.svg" },
  { currency: "OKT", price: 13.561577966101694, logo: "/tokens/OKT.svg" },
  { currency: "SWTH", price: 0.004039850455012084, logo: "/tokens/SWTH.svg" },
  { currency: "USC", price: 0.994, logo: "/tokens/USC.svg" },
  { currency: "WBTC", price: 26002.82202020202, logo: "/tokens/WBTC.svg" },
  { currency: "wstETH", price: 1872.2579742372882, logo: "/tokens/wstETH.svg" },
  {
    currency: "YieldUSD",
    price: 1.0290847966101695,
    logo: "/tokens/YieldUSD.svg",
  },
  { currency: "ZIL", price: 0.01651813559322034, logo: "/tokens/ZIL.svg" },
];

// Token names mapping
const tokenNames: Record<string, string> = {
  BLUR: "Blur",
  bNEO: "Binance NEO",
  BUSD: "Binance USD",
  USD: "US Dollar",
  ETH: "Ethereum",
  GMX: "GMX",
  STEVMOS: "Stride Evmos",
  LUNA: "Terra Luna",
  RATOM: "Reward Atom",
  STRD: "Stride",
  EVMOS: "Evmos",
  IBCX: "IBC Index",
  IRIS: "IRISnet",
  ampLUNA: "Amplified Luna",
  KUJI: "Kujira",
  STOSMO: "Stride Osmosis",
  USDC: "USD Coin",
  axlUSDC: "Axelar USDC",
  ATOM: "Cosmos",
  STATOM: "Stride Atom",
  OSMO: "Osmosis",
  rSWTH: "Reward Switcheo",
  STLUNA: "Stride Luna",
  LSI: "Liquid Staking Index",
  OKB: "OKB",
  OKT: "OKT Chain",
  SWTH: "Switcheo",
  USC: "USD Coin",
  WBTC: "Wrapped Bitcoin",
  wstETH: "Wrapped Staked Ether",
  YieldUSD: "Yield USD",
  ZIL: "Zilliqa",
};

// Create tokens array with full information
export const tokens: Token[] = priceData.map((item) => ({
  currency: item.currency,
  price: item.price,
  symbol: item.currency,
  name: tokenNames[item.currency] || item.currency,
  icon: item.logo, // Keep for backward compatibility
  logo: item.logo,
}));

// Helper function to get token by currency
export const getTokenByCurrency = (currency: string): Token | undefined => {
  return tokens.find((token) => token.currency === currency);
};

// Helper function to calculate exchange rate
export const calculateExchangeRate = (
  fromToken: Token,
  toToken: Token
): number => {
  return fromToken.price / toToken.price;
};

// Helper function to convert amount
export const convertAmount = (
  amount: number,
  fromToken: Token,
  toToken: Token
): number => {
  const rate = calculateExchangeRate(fromToken, toToken);
  return amount * rate;
};

// Export all currency symbols for backend validation
export const VALID_CURRENCIES = priceData.map((item) => item.currency);

// Export exchange rates for backend
export const EXCHANGE_RATES: Record<string, number> = priceData.reduce(
  (acc, item) => {
    acc[item.currency] = item.price;
    return acc;
  },
  {} as Record<string, number>
);
