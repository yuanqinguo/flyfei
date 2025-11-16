import Question from './Question'

export default interface Feedback {
  audit_file_url?: string
  audit_remark?: string
  audit_type?: number
  create_at?: number
  file_url?: string
  ques_id?: number
  status?: number
  update_at?: number
  update_by?: number
  update_name?: string
  user_id?: number
  id?: number
  user_name?: string
  ques_info?: Question
}

export interface WrongItem {
  audit_file_url?: string
  audit_remark?: string
  audit_type?: number
  create_at?: number
  file_url?: string
  /**
   * 对象id，当obj_type=1时，该字段为空字符串
   */
  obj_id: string
  /**
   * 对象类型 1：题干 2：答案 3：解析
   */
  obj_type: number
  ques_id?: number
  status?: number
  update_at?: number
  update_by?: number
  update_name?: string
  user_id?: number
  user_name?: string
  /**
   * 错误描述
   */
  wrong_type?: number
  wrong_desc: string
  [property: string]: any
}
