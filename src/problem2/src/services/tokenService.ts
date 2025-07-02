import { reqGET } from "@/shared/api/api-clients";

class TokenService {
  async getTokenData() {
    const rawData = await reqGET("prices.json");
    return rawData;
  }
}

const tokenService = new TokenService();
export default tokenService;
