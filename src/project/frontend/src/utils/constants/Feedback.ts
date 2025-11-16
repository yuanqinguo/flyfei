/** 缺题反馈状态 */
export enum MissFeedbackStatus {
  /** 未处理 */
  Unprocessed = 1,
  /** 处理中 */
  Processing = 2,
  /** 已处理 */
  Processed = 3
}

/** 错题反馈状态 */
export enum WrongFeedbackStatus {
  /** 未处理 */
  Unprocessed = 1,
  /** 处理中 */
  Processing = 2,
  /** 已处理 */
  Processed = 3
}

/** 图书反馈状态 */
export enum BookFeedbackStatus {
  /** 未处理 */
  Unprocessed = 1,
  /** 处理中 */
  Processing = 2,
  /** 已处理 */
  Processed = 3
}

/** 图片反馈状态 */
export enum ImageAuditStatus {
  /** 待审核 */
  Processing = 2,
  /** 审核通过 */
  Passed = 3,
  /** 审核不通过 */
  NotPassed = 4
}
