import SearchableSelect from "@components/SearchableSelect";
import { render, screen, fireEvent } from "@testing-library/react";

describe("SearchableSelect Component", () => {
  const options = [
    { label: "USD", value: "usd" },
    { label: "EUR", value: "eur" },
    { label: "JPY", value: "jpy" },
  ];

  it("renders the component with the correct placeholder", () => {
    render(
      <SearchableSelect
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select currency"
      />
    );

    expect(screen.getByText("Select currency")).toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(
      <SearchableSelect
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select currency"
      />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.getByText("JPY")).toBeInTheDocument();
  });

  it("filters options when searching", () => {
    render(
      <SearchableSelect
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select currency"
        isSearchable
      />
    );

    fireEvent.click(screen.getByRole("button"));

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "eur" },
    });

    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.queryByText("USD")).toBeNull();
    expect(screen.queryByText("JPY")).toBeNull();
  });

  it("calls onChange when an option is selected", () => {
    const mockOnChange = jest.fn();
    render(
      <SearchableSelect
        options={options}
        value=""
        onChange={mockOnChange}
        placeholder="Select currency"
      />
    );

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(screen.getByText("EUR"));

    expect(mockOnChange).toHaveBeenCalledWith("eur");
  });

  it("closes dropdown when an option is selected", () => {
    render(
      <SearchableSelect
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select currency"
      />
    );

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(screen.getByText("EUR"));

    expect(screen.queryByText("USD")).not.toBeInTheDocument();
    expect(screen.queryByText("EUR")).not.toBeInTheDocument();
    expect(screen.queryByText("JPY")).not.toBeInTheDocument();
  });

  it('shows "No options found" when search yields no results', () => {
    render(
      <SearchableSelect
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select currency"
        isSearchable
      />
    );

    fireEvent.click(screen.getByRole("button"));

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "xyz" },
    });

    expect(screen.getByText("No options found")).toBeInTheDocument();
  });

  it("clears value when clear button is clicked", () => {
    const mockOnChange = jest.fn();
    render(
      <SearchableSelect
        options={options}
        value="usd"
        onChange={mockOnChange}
        placeholder="Select currency"
        isClearable
      />
    );

    const clearButton = screen.getByText("×");
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("closes dropdown when clicked outside", () => {
    render(
      <SearchableSelect
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select currency"
      />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText("USD")).toBeInTheDocument();

    fireEvent.mouseDown(document);

    expect(screen.queryByText("USD")).not.toBeInTheDocument();
  });
});
