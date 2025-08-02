import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// TODO: we should apply Proactive refresh token on every timeout

const api: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_INTERVIEW_API_URL}`,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("Server responded with an error:", error.response);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }
    return Promise.reject(error);
  }
);

const httpClient = {
  get: (url: string, config?: AxiosRequestConfig) => api.get(url, config),
  post: (url: string, data, config?: AxiosRequestConfig) =>
    api.post(url, data, config),
  put: (url: string, data, config?: AxiosRequestConfig) =>
    api.put(url, data, config),
  patch: (url: string, data, config?: AxiosRequestConfig) =>
    api.patch(url, data, config),
  delete: (url: string, config?: AxiosRequestConfig) => api.delete(url, config),
};

export default httpClient;
