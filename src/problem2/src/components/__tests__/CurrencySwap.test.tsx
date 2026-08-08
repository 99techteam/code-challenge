import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useCurrencyStore } from "@stores/Currencies/currencies";

import CurrencySwap from "@components/CurrencySwap";

jest.mock("@stores/Currencies/currencies", () => ({
  useCurrencyStore: jest.fn(),
}));

jest.mock("@components/SearchableSelect", () => ({
  __esModule: true,
  default: ({ value, onChange, options }: any) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

describe("CurrencySwap Component", () => {
  let mockSetFromCurrency: jest.Mock;
  let mockSetToCurrency: jest.Mock;
  let mockSetAmount: jest.Mock;

  beforeEach(() => {
    mockSetFromCurrency = jest.fn();
    mockSetToCurrency = jest.fn();
    mockSetAmount = jest.fn();

    (useCurrencyStore as any).mockReturnValue({
      fromCurrency: "USD",
      toCurrency: "EUR",
      amount: 100,
      priceData: {
        USD: 1,
        EUR: 0.85,
      },
      setFromCurrency: mockSetFromCurrency,
      setToCurrency: mockSetToCurrency,
      setAmount: mockSetAmount,
    });
  });

  it("renders correctly and displays initial currencies and amounts", () => {
    render(<CurrencySwap />);

    expect(screen.getByText("Convert and Swap USD to EUR")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
  });

  it("should update amount when user changes from amount input", () => {
    render(<CurrencySwap />);

    const fromInput = screen.getByRole("spinbutton", { name: /from amount/i });

    fireEvent.change(fromInput, { target: { value: "200" } });

    expect(mockSetAmount).toHaveBeenCalledWith(200);
    expect(mockSetFromCurrency).toHaveBeenCalled();
  });

  it("should handle currency swap action", async () => {
    render(<CurrencySwap />);

    const swapButton = screen.getByRole("button");

    fireEvent.click(swapButton);

    await waitFor(() => {
      expect(mockSetFromCurrency).toHaveBeenCalledWith("EUR");
      expect(mockSetToCurrency).toHaveBeenCalledWith("USD");
      expect(mockSetAmount).toHaveBeenCalledWith(85);
    });
  });

  it("should update to amount when user changes to amount input", () => {
    render(<CurrencySwap />);

    const toInput = screen.getByRole("spinbutton", { name: /to amount/i });

    fireEvent.change(toInput, { target: { value: "150" } });

    expect(mockSetFromCurrency).toHaveBeenCalled();
    expect(mockSetAmount).toHaveBeenCalledWith(150 / 0.85);
  });

  it("should display currency options in the select dropdown", () => {
    render(<CurrencySwap />);

    const fromCurrencySelect = screen.getByRole("combobox", {
      name: /from currency/i,
    });
    const toCurrencySelect = screen.getByRole("combobox", {
      name: /to currency/i,
    });

    expect(fromCurrencySelect).toHaveTextContent("USD");
    expect(toCurrencySelect).toHaveTextContent("EUR");
  });
});
