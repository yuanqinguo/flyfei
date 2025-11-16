import Question from './Question'

/** 题库类别 */
export default interface BankCategory {
  /** 封面 */
  cover_img_url?: string
  create_at?: number
  create_by?: number
  create_name?: string
  /** 描述 */
  desc?: string
  /** 封面url */
  id?: number
  category_id?: number
  /** 列表显示图片 */
  list_img_url?: string
  /** 名称 */
  name?: string
  /** 学段 */
  stage_id?: number
  /** 学科 */
  subject_id?: number
  /** 是否支持导出 1 是  0 否 */
  export_type?: number
  /** 是否推荐 -1 是  1 否 */
  is_recommend?: number
  update_at?: number
  update_by?: number
  /** 试题数量 */
  count?: number
  update_name?: string
}
export interface BankCategoryTreeNode {
  desc?: string
  id: number
  name: string
  parent_id?: number
  sort?: number
  level?: number
  [key: string]: any
}

export interface BankCategoryQuestion {
  /**
   * id
   */
  id: number
  /**
   * 添加人
   */
  add_by: number
  /**
   * 添加人名
   */
  add_name: string
  /**
   * 题库类别ID
   */
  bank_category_id: number
  /**
   * 添加时间
   */
  create_at: number
  /**
   * 试题ID-全局唯一
   */
  ques_id?: number
  /**
   * 参考：/api/content/admin/v1/question/public/info_list返回
   */
  ques_info: Question
  /**
   * 所在节点ID
   */
  tree_id: number
  sort: number
}
