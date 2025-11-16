export default interface Resource {
  /**
   * 上传人
   */
  admin_user_id?: number
  admin_user_name?: string
  /**
   * 上传时间
   */
  create_at?: number
  /**
   * 文件key，与域名组合之后即为访问链接地址
   */
  file_key?: string
  /**
   * 原文件名
   */
  file_name?: string
  /**
   * 文件大小字节数
   */
  file_size?: number
  /**
   * 文件类型后缀
   */
  file_type?: string
  /**
   * 与上传时的scene值一致： applet:小程序  app: app端
   */
  terminal?: string

  file_url?: string
}
