import axios, { AxiosError, HttpStatusCode, type AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import {
  getTokenFromLocalStorage,
  removeAuthFromLocalStorage,
} from 'src/utils/auth'
import { API_URL } from './runtime'

class Http {
  public instance: AxiosInstance
  private accessToken: string
  private REQUEST_TIMEOUT = 10000

  constructor() {
    this.accessToken = getTokenFromLocalStorage()
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: this.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const that = this
    this.instance.interceptors.request.use(
      function (config) {
        if (that.accessToken && config.headers) {
          config.headers.authorization = that.accessToken
          return config
        }
        return config
      },
      function (error) {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      function (response) {
        return response
      },
      function (error: AxiosError) {
        console.log(error)
        if (error.response?.status === HttpStatusCode.Unauthorized) {
          removeAuthFromLocalStorage()
        }
        if (error.response?.status !== HttpStatusCode.UnprocessableEntity) {
          const data: any | undefined = error.response?.data
          const message = data.message || error.message
          toast.error(message)
        }

        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
