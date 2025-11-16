export default interface Stage {
  create_at: number
  create_by_name: string
  /**
   * 学段描述
   */
  desc: string
  /**
   * 学段ID
   */
  id: number
  /**
   * 学段名
   */
  name: string
  /**
   * 排序值
   */
  sort: number
  /**
   * 是否启用性质
   */
  enable_nature_type: number
}
