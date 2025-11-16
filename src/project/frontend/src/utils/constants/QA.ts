export enum QAMsgType {
  /** 文本 */
  Text = 1,
  /** 图片 */
  Image = 2,
  /** 视频 */
  Video = 3,
  /** 音频 */
  Audio = 4
}

export enum QAMsgUserType {
  /** 用户 */
  User = 1,
  /** 管理员 */
  Admin = 2,
  /** 机器人 */
  Bot = 99,
  /** 系统 */
  System = 100
}

export enum QAMsgMode {
  /** AI */
  AI = 1,
  /** 人工 */
  Human = 2
}
