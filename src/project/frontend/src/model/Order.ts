export interface OrderItem {
  cancel_end: number
  /**
   * 取消时间范围
   */
  cancel_start: number
  /**
   * 取消类型：1: 用户取消  2：客服取消  3: 超时取消
   */
  cancel_type: number
  /**
   * 订单创建人id
   */
  create_by: number
  /**
   * 订单创建时间-结束
   */
  create_end: number
  /**
   * 订单创建时间-开始
   */
  create_start: number
  /**
   * 商品ID
   */
  goods_id: number
  limit: number
  /**
   * 用户昵称
   */
  nick_name: string
  /**
   * 订单号
   */
  order_no: string

  page: number
  payment_end: number
  /** 原价 */
  origin_order_amount: number
  /** 原价优惠金额 */
  origin_discount_amount: number
  /**
   * 支付时间范围
   */
  payment_start: number
  recycle_end: number
  /**
   * 回收时间范围
   */
  recycle_start: number
  refund_end: number
  /**
   * 退款时间范围
   */
  refund_start: number
  /**
   * 状态列表，逗号链接，多状态查询，可为空   -1：已取消，1: 待支付 2：已支付（已完成） 3：部分退款 4：完全退款   99:订单回收
   */
  status_list: string


  [property: string]: any
}

export interface OrderListParams {
  /**
   * 取消时间
   */
  cancel_at?: number
  /**
   * 取消人
   */
  cancel_by?: number
  /**
   * 取消人
   */
  cancel_name?: string
  /**
   * 取消理由
   */
  cancel_reason?: string
  /**
   * 取消类型： 1: 用户取消  2：客服取消  3: 超时取消
   */
  cancel_type?: number
  /**
   * 创建时间
   */
  create_at?: number
  /**
   * 创建人
   */
  create_by?: number
  /**
   * 创建人名
   */
  create_name?: string
  /**
   * 优惠金额 单位元
   */
  discount_amount?: number
  /**
   * 交付状态： 1： 待交付（自动交付失败，管理后台可手动交付） 2： 已交付
   */
  effective_status?: number
  /**
   * 订单id
   */
  id?: number
  /**
   * 订单金额 单位元
   */
  order_amount?: number
  /**
   * 订单描述，一般只有管理后台有
   */
  order_desc?: string
  /**
   * 订单编号
   */
  order_no?: string
  /**
   * 订单来源：1：用户侧下单  2：管理后台  3：系统赠送  4: 学生加入学校
   */
  order_source?: number
  /**
   * 支付金额 单位元
   */
  payment_amount?: number
  /**
   * 订单支付时间
   */
  payment_at?: number
  /**
   * 订单回收时间
   */
  recycle_at?: number
  /**
   * 订单回收人
   */
  recycle_by?: number
  /**
   * 回收证明图片
   */
  recycle_key?: string
  /**
   * 订单回收人
   */
  recycle_name?: string
  /**
   * 订单回收理由
   */
  recycle_reason?: string
  /**
   * 订单退款金额 单位元
   */
  refund_amount?: number
  /**
   * 订单状态 -1：已取消，1: 待支付 2：已支付（已完成） 3：部分退款 4：完全退款   99:订单回收
   */
  status?: number
  /**
   * 租户id
   */
  tenant_id?: number
  /**
   * 租户名
   */
  tenant_name?: string
  /**
   * 租户编码
   */
  tenant_no?: string
  /**
   * 交易渠道： wechat:微信支付  alipay：支付宝支付  12jieke：十二节课小程序  offline：线下各类渠道支付  tenant: 学生加入租户支付
   */
  trade_platform?: string
  /**
   * jsapi：公众号支付、小程序支付
   * native：Native支付
   * app：APP支付
   * code_pay：付款码支付
   * web-h5：H5支付
   * face：刷脸支付
   * other： 其他支付
   */
  trade_type?: string
  /**
   * 用户id
   */
  user_id?: number
  /**
   * 用户手机号
   */
  user_mobile?: string
  /**
   * 用户昵称
   */
  user_name?: string

  [property: string]: any
}

export interface OrderInfo {
  cancel_at: number
  cancel_by: number
  cancel_name: string
  cancel_reason: string
  cancel_type: number
  create_at: number
  create_by: number
  create_name: string
  /**
   * 优惠金额 元
   */
  discount_amount: number
  /**
   * 1： 待交付  2：已交付
   */
  effective_status: number
  id: number
  items: GoodsItem[]
  /**
   * 订单金额 元
   */
  order_amount: number
  order_desc: string
  order_no: string
  order_source: number
  /**
   * 支付金额 元
   */
  payment_amount: number
  payment_at: number
  recycle_at: number
  recycle_by: number
  recycle_key: string
  recycle_name: string
  recycle_reason: string
  /**
   * 退款金额  元
   */
  refund_amount: number
  refunds: Refund[]
  status: number
  tenant_id: number
  tenant_name: string
  tenant_no: string
  trade_platform: string
  trade_type: string
  user_id: number
  user_mobile: string
  user_name: string
  user_no: string
  [property: string]: any
}

export interface GoodsItem {
  discount_rate?: number
  discount_rate_list?: DiscountRateList[]
  goods_id?: number
  /**
   * 该字段根据goods_type 不同的商品类型决定的
   */
  goods_snap?: GoodsSnap
  /**
   * 1: 虚拟商品 2：实物商品
   */
  goods_type?: number
  id?: number
  order_id?: number
  /**
   * 支付金额 元
   */
  payment_amount?: number
  /**
   * 0:未退款 1：退款中 2：退款完成 3：退款异常
   */
  refund_status?: number
  user_id?: number
  [property: string]: any
}

export interface DiscountRateList {
  /**
   * 折扣描述
   */
  discount_desc: string
  /**
   * 折扣率
   */
  discount_rate: number
  /**
   * 折扣类型 1：多科折扣
   */
  discount_type: number
  /**
   * 科目数量
   */
  subject_count: number
  [property: string]: any
}

/**
 * 该字段根据goods_type 不同的商品类型决定的
 */
export interface GoodsSnap {
  create_at: number
  create_by: number
  discount_rates: DiscountRate[]
  /**
   * 商品单价 元
   */
  goods_price: number
  id: number
  name: string
  /**
   * 划线价 元
   */
  origin_price: number
  status: number
  subject_id: number
  subject_name: string
  update_at: number
  update_by: number
  [property: string]: any
}

export interface DiscountRate {
  discount_desc?: string
  discount_rate?: number
  discount_type?: number
  subject_count?: number
  year_count?: number
  [property: string]: any
}

export interface Refund {
  /**
   * 退款金额 分
   */
  amount?: number
  /**
   * 退款申请时间
   */
  apply_at?: number
  /**
   * 对应支付平台的退款单号（全局唯一）
   */
  byboat_refund_no?: string
  /**
   * 退款完成时间（异常也算完成）
   */
  done_at?: number
  id?: number
  reason?: string
  refund_by?: number
  refund_name?: string
  /**
   * 支付平台的退款单号（全局唯一）
   */
  refund_no?: string
  /**
   * 1：退款中 2：退款完成 3：退款异常
   */
  status?: number
  user_id?: number
  [property: string]: any
}

export interface OrderStatisticsItem {
  date: string
  order_count: number
  /**
   * 元
   */
  payment_amount: number
  /**
   * 元
   */
  refund_amount: number
  refund_count: number
  /**
   * 元
   */
  revenue_amount: number
  [property: string]: any
}
