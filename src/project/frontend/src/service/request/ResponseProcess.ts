import { Result, isResult, isResultSuccess, ResultCode } from '@/model/dto/Result'
import { RequestOptions } from '@/service/request/HttpClient'
import store from '@/store'
import { sessionInit } from '@/store/actions'
import { message } from 'antd'

type ResponseType = { status: number; data: Result<any>; statusText?: string }
export interface ResponseProcess {
  processResult<T>(response: ResponseType, request: RequestOptions): Promise<T>
}

const HTTP_STATUS = {
  success: 200
}

const messageError = (errorMessage: string) => {
  if (errorMessage) {
    message.error(errorMessage)
  }
}

const logout = () => {
  message.destroy()
  messageError('登录状态失效，请重新登录')
  if (!import.meta.env.VITE_NEVER_SIGN_OUT) {
    store.dispatch(sessionInit({ loginToken: '', isInit: false, initPromise: null }))
  }
}

async function processResultCodeError(result: Result<any>, errorMessage: string) {
  switch (result.code) {
    case ResultCode.NO_AUTHORIZATION:
      logout()
      break
    case ResultCode.NO_PERMISSION:
      messageError('暂无权限')
      break
    default:
      messageError(errorMessage)
      break
  }
}
async function processHttpStatusError(status: number, errorMessage: string, options: RequestOptions) {
  switch (status) {
    case 404:
      messageError('RequestNotExists:' + options.url)
      break
    case 401:
      logout()
      break
    default:
      messageError(errorMessage)
      break
  }
}

async function processError(defaultOptions: RequestOptions, response: any): Promise<any> {
  const errorMessage = response.msg || response.statusText
  const errMsg = defaultOptions.showErrorMessage === false ? '' : errorMessage || '系统繁忙'
  if (defaultOptions.useDefaultErrorProcess !== false) {
    if (isResult(response)) {
      processResultCodeError(response, errMsg)
    } else if (errMsg) {
      processHttpStatusError(response.status, errMsg, defaultOptions)
    }
  }
  throw { ...response, message: errMsg }
}

const ResponseProcessImpl: ResponseProcess = {
  processResult(response: ResponseType, request: RequestOptions) {
    const { data, status } = response
    if (status === HTTP_STATUS.success) {
      const resultData = data
      if (isResultSuccess(resultData)) {
        if (request.transform) {
          return request.transform(data.data)
        }
        return Promise.resolve(resultData.data)
      } else {
        return processError(request, resultData || response)
      }
    }
    return processError(request, response)
  }
}

export default ResponseProcessImpl
