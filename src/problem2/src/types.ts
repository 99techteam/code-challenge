export interface TokenPrice {
    currency: string;
    date: string;
    price: number;
}

export interface Token {
    symbol: string;
    price: number;
    iconUrl: string;
}

export interface TokenBalance {
    symbol: string;
    balance: number;
}

export interface SwapFormData {
    fromToken: string; // Token symbol
    toToken: string; // Token symbol
    fromAmount: string;
}

export interface ValidationError {
    field: 'fromAmount' | 'toAmount' | 'fromToken' | 'toToken';
    message: string;
}
