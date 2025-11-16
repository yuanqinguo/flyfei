export interface CustomLatexListParams {
  /**
   * 一页数量
   */
  limit?: number
  /**
   * 页码
   */
  page?: number
  /**
   * 名称搜索
   */
  name_kw?: string
  /**
   * 原指令搜索
   */
  origin_content_kw?: string
  /**
   * 指令类型
   */
  type?: string
  /**
   * 创建人
   */
  user_id?: number
  /** 是否默认查全部 */
  default_query_all?: 1
}

export default interface CustomLatex {
  /**
   * 指令名称，原指令，替换指令，指令库类型
   */
  id?: number
  name?: string
  desc?: string
  dest_content?: string
  origin_content?: string
  // 指令库类型： svg：兼容指令库 replace:录入替换库
  type?: string
  /**
   * 1: 替换全部 2： 替换正文 3： 替换公式
   */
  replace_type?: number
  /**
   * 创建人，创建时间
   */
  create_at?: number
  create_by?: number
  create_name?: string
  /**
   * 更新人，更新时间
   */
  update_at?: number
  update_by?: number
  update_name?: string
}
