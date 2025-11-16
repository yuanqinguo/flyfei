/** 题库模块 */
export default interface BankModule {
  create_at?: number
  create_by?: number
  create_name?: string
  /** 题库模块描述 */
  desc?: string
  /** 题库模块id */
  id?: number
  /** 题库模块名字 */
  name?: string
  /**是否置顶 */
  is_top?: number
  /** 学段id */
  stage_id?: number
  /** 学科id */
  subject_id?: number
  /** 题库模块显示终端 */
  show_terminals?: string[]
  show_subjects?: StageSubjects[]
  /** 题库模块状态 */
  status?: number
  update_at?: number
  update_by?: number
  update_name?: string
}
export interface StageSubjects {
  stage_id: number
  subject_ids: number[]
}
