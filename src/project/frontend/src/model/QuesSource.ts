export interface QuesSourceItem {
  create_at: number
  create_by: number
  create_name: string
  desc?: string
  id?: number
  name?: string
  status: number
  update_at: number
  update_by: number
  update_name: string
}

export interface QuesSource {
  id?: number
  /** 1启用 -1禁用 */
  status: number
  /** 试题来源说明 */
  desc?: string
  /** 来源名称 */
  name?: string
}
