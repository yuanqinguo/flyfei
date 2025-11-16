
import isNil from 'lodash/isNil'


import { CourseGoodsSaleType, DurationType, GoodsType } from './Goods'
import {
  DeliveryStatus,
  OrderCancelType,
  OrderDateType,
  OrderRefundStatus,
  OrderStatus,
  TradeType
} from './Order'


type MapType = Record<any, string>

type MapToOptionsOption = { labelKey?: string; valueKey?: string }

/**
 * map 转换成选项列表
 */
export const mapToOptions = <T extends Record<string, any>>(map: MapType, option?: MapToOptionsOption) => {
  const { labelKey = 'label', valueKey = 'value' } = option || {}
  return Object.entries(map).map(([key, value]) => {
    const numericValue = Number(key)
    const realValue = isNaN(numericValue) ? key : numericValue
    return {
      [valueKey]: isNil(realValue) ? key : realValue,
      [labelKey]: value
    }
  }) as T[]
}

const EnumMapData = {
  sex: {
    3: '未知',
    1: '男',
    2: '女'
  },
  enableStatus: {
    1: '启用',
    '-1': '禁用'
  },
  showStatus: {
    1: '显示',
    '-1': '不显示'
  },
  listingStatus: {
    1: '上架',
    '-1': '下架'
  },
  YesOrNo: {
    1: '是',
    '-1': '否'
  },
  durationType: {
    [DurationType.Month]: '1个月',
    [DurationType.Quarter]: '3个月',
    [DurationType.HalfYear]: '6个月',
    [DurationType.Year]: '1年',
    [DurationType.TwoYears]: '2年',
    [DurationType.ThreeYears]: '3年',
    [DurationType.SevenDays]: '7天'
  },
  orderStatus: {
    [OrderStatus.All]: '全部',
    [OrderStatus.Pending]: '待支付',
    [OrderStatus.Paid]: '已支付',
    [OrderStatus.Canceled]: '已取消',
    [OrderStatus.Refunded]: '已退款',
    [OrderStatus.Shipped]: '已发货',
    [OrderStatus.Signed]: '已签收',
    [OrderStatus.Received]: '已收货',
    [OrderStatus.Recycled]: '已回收',
    [OrderStatus.Error]: '异常'
  },
  
  tradeType: {
    [TradeType.Jsapi]: '公众号支付、小程序支付',
    [TradeType.Native]: 'Native支付',
    [TradeType.App]: 'APP支付',
    [TradeType.CodePay]: '付款码支付',
    [TradeType.WebH5]: 'H5支付',
    [TradeType.Face]: '刷脸支付',
    [TradeType.Other]: '其他支付'
  },
  
  orderCancelType: {
    [OrderCancelType.User]: '用户取消',
    [OrderCancelType.System]: '客服取消',
    [OrderCancelType.Timeout]: '超时取消'
  },
  orderRefundStatus: {
    [OrderRefundStatus.None]: '未退款',
    [OrderRefundStatus.Pending]: '退款中',
    [OrderRefundStatus.Success]: '退款成功',
    [OrderRefundStatus.Failed]: '退款失败'
  },
  orderDateType: {
    [OrderDateType.Day]: '日',
    [OrderDateType.Month]: '月',
    [OrderDateType.Quarter]: '季度',
    [OrderDateType.Year]: '年'
  },
 
  deliveryStatus: {
    [DeliveryStatus.WaitingCreated]: '待创建物流单',
    [DeliveryStatus.Created]: '已创建物流单',
    [DeliveryStatus.Shipped]: '已发货',
    [DeliveryStatus.Received]: '已收货'
  },
  
}

const EnumMap: { [K in keyof typeof EnumMapData]: MapType } = EnumMapData

export default EnumMap
