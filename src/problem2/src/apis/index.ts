import { TOKEN_API_URL } from "@/constants";
import type { RawToken } from "@/types";

export async function getTokens(): Promise<RawToken[]> {
  try {
    const response = await fetch(TOKEN_API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch tokens", error);
    return [];
  }
}