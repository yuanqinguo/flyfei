import RequestClient from './request/RequestClient'
import { PageResult, PageParam } from '@/model/dto/Page'
import Role from '@/model/Role'

const client = new RequestClient('admin/v1/role')

export type AuditRequestParam = {
  /**
   * 数据权限配置
   */
  audits?: {
    /**
     * 学段ID
     */
    stage_id?: number
    /**
     * 科目id列表
     */
    subjects?: number[]
  }[]
  /**
   * 角色ID
   */
  role_id: number
}

export default {
  /** 添加角色 */
  create(param: {
    /**
     * 角色描述
     */
    desc?: string
    /**
     * 角色名
     */
    name: string
  }) {
    return client.post<{ id: number }>('create', param)
  },
  /** 更新角色 */
  update(param: {
    desc?: string
    name?: string
    /**
     * 状态，1-启用 -1-禁用
     */
    status?: number
    [key: string]: any
  }) {
    return client.post('update', param)
  },
  /** 角色列表 */
  list(
    param: {
      /**
       * 名称关键字搜索
       */
      name_kw?: string
      /**
       * 状态过滤 1-正常  -1-禁用
       */
      status?: number
    } & PageParam
  ) {
    return client.get<PageResult<Role>>('list', param)
  },
  /** 设置角色权限 */
  permSets(param: {
    /**
     * 权限id列表
     */
    perm_ids: number[]
    /**
     * 角色id
     */
    role_id: number
  }) {
    return client.post('perm/sets', param)
  },
  /** 设置角色试题审核范围 */
  auditSetDataPerm(param: AuditRequestParam) {
    return client.post('audit/set_data_perm', param)
  }
}
