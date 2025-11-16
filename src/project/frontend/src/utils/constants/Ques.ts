export enum QuesType {
  /** 单选 */
  Single = 1,
  /** 多选 */
  Multiple = 2,
  /** 填空 */
  Fill = 3,
  /** 解答 */
  Essay = 4,
  /** 判断 */
  Judge = 5,
  /** 完形填空 */
  ClozeTest = 6,
  /** 小题填空 */
  GapFill = 7,
  /** 选择填空 */
  SelectFill = 8
}

/** 审核状态 1：创建中 2：审核中 3：通过 4：拒绝 */
export enum QuesAuditStatus {
  Creating = 1,
  Auditing = 2,
  Pass = 3,
  Refuse = 4
}
