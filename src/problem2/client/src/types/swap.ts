// Type definitions
export interface TokenData {
    currency: string;
    date: string;
    price: number;
}

export interface ValidationErrors {
    sourceToken?: string;
    targetToken?: string;
    sourceAmount?: string;
    targetAmount?: string;
    sameToken?: string;
    api?: string;
}

export type TradeType = 'EXACT_INPUT' | 'EXACT_OUTPUT';