import { PageParam, PageResult } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import { RealGoods, SubjectGoods } from '@/model/Goods'

const client = new RequestClient('order/admin/v1/goods/subject')

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
  /** 商品列表 */
  list(param?: { vip_type?: number } & PageParam) {
    return client.get<PageResult<SubjectGoods>>('list', param)
  },
  /** 获取虚拟商品的赠品列表 */
  giftsList(param?: { id?: number } & PageParam) {
    return client.get<PageResult<RealGoods>>('gifts_list', param)
  },
  /** 更新虚拟商品的赠品列表 */
  updateGifts(param: { id: number; nums: number }) {
    return client.post('update_gifts', param)
  },
  /** 创建虚拟商品的赠品列表 */
  createGifts(param: { id: number; gift_goods: { goods_id: number; goods_type?: number; nums?: number }[] }) {
    return client.post('create_gifts', param)
  },
  /** 移除虚拟商品的赠品列表 */
  removeGifts(param: { ids: number[] }) {
    return client.post('remove_gifts', param)
  }
}
