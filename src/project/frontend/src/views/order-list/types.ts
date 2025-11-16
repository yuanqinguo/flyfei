import { FastColumnProps, FastTableProps, TableAction } from '@/components/FastTable'
import { OrderItem, OrderListParams } from '@/model/Order'
import { OrderStatus } from '@/utils/constants/Order'

export interface VisibleColumn extends FastColumnProps<OrderItem> {
  visible?: (status?: OrderStatus) => boolean
}

export interface OrderListProps extends Partial<FastTableProps<OrderItem>> {
  status?: OrderStatus
  params?: OrderListParams
  isChannel?: boolean
  tableAction: React.MutableRefObject<TableAction | undefined>
  /** 当为 true 时，隐藏工具栏中的新增类操作按钮 */
  disableCreateActions?: boolean
  getExportColumns?: (columns: FastColumnProps<OrderItem>[]) => FastColumnProps<OrderItem>[]
}

export interface OrderRefundParams {
  order_id: number
  amount: number
  item_ids: number[]
  reason: string
}

export interface OrderRecycleParams {
  order_id: number
  recycle_reason: string
  recycle_key: string
}

export interface CancelGiftParams {
  cancel_reason: string
  order_id: number
  [property: string]: any
}

export interface OrderPriceChangeParams {
  /** 单位分 */
  discount_items: {
    item_id: number
    discount_amount: number
  }[]
  /** 交付的订单id列表*/
  order_id: number
  [property: string]: any
}

export interface OrderTransferParams {
  order_id: number
  to_user_id: number
  [property: string]: any
}

export interface OrderGapParams {
  amount: number
  /*** 补差图片 */
  gap_keys: string[]
  order_id: number
  /** 补差原因 */
  reason: string
}
