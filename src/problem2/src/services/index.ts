import TokenService from "./tokenService";

export const tokenService = TokenService.getInstance();

export type { PriceData, Token } from "./tokenService";
