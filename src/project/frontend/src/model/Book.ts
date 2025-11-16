export interface Book {
  /** 图书id */
  id?: number
  /** 图书名称 */
  name?: string
  /** 学段 */
  stage_id?: number
  /** 学科 */
  subject_id?: number
  /** 年级 */
  grade_id?: number
  /** 文件名 */
  file_key?: string
  /** 创建时间 */
  create_at?: number
  /** 创建人 */
  create_by?: number
  /** 更新时间 */
  update_at?: number
  /** 更新人 */
  update_by?: number
}

export interface BookFeedback {
  /** 图书反馈id */
  id?: number
  /** 用户昵称 */
  nick_name?: string
  /** 用户手机号 */
  mobile?: string
  /** 反馈时间 */
  create_at?: number
}
