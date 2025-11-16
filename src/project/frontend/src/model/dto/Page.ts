/** 分页返回结果数据 */
export interface PageResult<T> {
  /** 返回数据 */
  list: T[]
  /** 总数据条数 */
  total: number
  /** 当前页码数 */
  page: number
  /** 每页条目个数 */
  limit: number
  /** 不分页，查所有数据 */
  unlimited?: boolean
}

/** 分页查询参数 */
export interface PageParam {
  /** 当前页码 */
  page?: number
  /** 每页条数 */
  limit?: number
  /** 不分页，查所有数据 */
  unlimited?: boolean
  [key: string]: any
}
