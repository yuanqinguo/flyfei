import { PageParam, PageResult } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import { CourseGoods, RealGoods } from '@/model/Goods'

const client = new RequestClient('order/admin/v1/goods/course')

export default {
  /** 创建商品 */
  create(param: Record<string, any>) {
    return client.post('create', param)
  },
  /** 更新商品 */
  update(param: Record<string, any>) {
    return client.post('update', param)
  },
  /** 更新商品状态 （上架、下架）*/
  updateStatus(param: Record<string, any>) {
    return client.post('update_status', param)
  },
  /** 获取商品详情 */
  info(param: Record<string, any>) {
    return client.get<CourseGoods>('info', param)
  },
  /** 获取商品详情 */
  infos(param: { ids: number[] }) {
    return client.get<CourseGoods[]>('infos', param)
  },
  /** 商品列表 */
  list(param?: PageParam) {
    return client.get<PageResult<CourseGoods>>('list', param)
  },
  /** 获取虚拟商品的赠品列表 */
  listItems(param?: { id?: number } & PageParam) {
    return client.get<RealGoods[]>('list_items', param)
  },
  /** 更新虚拟商品的赠品列表 */
  updateItem(param: { id: number; nums: number }) {
    return client.post('update_item', param)
  },
  /** 创建虚拟商品的赠品列表 */
  createItems(param: { course_goods_id: number; item_type: number; item_ids: number[] }) {
    return client.post('create_items', param)
  },
  /** 移除虚拟商品的赠品列表 */
  removeItems(param: { ids: number[] }) {
    return client.post('remove_items', param)
  }
}
