import { faker } from "@faker-js/faker"
import { delay, http, HttpResponse } from "msw"
import { toTokenAmount } from "@/lib/number"

// Mock Data
const HOT_TOKENS = {
  tokens: [
    {
      chainId: 1,
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png"
    },
    {
      chainId: 1,
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
      decimals: 8,
      logoURI: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png"
    },
    {
      chainId: 1,
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      logoURI: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png"
    },
    {
      chainId: 1,
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png"
    },
    {
      chainId: 1,
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      name: "Dai Stablecoin",
      symbol: "DAI",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png"
    },
    {
      chainId: 1,
      address: "0x514910771af9ca656af840dff83e8264ecf986ca",
      name: "Chainlink",
      symbol: "LINK",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"
    },
    {
      chainId: 1,
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      name: "Uniswap",
      symbol: "UNI",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png"
    },
    {
      chainId: 1,
      address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png"
    },
    {
      chainId: 1,
      address: "0x418d75f65a02b3d538de4971f0aa222a34794d26",
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
    }
  ]
}

// Session (Simple in-memory for demo)
let isAuthenticated = false

export const handlers = [
  // --- Wallet Mocks ---
  http.post("/api/wallet/connect", async () => {
    await delay(500)
    isAuthenticated = true
    return HttpResponse.json({
      address: faker.finance.ethereumAddress(),
      chainId: 1
    })
  }),

  http.post("/api/wallet/disconnect", async () => {
    isAuthenticated = false
    return HttpResponse.json({ success: true })
  }),

  http.get("/api/wallet/balances", async () => {
    if (!isAuthenticated) {
      return HttpResponse.json({}, { status: 401 })
    }
    // Return random balances (symbol-based)
    return HttpResponse.json({
      WETH: faker.number.float({ min: 0, max: 20, fractionDigits: 4 }),
      USDC: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
      WBTC: faker.number.float({ min: 0, max: 1, fractionDigits: 5 }),
      BNB: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 })
    })
  }),

  // --- External APIs Intercept ---

  // CoinGecko (Hot Tokens)
  http.get("https://tokens.coingecko.com/uniswap/all.json", () => {
    return HttpResponse.json(HOT_TOKENS)
  }),

  // 0x Quote API
  http.get("https://api.0x.org/swap/v1/quote", ({ request }) => {
    const url = new URL(request.url)
    const buyToken = url.searchParams.get("buyToken")
    const sellToken = url.searchParams.get("sellToken")
    const sellAmount = url.searchParams.get("sellAmount")

    if (!buyToken || !sellToken || !sellAmount) {
      return HttpResponse.json({ code: 100, reason: "Validation Failed" }, { status: 400 })
    }

    const sellTokenInfo = HOT_TOKENS.tokens.find(t => t.address.toLowerCase() === sellToken.toLowerCase())
    const buyTokenInfo = HOT_TOKENS.tokens.find(t => t.address.toLowerCase() === buyToken.toLowerCase())

    const sellDecimals = sellTokenInfo?.decimals ?? 18
    const buyDecimals = buyTokenInfo?.decimals ?? 18

    const price = faker.number.float({ min: 0.5, max: 4000, fractionDigits: 6 })

    const sellVal = parseInt(sellAmount, 10) / 10 ** sellDecimals
    const buyVal = sellVal * price
    const buyAmount = toTokenAmount(buyVal, buyDecimals)

    const gasPrice = faker.number.int({ min: 10, max: 50 }).toString()
    const estimatedGas = faker.number.int({ min: 100000, max: 200000 }).toString()

    return HttpResponse.json({
      price: price.toString(),
      guaranteedPrice: (price * 0.99).toString(),
      to: faker.finance.ethereumAddress(),
      data: faker.string.hexadecimal({ length: 64 }),
      value: "0",
      gas: estimatedGas,
      estimatedGas: estimatedGas,
      gasPrice: `${gasPrice}000000000`, // Gwei to Wei
      protocolFee: "0",
      minimumProtocolFee: "0",
      buyTokenAddress: buyToken,
      sellTokenAddress: sellToken,
      buyAmount: buyAmount,
      sellAmount: sellAmount,
      sources: [{ name: "Uniswap_V3", proportion: "1" }],
      allowanceTarget: faker.finance.ethereumAddress()
    })
  }),

  // --- Swap Execution ---
  http.post("/api/swap", async () => {
    await delay(faker.number.int({ min: 1000, max: 3000 }))
    return HttpResponse.json({
      txHash: faker.string.hexadecimal({ length: 64 }),
      status: "success"
    })
  })
]
