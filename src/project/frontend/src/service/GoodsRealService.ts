import { PageParam, PageResult } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import { RealGoods } from '@/model/Goods'

const client = new RequestClient('order/admin/v1/goods/real')

export interface GoodsGiftUpdateParam {
  cover_key: string
  desc: string
  detail: string
  id: number
  name: string
  price: number
  [property: string]: any
}

export default {
  /** 列表 */
  list(param?: { id?: string; name_kw?: string } & PageParam) {
    return client.get<PageResult<RealGoods>>('list', param)
  },
  create(param: GoodsGiftUpdateParam) {
    return client.post('create', param)
  },
  update(param: Partial<GoodsGiftUpdateParam>) {
    return client.post('update', param)
  },
  delete(param: { ids: number[] }) {
    return client.post('delete', param)
  },
  updateStatus(param: { id: number; status: number }) {
    return client.post('update_status', param)
  }
}
