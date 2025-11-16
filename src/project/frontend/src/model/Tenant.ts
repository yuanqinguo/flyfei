export interface TenantListParams {
  city_id?: number
  /**
   * 注册时间范围，开始时间
   */
  end_time?: number
  limit?: number
  member_scale?: number
  name_kw?: string
  page?: number
  province_id?: number
  region_id?: number
  /**
   * 注册时间范围，开始时间
   */
  start_time?: number
  /**
   * -1：禁用  1：启用   0：待初始化（理论上不存在，除非创建后初始化失败了） 99：待注销  100：已注销
   */
  status?: number
  student_scale?: number
  sub_edition?: string
}
export interface TenantItem {
  address?: string
  city_id?: number
  create_at?: number
  id?: number
  logo_url?: string
  member_scale?: number
  name?: string
  provice_id?: number
  region_id?: number
  short_name?: string
  status?: number
  student_scale?: number
  tenant_no?: number
  /**
   * 订阅版本
   * basic：基础版
   * enterprise：企业版
   */
  sub_edition?: string
  [property: string]: any
}
