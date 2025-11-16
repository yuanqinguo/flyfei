import HttpClient, { RequestOptions } from '@/service/request/HttpClient'
import AxiosHttpClient from '@/service/request/axios/AxiosHttpClient'

export const BASE_URL = '/api'

export type RequestClientOptions = Partial<RequestOptions>

export default class RequestClient {
  /**
   * 业务URL，如果某系列请求都是以某个URL开头，可使用此URL
   */
  businessUrl: string
  httpClient: HttpClient

  constructor(businessUrl = '', httpClient: HttpClient = AxiosHttpClient) {
    if (businessUrl.endsWith('/')) {
      businessUrl = businessUrl.substr(0, businessUrl.length - 1)
    }
    this.businessUrl = businessUrl
    this.httpClient = httpClient
  }

  /**
   * 如果传入的URL以 / 开头，直接使用此URL作为请求路径
   * 否则将使用基础URL拼接业务URL再加上传入的URL
   * @param url
   */
  buildRequestUrl(url: string) {
    if (url.startsWith('/')) {
      return url
    } else {
      if (this.businessUrl.startsWith('/')) {
        return `${this.businessUrl}/${url}`
      }
      return `${BASE_URL}/${this.businessUrl || ''}/${url}`
    }
  }

  async post<T = any>(url: string, data?: any, options?: RequestClientOptions) {
    return this.httpClient.doRequest<T>({
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      url: this.buildRequestUrl(url),
      data
    })
  }
  async postForm<T = any>(url: string, data?: any, options?: RequestClientOptions) {
    return this.httpClient.doRequest<T>({
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: this.buildRequestUrl(url),
      data
    })
  }
  async get<T = any>(url: string, data?: any, options?: RequestClientOptions) {
    return this.httpClient.doRequest<T>({
      ...options,
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      url: this.buildRequestUrl(url),
      data
    })
  }
  async put<T = any>(url: string, data?: any, options?: RequestClientOptions) {
    return this.httpClient.doRequest<T>({
      ...options,
      method: 'PUT',
      url: this.buildRequestUrl(url),
      data
    })
  }
  async delete<T = any>(url: string, data?: any, options?: RequestClientOptions) {
    return this.httpClient.doRequest<T>({
      ...options,
      method: 'DELETE',
      url: this.buildRequestUrl(url),
      data
    })
  }
}
