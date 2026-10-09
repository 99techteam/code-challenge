import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  responseType: 'json',
  timeout: 15000,
})

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)

export default axiosClient
