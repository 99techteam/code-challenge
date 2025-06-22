import axiosInstance from "@services/axiosInstance";
import { IToken } from "@types/token";

export interface ITokenSearchParams {
  q?: string;
  currency?: string;
  currency_like?: string;
  price_gte?: number;
  price_lte?: number;
  _sort?: "currency" | "price" | "date";
  _order?: "asc" | "desc";
  _limit?: number;
  _start?: number;
  _end?: number;
}

// Get all tokens
export const getAllTokens = async (): Promise<IToken[]> => {
  const response = await axiosInstance.get("/coin");
  return response.data;
};

// Search tokens with query parameters
export const searchTokens = async (
  params: ITokenSearchParams
): Promise<IToken[]> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await axiosInstance.get(`/coin?${queryParams.toString()}`);
  return response.data;
};

// Get tokens by search term (full-text search)
export const searchTokensByTerm = async (
  searchTerm: string
): Promise<IToken[]> => {
  const response = await axiosInstance.get(
    `/coin?q=${encodeURIComponent(searchTerm)}`
  );
  return response.data;
};

// Get tokens by currency
export const getTokensByCurrency = async (
  currency: string
): Promise<IToken[]> => {
  const response = await axiosInstance.get(
    `/coin?currency=${encodeURIComponent(currency)}`
  );
  return response.data;
};

// Get tokens sorted by price
export const getTokensSortedByPrice = async (
  order: "asc" | "desc" = "desc",
  limit?: number
): Promise<IToken[]> => {
  const params = new URLSearchParams({
    _sort: "price",
    _order: order,
  });

  if (limit) {
    params.append("_limit", limit.toString());
  }

  const response = await axiosInstance.get(`/coin?${params.toString()}`);
  return response.data;
};

// Get tokens sorted by date
export const getTokensSortedByDate = async (
  order: "asc" | "desc" = "desc",
  limit?: number
): Promise<IToken[]> => {
  const params = new URLSearchParams({
    _sort: "date",
    _order: order,
  });

  if (limit) {
    params.append("_limit", limit.toString());
  }

  const response = await axiosInstance.get(`/coin?${params.toString()}`);
  return response.data;
};

// Get tokens by price range
export const getTokensByPriceRange = async (
  minPrice: number,
  maxPrice: number
): Promise<IToken[]> => {
  const response = await axiosInstance.get(
    `/coin?price_gte=${minPrice}&price_lte=${maxPrice}`
  );
  return response.data;
};

// Get top N highest priced tokens
export const getTopPricedTokens = async (
  limit: number = 10
): Promise<IToken[]> => {
  return getTokensSortedByPrice("desc", limit);
};

// Get top N lowest priced tokens
export const getLowestPricedTokens = async (
  limit: number = 10
): Promise<IToken[]> => {
  return getTokensSortedByPrice("asc", limit);
};
