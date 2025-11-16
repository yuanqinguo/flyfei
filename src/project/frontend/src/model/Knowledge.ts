import { KnowledgeContent } from './KnowledgeContent'

export interface KnowledgeDetail {
  desc?: string
  id: number
  name: string
  parent_id?: number
  sort?: number
  level?: number
  [key: string]: any
}

export default interface Knowledge {
  /**
   * 创建时间
   */
  create_at?: number
  /**
   * 创建人
   */
  create_by?: number
  id?: number
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
   * 状态
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
}

export interface KnowledgeContentData {
  content_type_id?: number
  content_type_name?: string
  content_list: {
    id?: number
    index?: number
    add_at?: number
    add_by?: number
    content_info: KnowledgeContent
  }[]
}
