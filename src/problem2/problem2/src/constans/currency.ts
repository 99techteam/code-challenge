export const currencies = [
  { code: "USD", flag: "🇺🇸", rate: 1 }, // US Dollar
  { code: "EUR", flag: "🇪🇺", rate: 0.92 }, // Euro
  { code: "JPY", flag: "🇯🇵", rate: 156.5 }, // Japanese Yen
  { code: "GBP", flag: "🇬🇧", rate: 0.78 }, // British Pound
  { code: "AUD", flag: "🇦🇺", rate: 1.51 }, // Australian Dollar
  { code: "CAD", flag: "🇨🇦", rate: 1.37 }, // Canadian Dollar
  { code: "CHF", flag: "🇨🇭", rate: 0.9 }, // Swiss Franc
  { code: "CNY", flag: "🇨🇳", rate: 7.24 }, // Chinese Yuan
  { code: "HKD", flag: "🇭🇰", rate: 7.83 }, // Hong Kong Dollar
  { code: "NZD", flag: "🇳🇿", rate: 1.64 }, // New Zealand Dollar
  { code: "SEK", flag: "🇸🇪", rate: 10.77 }, // Swedish Krona
  { code: "KRW", flag: "🇰🇷", rate: 1375.5 }, // South Korean Won
  { code: "SGD", flag: "🇸🇬", rate: 1.35 }, // Singapore Dollar
  { code: "NOK", flag: "🇳🇴", rate: 10.67 }, // Norwegian Krone
  { code: "MXN", flag: "🇲🇽", rate: 17.12 }, // Mexican Peso
  { code: "INR", flag: "🇮🇳", rate: 83.4 }, // Indian Rupee
  { code: "RUB", flag: "🇷🇺", rate: 89.7 }, // Russian Ruble
  { code: "ZAR", flag: "🇿🇦", rate: 18.3 }, // South African Rand
  { code: "TRY", flag: "🇹🇷", rate: 32.2 }, // Turkish Lira
  { code: "BRL", flag: "🇧🇷", rate: 5.15 }, // Brazilian Real
  { code: "TWD", flag: "🇹🇼", rate: 32.3 }, // New Taiwan Dollar
  { code: "DKK", flag: "🇩🇰", rate: 6.86 }, // Danish Krone
  { code: "PLN", flag: "🇵🇱", rate: 4.03 }, // Polish Zloty
  { code: "THB", flag: "🇹🇭", rate: 36.6 }, // Thai Baht
  { code: "IDR", flag: "🇮🇩", rate: 16200 }, // Indonesian Rupiah
  { code: "HUF", flag: "🇭🇺", rate: 359.5 }, // Hungarian Forint
  { code: "CZK", flag: "🇨🇿", rate: 22.8 }, // Czech Koruna
  { code: "ILS", flag: "🇮🇱", rate: 3.68 }, // Israeli Shekel
  { code: "CLP", flag: "🇨🇱", rate: 930 }, // Chilean Peso
  { code: "PHP", flag: "🇵🇭", rate: 57.7 }, // Philippine Peso
  { code: "AED", flag: "🇦🇪", rate: 3.67 }, // UAE Dirham
  { code: "COP", flag: "🇨🇴", rate: 3900 }, // Colombian Peso
  { code: "SAR", flag: "🇸🇦", rate: 3.75 }, // Saudi Riyal
  { code: "MYR", flag: "🇲🇾", rate: 4.72 }, // Malaysian Ringgit
  { code: "RON", flag: "🇷🇴", rate: 4.57 }, // Romanian Leu
  { code: "BGN", flag: "🇧🇬", rate: 1.8 }, // Bulgarian Lev
  { code: "NGN", flag: "🇳🇬", rate: 1480 }, // Nigerian Naira
  { code: "PKR", flag: "🇵🇰", rate: 278 }, // Pakistani Rupee
  { code: "EGP", flag: "🇪🇬", rate: 47.5 }, // Egyptian Pound
  { code: "VND", flag: "🇻🇳", rate: 25500 }, // Vietnamese Dong
  { code: "BDT", flag: "🇧🇩", rate: 109.5 }, // Bangladeshi Taka
  { code: "LKR", flag: "🇱🇰", rate: 308 }, // Sri Lankan Rupee
  { code: "MMK", flag: "🇲🇲", rate: 2100 }, // Myanmar Kyat
  { code: "XOF", flag: "🌍", rate: 560 }, // CFA Franc BCEAO (West Africa)
  { code: "XAF", flag: "🌍", rate: 610 }, // CFA Franc BEAC (Central Africa)
  { code: "XCD", flag: "🌴", rate: 2.7 }, // East Caribbean Dollar
  { code: "XAU", flag: "🪙", rate: 0.0005 }, // Gold (no country)
  { code: "XAG", flag: "🪙", rate: 0.043 }, // Silver
  { code: "XDR", flag: "💰", rate: 0.75 }, // IMF Special Drawing Rights
  { code: "BTC", flag: "₿", rate: 0.000015 }, // Bitcoin
  { code: "ETH", flag: "🟪", rate: 0.00023 }, // Ethereum
];
export type Currency = {
  code: string;
  flag: string;
  rate: number;
};