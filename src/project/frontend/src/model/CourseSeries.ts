export default interface CourseSeries {
  create_by?: number
  create_name?: string
  create_time?: number
  desc?: string
  grade_id?: number
  id?: number
  is_top?: number
  name?: string
  show_terminals?: string[]
  stage_id?: number
  status?: number
  subject_id?: number
  udpate_by?: number
  update_name?: string
  update_time?: number
  [property: string]: any
}

export interface UpdateParams {
  desc: string
  grade_id: number
  /**
   * 课程系列ID
   */
  id: number
  /**
   * 置顶 1  -1
   */
  is_top: number
  name: string
  show_terminals: string[]
  stage_id: number
  /**
   * 状态值 1   -1
   */
  status: number
  subject_id: number
  [property: string]: any
}
