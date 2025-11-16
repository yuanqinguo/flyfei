import RequestClient from './request/RequestClient'
import { Prepare, PrepareCatalog } from '@/model/Prepare'

const client = new RequestClient('content/admin/v1/prepare')

export default {
  /** 创建备课 */
  create(param: { stage_id: number; subject_id: number; name: string; desc: string }) {
    return client.post('create', param)
  },
  /** 更新备课 */
  update(param: { name?: string; desc?: string; id?: number }) {
    return client.post('update', param)
  },
  /** 删除备课 */
  delete(param: { id: number }) {
    return client.post('delete', param)
  },
  /** 备课列表 */
  list(param?: { stage_id?: number; subject_id?: number }) {
    return client.get<Prepare[]>('list', param)
  },
  /** 获取备课信息和目录节点 */
  catalogInfo(param: { id: number }) {
    return client.get<PrepareCatalog>('catalog/info', param)
  },
  /** 创建备课目录节点 */
  catalogCreate(param: { prepare_id?: number; name?: string; parent_id?: number; level?: number; sort?: never }) {
    return client.post('catalog/create', param)
  },
  /** 更新备课目录节点 */
  catalogUpdate(param: { id?: number; name?: string }) {
    return client.post('catalog/update', param)
  },
  /** 更新备课目录节点排序 */
  catalogUpdateSort(param: { id: number; sort: number }[]) {
    return client.post('catalog/update_sort', param)
  },
  /** 删除备课目录节点 */
  catalogDelete(param: { id: number }) {
    return client.post('catalog/delete', param)
  }
}
