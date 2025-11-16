export default interface EditionType {
  /**
   * 创建时间
   */
  create_at?: number
  /**
   * 创建人
   */
  create_by?: number
  /**
   * 版本ID
   */
  edition_id?: number
  /**
   * 年级ID
   */
  grade_id?: number
  /**
   * 教材册别ID
   */
  id?: number
  /**
   * 册别名
   */
  name?: string
  /**
   * 性质
   */
  nature_type?: number
  sort?: number
  /**
   * 学段ID
   */
  stage_id?: number
  /**
   * 状态
   */
  status?: number
  /**
   * 学科ID
   */
  subject_id?: number
  /**
   * 更新时间
   */
  update_at?: number
  /**
   * 更新人
   */
  update_by?: number
}
