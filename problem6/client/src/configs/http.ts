import { VALUES_CONSTANT } from "@/constants";
import axios, { AxiosInstance } from "axios";

class Http {
  baseUrl: string;
  instance: AxiosInstance;

  constructor() {
    this.baseUrl = "http://localhost:9000/api";
    this.instance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
  }
}

export default new Http().instance;
