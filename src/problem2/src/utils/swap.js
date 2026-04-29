const MOCK_BALANCES = [2.8, 1200, 460, 88, 15400, 940, 38, 720];

export function createBalances(tokens) {
  // Mock wallet balances for this frontend-only challenge.
  return tokens.reduce((result, token, index) => {
    result[token.symbol] = MOCK_BALANCES[index % MOCK_BALANCES.length];
    return result;
  }, {});
}

export function calculateOutput(amount, fromToken, toToken) {
  if (!amount || !fromToken || !toToken) {
    return 0;
  }

  return (amount * fromToken.price) / toToken.price;
}

export function validateSwap({ amountText, amount, balance, fromSymbol, toSymbol }) {
  if (!fromSymbol || !toSymbol) {
    return "";
  }

  if (fromSymbol === toSymbol) {
    return "Choose two different currencies.";
  }

  if (amountText !== "") {
    const trimmed = String(amountText).trim();

    // Allow partial inputs like "." while the user is typing.
    if (trimmed === ".") {
      return "";
    }

    if (!Number.isFinite(amount)) {
      return "Enter a valid number.";
    }

    if (amount <= 0) {
      return "Enter an amount greater than zero.";
    }
  }

  if (amount > balance) {
    return `Insufficient ${fromSymbol} balance.`;
  }

  return "";
}
