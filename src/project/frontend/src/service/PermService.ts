import { PageParam, PageResult } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import Perm from '@/model/Perm'

const client = new RequestClient('admin/v1/perm')

export default {
  /** 添加权限 */
  create(param: Perm) {
    return client.post('create', param)
  },
  /** 更新权限 */
  update(param: { list: Perm[] }) {
    return client.post('update', param)
  },
  /** 更新权限状态 */
  updateStatus(param: { id: number; status: number }) {
    return client.post('update_status', param)
  },
  /** 列表 */
  list(param?: PageParam) {
    return client.get<PageResult<Perm>>('list', param)
  },
  /** 当前用户的权限 */
  myPerms() {
    return client.get<Perm[]>('my_perms')
  }
  /** 更新权限排序 */
  // updateSort(param: { param_ids: string[] }) {
  //   return client.post('update_sort', param)
  // }
}
