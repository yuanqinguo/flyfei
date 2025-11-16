export interface ChapterDetail {
  desc?: string
  id: number
  name?: string
  parent_id?: number
  sort?: number
  level?: number
  [key: string]: any
}

export default interface Chapter {
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
   * 册别ID
   */
  edition_type_id?: number
  /**
   * 年级ID
   */
  grade_id?: number
  id: number
  /**
   * 章节名
   */
  name?: string
  /**
   * 学段ID
   */
  stage_id?: number
  /**
   * 学科ID
   */
  subject_id?: number
  /**
   * 章节状态
   */
  status?: number
  /**
   * 更新时间
   */
  update_at?: number
  /**
   * 更新人
   */
  update_by?: number
  [key: string]: any
}
