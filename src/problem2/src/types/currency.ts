export interface PriceRecord { currency: string; date: string; price: number; }
export interface Currency extends PriceRecord { iconUrl: string; }
