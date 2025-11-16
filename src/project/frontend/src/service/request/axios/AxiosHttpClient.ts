import HttpClient, { RequestOptions } from '@/service/request/HttpClient'
import axios, { AxiosRequestConfig } from 'axios'
import ResponseProcess from '@/service/request/ResponseProcess'
import store from '@/store'

function checkValueEmpty(value: any) {
  return value !== null && value !== undefined && value !== ''
}

function parseData(data?: any) {
  if (data && typeof data === 'object') {
    const params = new URLSearchParams()
    Object.keys(data).forEach(key => {
      let value = data[key]
      if (checkValueEmpty(value)) {
        if (Array.isArray(value) && value.filter(checkValueEmpty).length === 0) {
          return
        }
        if (typeof value === 'string') {
          value = value.trim()
          if (!value) {
            return
          }
        }
        params.append(key, value)
      }
    })
    return params
  }
  return data
}

const httpClient = axios.create()
const AxiosHttpClient: HttpClient = {
  async doRequest(request: RequestOptions) {
    function transformRequest(param: any) {
      if (request.headers?.['Content-Type'] !== 'application/json') {
        return parseData(param)
      }
      return JSON.stringify(param)
    }

    try {
      const options: AxiosRequestConfig = {
        ...request,
        params: request.method.toUpperCase() === 'GET' ? request.data : {},
        headers: {
          ...request.headers,
          token: store.getState().session.loginToken
        },
        data: transformRequest(request.data)
      }
      const result = await httpClient.request(options)
      return ResponseProcess.processResult(result, request)
    } catch (e) {
      return ResponseProcess.processResult((e as any).response, request)
    }
  }
}

export default AxiosHttpClient
