export default interface Question {
  /**
   * 答案列表
   */
  answer: string
  /**
   * 关联章节id
   */
  chapters: number[]
  /**
   * 市ID
   */
  city_id: number
  /**
   * 难易度
   */
  difficulty_level: number
  /**
   * 区ID
   */
  distrct_id: number
  /**
   * 考场快解
   */
  question_fast_analysis: ErrorPointAnalysis[]
  /**
   * 粗心坑
   */
  question_careless_pit: ErrorPointAnalysis[]
  /**
   * 方法题型
   */
  question_method: ErrorPointAnalysis[]
  /**
   * 思路分析
   */
  question_idea: ErrorPointAnalysis[]
  /**
   * 知识延伸
   */
  question_knowledge_expand: ErrorPointAnalysis[]
  /**
   * 知识分析
   */
  knowledge_analysis: KnowledgeAnalysis[]
  /**
   * 翻译
   */
  question_translation: KnowledgeAnalysis[]
  /**
   * 关联知识点id
   */
  knowledge_list: number[]
  /**
   * 关联标签id
   */
  labels: number[]
  /**
   * 选项-选择题必填
   */
  options?: Option[]
  /**
   * 来源ID
   */
  origin_id: number
  /**
   * 来源名称
   */
  origin_name: string
  /**
   * 省ID
   */
  province_id: number
  /**
   * 题型
   */
  ques_type: number
  /**
   * 解析
   */
  question_analysis: QuestionAnalysis[]
  /**
   * 正确选项
   */
  right_choice: string[]
  /**
   * 学段ID
   */
  stage_id: number
  /**
   * 题干
   */
  stem: string
  /**
   * 学科ID
   */
  subject_id: number
  /**
   * 使用年级id
   */
  use_grades: number[]
  /**
   * 年份
   */
  vintage: number
  /**
   * 审核阶段: 1,2,3 对应一审，二审，三审
   */
  audit_stage?: number
  /*
   *审核状态: 1创建状态 2审核中 3通过 4拒绝驳回
   */
  audit_status?: number
  /*
   *更新人
   */
  update_name?: number
  /** 试题结构 */
  basic_ques_type?: number
  /** 答案列表，用于小题答案 */
  answer_list?: {
    /** 答案 */
    answer: string
    /** 选项序号 */
    index: number
  }[]
  /** 子题列表 */
  sub_list?: SubItem[]
  /** 是否是组合题 */
  is_group?: number
  /**
   * 引用的图片ID
   */
  image_ids?: number[]
  /**
   * 引用的视频ID
   */
  video_ids?: number[]
  /**
   * 选项布局信息
   */
  layout_info?: string
  /** 填空数量 */
  blank_count?: number
  /** 题目ID */
  ques_id: number

  [property: string]: any
}

export interface SubItem {
  answer?: string
  basic_ques_type?: number
  options?: Option[]
  right_choice?: string[]
  stem?: string
  layout_info?: string
  [property: string]: any
}

export interface ErrorPointAnalysis {
  /**
   * 内容
   */
  content?: string
  /**
   * 分析ID-前端生成uuid
   */
  id?: string
  /**
   * 视频key
   */
  video?: string
  [property: string]: any
}

export interface KnowledgeAnalysis {
  /**
   * 分析内容
   */
  content?: string
  /**
   * 知识分析ID-前端生成uuid
   */
  id?: string

  /**创建时间*/
  create_at?: number
  /**创建人*/
  create_by?: number
  /**创建人名称*/
  create_name?: string
  /**节点id*/
  node_id: number
  /**节点名称*/
  node_name: string
  /**更新时间*/
  update_at?: number
  /**更新人*/
  update_by?: number
  /**更新人名称*/
  update_name?: string
  /**视频id*/
  video_id?: number
  /**视频key*/
  video_key?: string
  /**视频url*/
  video_url?: string

  [property: string]: any
}

export interface Option {
  /**
   * 选项内容
   */
  content?: string
  /**
   * 选项唯一标识： A,B,C,D
   */
  name?: string
  [property: string]: any
}

export interface QuestionAnalysis {
  /**
   * 解析内容
   */
  content?: string
  /**
   * 解析ID-前端生成uuid
   */
  id?: string
  /**
   * 视频key
   */
  video?: string
  [property: string]: any
}

export interface auditContent {
  content: string
  id: string
  type: string
}

export interface AuditInfo {
  audit_contents: auditContent[]
  audit_by?: number
  audit_at?: number
  /**
   * 审核人
   */
  audit_name?: string
  audit_snap?: Question
  /**
   * 审核阶段1,2,3
   */
  audit_stage?: number
  /**
   * 审核结果状态
   */
  audit_status?: number
  ques_id?: number
  remark?: {
    desc: string
    file_urls: string[]
  }
}
