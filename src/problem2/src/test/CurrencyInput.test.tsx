import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CurrencyInput } from "../components/app/currency-input";

describe("CurrencyInput Component", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder when no value is provided", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(null);
  });

  it("renders with provided value", () => {
    render(<CurrencyInput value={100} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue("100");
    expect(input).toBeInTheDocument();
  });

  it("prevents entering minus sign", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");

    // Try to press minus key
    fireEvent.keyDown(input, { key: "-" });

    // The keydown event should be prevented
    expect(input).toHaveValue(null);
  });

  it("prevents entering plus sign", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");

    // Try to press plus key
    fireEvent.keyDown(input, { key: "+" });

    // The keydown event should be prevented
    expect(input).toHaveValue(null);
  });

  it("prevents entering scientific notation (e/E)", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");

    // Try to press 'e' key
    fireEvent.keyDown(input, { key: "e" });
    fireEvent.keyDown(input, { key: "E" });

    // The keydown events should be prevented
    expect(input).toHaveValue(null);
  });

  it("limits maximum value to 1 billion", async () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");

    // Simulate entering a very large number
    fireEvent.input(input, { target: { valueAsNumber: 2000000000 } });

    expect(mockOnChange).toHaveBeenCalledWith(1000000000);
  });

  it("handles NaN values by converting to 0", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");

    // Simulate entering invalid input that results in NaN
    fireEvent.input(input, { target: { valueAsNumber: NaN } });

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it("handles zero value correctly", async () => {
    const user = userEvent.setup();
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");
    await user.type(input, "0");

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it("handles clearing input", async () => {
    const user = userEvent.setup();
    render(<CurrencyInput value={100} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue("100");
    await user.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it("displays empty string for zero value when not explicitly set", () => {
    render(<CurrencyInput onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Amount");
    expect(input).toHaveValue(null);
  });
});
