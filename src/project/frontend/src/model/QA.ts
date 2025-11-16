import { QAMsgMode, QAMsgUserType, QAMsgType } from '@/utils/constants/QA'

/**
 * 业务对象
 */
export interface QAStat {
  /**
   * 对象ID，与入参obj_type对应
   */
  obj_id?: number
  /**
   * 总答疑次数（教师+AI）
   */
  total_qa?: number
  /**
   * 消息未读数
   */
  total_unread?: number
  /**
   * 总答疑用户数
   */
  total_user?: number
  obj_data?: any
}

/**
 * 业务对象参数
 */
export interface QAStatListParam {
  /**
   * 最后一条消息时间
   */
  end_time?: number
  /**
   * 对象ID
   */
  obj_id?: number
  /**
   * 1: 试题， 2：知识点  3：课时
   */
  obj_type: number
  /**
   * 排序字段： obj_id, last_msg_at, total_qa, total_user, total_unread
   */
  sort_field?: string
  /**
   * 排序方式： desc ，asc 默认desc
   */
  sort_type?: string
  /**
   * 最后一条消息时间
   */
  start_time?: number
  /**
   * 那个科目
   */
  subject_id?: number
}

export interface QASession {
  icon_url: string
  id: number
  last_message_at?: number
  obj_id?: number
  obj_type?: number
  subject_id?: number
  total_unread?: number
  user_id: number
  user_name: string
  user_no: string
  /**
   * 1-AI 2-系统
   */
  mode: QAMsgMode
  last_messages?: QASessionMsg[]
}

export interface QASessionListParam {
  /**
   * 对象ID，上一个接口返回的obj_id
   */
  obj_id: number
  /**
   * 1-试题 2-知识点 3-课时
   */
  obj_type?: number
  /**
   * 排序字段：create_at， last_msg_at， 默认last_msg_at 倒序
   */
  sort_field?: string
  /**
   * desc , asc
   */
  sort_type?: string
  /**
   * 用户ID（对话列表中的用户搜索）
   */
  user_id?: number

  last_msg_at?: number
  is_before?: boolean
}

export interface QASessionMsg {
  content?: string
  create_at: number
  icon_url?: string
  id?: number
  session_id?: number
  user_id?: number
  user_name?: string
  /** 1-用户， 2-管理员，99-机器人, 100-系统 */
  user_type?: QAMsgUserType
}

export interface QASessionContent {
  /**
   * 消息类型  1: 文本， 2：图片 3：视频 4：音频
   */
  msg_type?: QAMsgType

  /**
   * 消息内容
   */
  msg_value?: string
  video_position?: number
  chapter_name?: string
  msg_text_value?: string
}
