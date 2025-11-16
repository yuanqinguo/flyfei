export enum OrderStatus {
  /** 全部 */
  All = 0,
  /** 待支付 */
  Pending = 1,
  /** 已支付 */
  Paid = 2,
  /** 已退款 */
  Refunded = 3,
  /** 已发货 */
  Shipped = 4,
  /** 已签收 */
  Signed = 5,
  /** 已收货 */
  Received = 6,
  /** 已取消 */
  Canceled = -1,
  /** 已回收 */
  Recycled = 99,
  /** 异常 */
  Error = 100
}



export enum TradeType {
  /** 公众号支付、小程序支付 */
  Jsapi = 'jsapi',
  /** Native支付 */
  Native = 'native',
  /** APP支付 */
  App = 'app',
  /** 付款码支付 */
  CodePay = 'code_pay',
  /** H5支付 */
  WebH5 = 'web-h5',
  /** 刷脸支付 */
  Face = 'face',
  /** 其他支付 */
  Other = 'other'
}


export enum OrderCancelType {
  /** 用户取消 */
  User = 1,
  /** 系统取消 */
  System = 2,
  /** 超时取消 */
  Timeout = 3
}

export enum OrderRefundStatus {
  /** 未退款 */
  None = 0,
  /** 退款中 */
  Pending = 1,
  /** 退款成功 */
  Success = 2,
  /** 退款失败 */
  Failed = 3
}

export enum OrderDateType {
  Day = 1,
  Month = 2,
  Quarter = 3,
  Year = 4
}



export enum DeliveryStatus {
  /** 待创建物流单 */
  WaitingCreated = 1,
  /** 已创建物流单 */
  Created = 2,
  /** 已发货 */
  Shipped = 3,
  /** 已收货 */
  Received = 4
}
