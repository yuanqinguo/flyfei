export default interface BankPaper {
  /**
   * 试卷数量
   */
  count?: number
  create_at?: number
  create_by?: number
  create_name?: string
  desc?: string
  id?: number
  name?: string
  show_subjects?: number[]
  show_terminals?: string[]
  sort?: number
  status?: number
  update_at?: number
  update_by?: number
  update_name?: string
  [property: string]: any
}
