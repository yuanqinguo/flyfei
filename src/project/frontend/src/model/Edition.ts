export interface EditionListParams {
  /**
   * 版本ID
   */
  edition_id?: number
  /**
   * 年级ID
   */
  grade_id?: number
  /**
   * 数量
   */
  limit?: number
  /**
   * 页码
   */
  page?: number
  /**
   * 学段ID
   */
  stage_id?: number
  /**
   * 学科ID
   */
  subject_id?: number
  /** 是否默认查全部 */
  default_query_all?: 1
}

export default interface Edition {
  create_at?: number
  create_by?: number
  /**
   * 描述
   */
  desc?: string
  id?: number
  /**
   * 版本名
   */
  name?: string
  sort?: number
  /**
   * 学段
   */
  stage_id?: number
  status?: number
  /**
   * 学科
   */
  subject_id?: number
  update_at?: number
  update_by?: number
}
