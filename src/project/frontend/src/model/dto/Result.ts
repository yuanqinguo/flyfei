export enum ResultCode {
  /** 前端主动异常 */
  FAILED = -1,
  /** 成功的请求 */
  SUCCESS = 200,
  NO_AUTHORIZATION = 401,
  NO_PERMISSION = 403
}

export interface Result<T> {
  /** 错误消息 */
  msg?: string
  /** 返回码: 0 成功，其他失败  */
  code: ResultCode | number
  /** 返回数据 */
  data?: T
}

/**
 * 判断请求结果是否成功
 * @param result
 */
export function isResultSuccess<T>(result?: Result<T>) {
  return result?.code === ResultCode.SUCCESS
}

/**
 * 判断一个对象是否是result对象
 * @param r 需要判断的对象
 */
export function isResult<T>(r?: any): r is Result<T> {
  if (r) {
    if (r.code >= 0) {
      return true
    }
  }
  return false
}
