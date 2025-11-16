export interface CustomLabel {
  /** 标签说明 */
  desc?: string
  /** 标签id */
  id?: number
  /** 标签名称 */
  name?: string
  /** 父标签id */
  parent_id?: number
  /** 父标签名称 */
  parent_name?: string
  /** 标签排序 */
  sort?: number
  /** 标签状态 */
  status?: number
  /** 使用学段学科 */
  stage_subjects?: StageSubject[]
  /** 层级 */
  level?: number
  [key: string]: any
}

export interface StageSubject {
  /**学段id */
  stage_id: number
  /**学段名称 */
  stage_name?: string
  /**学科列表 */
  subjects: Subject[]
}

export interface Subject {
  /**学科id */
  subject_id: number
  /**学科名称 */
  subject_name: string
}

export interface CustomLabelForm extends CustomLabel {
  /**
   * 描述
   */
  desc?: string
  /**
   * 自定义标签名
   */
  name?: string
  /**
   * 父节点ID
   */
  parent_id?: number
  /**
   * 学段IDs
   */
  stage_ids?: number[]
  /**
   * 适用学科ids
   */
  subject_ids?: number[]
}
