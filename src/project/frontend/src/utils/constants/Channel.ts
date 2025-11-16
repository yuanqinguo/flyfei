export enum ChannelType {
  /** 企业机构 */
  Enterprise = 1,
  /** 个人 */
  Personal = 2
}

export enum DistributionType {
  /** 渠道分销 */
  Payment = 1,
  /** 拉新分销 */
  Division = 2,
  /** 混合分销 */
  Hybrid = 3
}

export enum SettleType {
  /** 拉新 */
  Division = 1,
  /** 分销 */
  Payment = 2,
  /** 合作 */
  Hybrid = 3
}
export enum SettleMode {
  /** 回款 */
  Payment = 1,
  /** 打款 */
  Division = 2
}

export enum ChannelPlatform {
  /** 抖音 */
  DouYin = 'douyin',
  /** 哔哩哔哩 */
  Bilibili = 'bilibili',
  /** 小红书 */
  Redbook = 'redbook',
  /** 快手 */
  Kuaishou = 'kuaishou',
  /** 视频号 */
  ShiPinHao = 'shipinhao'
}

export enum OrderSettleStatus {
  /** 未结算 */
  Unsettled = 1,
  /** 结算中 */
  Settling = 2,
  /** 结算完成 */
  Settled = 3,
  /** 作废 */
  Voided = 99
}
