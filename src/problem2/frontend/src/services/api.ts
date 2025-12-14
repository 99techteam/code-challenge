import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    walletAddress: string;
  };
}

export interface TokenBalance {
  symbol: string;
  amount: number;
}

export interface BalanceResponse {
  username: string;
  email: string;
  walletAddress: string;
  tokenBalances: TokenBalance[];
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  walletAddress: string;
  tokenBalances: TokenBalance[];
}

export interface TransferData {
  recipientWalletAddress: string;
  tokenSymbol: string;
  amount: number;
}

export interface TransferResponse {
  message: string;
  transfer: {
    from: string;
    to: string;
    token: string;
    amount: number;
  };
  newBalance: TokenBalance[];
}

export interface SwapData {
  fromToken: string;
  toToken: string;
  amount: number;
}

export interface SwapResponse {
  message: string;
  swap: {
    from: { symbol: string; amount: number };
    to: { symbol: string; amount: number };
  };
  newBalances: TokenBalance[];
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getBalances: async (): Promise<BalanceResponse> => {
    const response = await api.get('/auth/balances');
    return response.data;
  },

  swap: async (data: SwapData): Promise<SwapResponse> => {
    const response = await api.post('/auth/swap', data);
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  transfer: async (data: TransferData): Promise<TransferResponse> => {
    const response = await api.post('/auth/transfer', data);
    return response.data;
  },
};

export default api;
