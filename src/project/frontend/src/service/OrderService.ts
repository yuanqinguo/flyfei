import { OrderItem, OrderListParams } from '@/model/Order'
import RequestClient from './request/RequestClient'
import { PageParam, PageResult } from '@/model/dto/Page'
import {
  OrderRecycleParams,
  OrderRefundParams,
} from '@/views/order-list/types'

const client = new RequestClient('order/admin/v1/order')

export default {
  /** 订单列表 */
  list(param?: PageParam & OrderListParams) {
    return client.post<PageResult<OrderItem>>('list', param)
  },
  /** 创建订单 */
  create(param: Record<string, any>) {
    return client.post('create', param)
  },
  /** 创建课程订单 */
  courseCreate(param: Record<string, any>) {
    return client.post('course/create', param)
  },
  /** 更新订单 */
  update(param: Record<string, any>) {
    return client.post('update', param)
  },
  /** 订单详情 */
  info(param: { order_id?: number } | { order_no?: string }) {
    return client.get('info', param)
  },
  /** 退款 */
  refund(param: OrderRefundParams) {
    return client.post('refund', param)
  },
  /** 回收订单 */
  recycle(param: OrderRecycleParams) {
    return client.post('recycle', param)
  },


}
