import { describe, expect, it } from "vitest";
import { pickTokens } from "./prices";

describe("pickTokens", () => {
  it("keeps the newest quote per currency regardless of row order", () => {
    const rows = [
      { currency: "BUSD", date: "2023-08-29T07:10:40.000Z", price: 0.9 },
      { currency: "BUSD", date: "2023-08-29T07:10:50.000Z", price: 1.1 },
      { currency: "BUSD", date: "2023-08-29T07:10:45.000Z", price: 1.0 },
    ];
    expect(pickTokens(rows)).toEqual([{ symbol: "BUSD", price: 1.1 }]);
  });

  it("drops tokens without a usable price", () => {
    const rows = [
      { currency: "A", date: "2023-08-29T07:10:40.000Z", price: 0 },
      { currency: "B", date: "2023-08-29T07:10:40.000Z", price: -2 },
      { currency: "C", date: "2023-08-29T07:10:40.000Z", price: NaN },
      { currency: "D", date: "2023-08-29T07:10:40.000Z", price: 3 },
    ];
    expect(pickTokens(rows).map((t) => t.symbol)).toEqual(["D"]);
  });

  it("ignores a newer row with an unusable price instead of overwriting a valid quote", () => {
    const rows = [
      { currency: "X", date: "2023-08-29T07:10:40.000Z", price: 5 },
      { currency: "X", date: "2023-08-29T07:11:40.000Z", price: 0 },
    ];
    expect(pickTokens(rows)).toEqual([{ symbol: "X", price: 5 }]);
  });

  it("returns tokens sorted by symbol", () => {
    const rows = ["ETH", "BLUR", "USD"].map((currency) => ({
      currency,
      date: "2023-08-29T07:10:40.000Z",
      price: 1,
    }));
    expect(pickTokens(rows).map((t) => t.symbol)).toEqual(["BLUR", "ETH", "USD"]);
  });

  it("returns an empty list for empty input", () => {
    expect(pickTokens([])).toEqual([]);
  });
});
