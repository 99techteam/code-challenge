import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IToken } from "@types/token";
import { getTokenIconUrlSmart } from "@utils/getTokenIcon";
import {
  getAllTokens,
  getTokensSortedByDate,
  getTokensSortedByPrice,
  ITokenSearchParams,
  searchTokens,
} from "./tokenAPI";

interface ITokenState {
  tokens: IToken[];
  filteredTokens: IToken[];
  isLoading: boolean;
  error: string | null;
  searchParams: ITokenSearchParams;
}

const initialState: ITokenState = {
  tokens: [],
  filteredTokens: [],
  isLoading: false,
  error: null,
  searchParams: {},
};

// Fetch all tokens
export const fetchTokens = createAsyncThunk<IToken[]>(
  "token/fetchTokens",
  async () => {
    const tokens = await getAllTokens();
    return tokens.filter((t) => t.price !== null);
  }
);

// Search tokens with parameters
export const searchTokensAsync = createAsyncThunk<IToken[], ITokenSearchParams>(
  "token/searchTokens",
  async (params) => {
    return await searchTokens(params);
  }
);

// Get sorted tokens
export const fetchSortedTokens = createAsyncThunk<
  IToken[],
  {
    sortBy: "price" | "date" | "currency";
    order: "asc" | "desc";
    limit?: number;
  }
>("token/fetchSortedTokens", async ({ sortBy, order, limit }) => {
  switch (sortBy) {
    case "price":
      return await getTokensSortedByPrice(order, limit);
    case "date":
      return await getTokensSortedByDate(order, limit);
    default:
      return await getAllTokens();
  }
});

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<ITokenSearchParams>) => {
      state.searchParams = action.payload;
    },
    clearSearchParams: (state) => {
      state.searchParams = {};
      state.filteredTokens = state.tokens;
    },
    setFilteredTokens: (state, action: PayloadAction<IToken[]>) => {
      state.filteredTokens = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTokens.fulfilled,
        (state, action: PayloadAction<IToken[]>) => {
          const tokensWithImage = action.payload.map((token, index) => ({
            ...token,
            key: index,
            logo: getTokenIconUrlSmart(token.currency),
          }));
          state.tokens = tokensWithImage;
          state.filteredTokens = tokensWithImage;
          state.isLoading = false;
        }
      )
      .addCase(fetchTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch tokens";
      })
  },
});

export const {
  setSearchParams,
  clearSearchParams,
  setFilteredTokens,
  clearError,
} = tokenSlice.actions;

export default tokenSlice.reducer;
