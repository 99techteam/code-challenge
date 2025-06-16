import axios, {
  type AxiosError,
  type AxiosResponse,
  HttpStatusCode,
} from "axios";

const axiosConfig = axios.create({
  baseURL: `https://interview.switcheo.com`,
  headers: {
    "Content-Type": "application/json",
  },
});
// Add a request interceptor
axiosConfig.interceptors.request.use(
  function (config) {
    // Access token include here
    return config;
  },
  function (error: unknown) {
    // Do something with request error
    return Promise.reject(error);
  }
);
// Add a response interceptor
axiosConfig.interceptors.response.use(
  function (response: AxiosResponse) {
    return response.data;
  },
  async function (error: AxiosError) {
    if (!error.response) {
      return Promise.reject(error);
    }
    switch (error.response.status) {
      //handle refresh token here
      case HttpStatusCode.Forbidden:
        break;
      case HttpStatusCode.NotFound:
        break;
      case HttpStatusCode.Unauthorized:
        break;
      case HttpStatusCode.InternalServerError:
        break;
      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default axiosConfig;
