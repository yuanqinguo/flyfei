export default interface TenantPerm {
  /**
   * 接口路径
   */
  api_path?: string
  code: string
  desc: string
  name: string
  /**
   * 菜单路径
   */
  page_path: string
  parent_id: number
  /**
   * 权限ID主键
   */
  id: number
  sort: number
  /**
   * 1-菜单  2-功能操作
   */
  type: number
  [property: string]: any
}
