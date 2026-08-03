import { describe, expect, it } from "vitest";
import {
  buildRouteQuotes,
  calculateQuote,
  chooseRecommendedRoute,
  normalizePrices,
  projectRouteOutput,
  validateAmount,
} from "./domain";

describe("normalizePrices", () => {
  it("drops invalid rows and keeps the latest duplicate", () => {
    const tokens = normalizePrices([
      { currency: "AAA", date: "2024-01-01", price: 1 },
      { currency: "AAA", date: "2025-01-01", price: 2 },
      { currency: "BROKEN", price: 0 },
    ]);

    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.price).toBe(2);
  });
});

describe("calculateQuote", () => {
  it("calculates exchange output and fee", () => {
    const from = {
      symbol: "AAA",
      name: "AAA",
      price: 10,
      date: null,
      iconUrl: "",
      balance: 100,
    };
    const to = {
      ...from,
      symbol: "BBB",
      name: "BBB",
      price: 2,
    };

    const quote = calculateQuote(2, from, to, 0.5);

    expect(quote.rate).toBe(5);
    expect(quote.grossOutput).toBe(10);
    expect(quote.serviceFee).toBe(0.01);
    expect(quote.netOutput).toBe(9.99);
  });
});

describe("validateAmount", () => {
  it("rejects invalid, over-precision, and over-balance values", () => {
    expect(validateAmount("", 10)).toBeTruthy();
    expect(validateAmount("1.123456789", 10)).toBeTruthy();
    expect(validateAmount("11", 10)).toBeTruthy();
    expect(validateAmount("5", 10)).toBeNull();
  });
});


describe("intent route engine", () => {
  const from = {
    symbol: "ETH",
    name: "Ethereum",
    price: 3000,
    date: null,
    iconUrl: "",
    balance: 10,
  };
  const to = {
    symbol: "USDC",
    name: "USD Coin",
    price: 1,
    date: null,
    iconUrl: "",
    balance: 10000,
  };

  it("builds three distinct routes and recommends by intent", () => {
    const routes = buildRouteQuotes(1, from, to, 0.5);

    expect(routes).toHaveLength(3);
    expect(chooseRecommendedRoute(routes, "maximize").id).toBe("split");
    expect(chooseRecommendedRoute(routes, "balanced").id).toBe("direct");
    expect(chooseRecommendedRoute(routes, "protect").id).toBe("stable");
  });

  it("projects less output when destination price rises", () => {
    const route = buildRouteQuotes(1, from, to, 0.5)[0];
    expect(route).toBeDefined();

    if (!route) return;

    expect(projectRouteOutput(route, 2)).toBeLessThan(route.netOutput);
    expect(projectRouteOutput(route, -2)).toBeGreaterThan(route.netOutput);
  });
});
