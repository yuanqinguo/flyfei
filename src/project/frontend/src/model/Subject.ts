export default interface Subject {
  create_at: number
  create_by_name: string
  /**
   * 创建人
   */
  create_by?: string
  /**
   * 学科描述
   */
  desc: string
  /**
   * 学科ID
   */
  id: number
  /**
   * 学段 ID
   */
  stage_id: number
  /**
   * 学科名
   */
  name: string
  /**
   * 排序值
   */
  sort: number
  /**
   * 状态
   */
  status?: number
  /**
   * 更新时间
   */
  update_at: number
  update_by_name: string
  director_name: string
  director_id: number
  score_list?: any[]
  director_info_list?: any[]
}
