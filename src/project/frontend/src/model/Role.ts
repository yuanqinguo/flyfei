export default interface Role {
  id: number
  create_at?: number
  create_by_name?: string
  desc?: string
  name: string
  /**
   * 试卷审核配置
   */
  papers_audits?: PapersAudit[]
  perms?: { perm_id: number; name: string }[]
  /**
   * 试题审核配置
   */
  data_perms?: DataPerms[]
  role_id?: number
  /**
   * 1-正常  -1-禁用
   */
  status?: number
  update_at?: number
  update_by_name?: string
}

export interface DataPerms {
  /**
   * 学段id
   */
  stage_id?: number
  /**
   * 科目id列表
   */
  subjects?: number[]
}

export interface PapersAudit {
  /**
   * 学段id
   */
  stage_id?: number
  /**
   * 科目id列表
   */
  subjects?: number[]
}
