/** Token interface từ API */
export interface Token {
    id: string; // unique id cho dropdown & react key
    currency: string; // tên token (e.g. "ETH")
    logo: string; // url icon
    price: number; // giá token
    date: string; // ngày cập nhật giá
}

/** Props for CustomDropdown component */
export interface CustomDropdownProps {
    tokens: Token[];
    value: string;
    typeCard: 'from' | 'to';
    onChange: (value: string) => void;
    // placeholder?: HTMLElement | string;
    disabled?: string[];
}

/** Form values for react-hook-form */
export interface CurrencySwapFormValues {
    from: string;
    to: string;
    onClick: (from: string, to: string) => void;
}

/** Validation errors (custom) */
export interface ValidationErrors {
    from?: string;
    to?: string;
}
export interface ButtonTokenProps {
    selectedToken: Token;
}
