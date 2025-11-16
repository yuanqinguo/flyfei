import { PageResult } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import User from '@/model/User'
import { PageParam } from '@/model/dto/Page'
import { uuid } from '@/utils'
import { SHA256 } from 'crypto-js'

const client = new RequestClient('mall/admin/v1/user')

export interface ResetPasswordParam {
  /**
   * 确认密码， md5(pwd)小写
   */
  confirm_pwd: string
  /**
   * 手机号
   */
  mobile: string
  /**
   * 密码，md5(pwd)小写
   */
  password: string
  /**
   * 验证码
   */
  verify_code: string
}

export default {
  /** 获取验证码 */
  verifySmsCode(param: {
    /**
     * 国家码 +86
     */
    country_code?: string
    /**
     * 是否调试模式，默认false， 调试模式下接口将返回对应验证码值
     */
    is_debug?: boolean
    /**
     * 手机号
     */
    mobile: string
    /**
     * 场景编码：
     * admin_user_mobile_login ： 手机验证码登录
     * admin_user_reset_password ： 手机号重置密码
     */
    scene: string
    /**
     * 腾讯滑块的ticket，暂无
     */
    ticket?: string
  }) {
    return client.post<{ code?: string }>('verify/smscode', param)
  },
  /** 手机号密码登录 */
  loginPassword(param: {
    /**
     * 手机号
     */
    mobile: string
    /**
     * 请对密码进行md5小写加密后传输
     */
    password: string
    ticket?: string
  }) {
    return client.post<{ token: string; user: User }>('login/password', param)
  },
  /** 手机号验证码登录 */
  loginVerifyCode(param: {
    /**
     * 手机号
     */
    mobile: string
    /**
     * 验证码
     */
    verify_code: string
  }) {
    return client.post<{ token: string; user: User }>('login/verify_code', param)
  },

  /** 飞书扫码登录 */
  loginLarkQrCode(param: {
    /**
     * appCode
     */
    app_code: number
    /**
     * code
     */
    code: string
    redirect_uri: string
  }) {
    return client.post<{ token: string; user: User }>('login/qr_lark', param)
  },
  /** 飞书扫码绑定 */
  bindLarkQrCode(param: {
    /**
     * appCode
     */
    app_code: number
    /**
     * code
     */
    code: string
    redirect_uri: string
  }) {
    return client.post('lark_bind', param)
  },

  /** 飞书解绑 */
  unbindLark(param: {
    /**
     * appCode
     */
    app_code: string
  }) {
    return client.post('lark_unbind', param)
  },
  /** 密码重置 */
  resetPassword(param: ResetPasswordParam) {
    return client.post('reset_password', param)
  },
  /** 管理员信息 */
  info() {
    return client.get<User>('info')
  },
  /** 管理员信息 */
  infos(param: { ids: string }) {
    return client.get<User[]>('infos', param)
  },
  /** 管理员列表 */
  list(param?: PageParam & { role_id?: number }) {
    return client.get<PageResult<User>>('list', param)
  },
  /** 更新管理员用户 */
  update(param: Partial<User>) {
    return client.post('update', param)
  },
  /** 添加管理员用户 */
  create(param: User) {
    return client.post('create', param)
  },
  /** 删除管理员用户 */
  delete(param: { id: number }) {
    return client.post('delete', param)
  },
  /** 获取用户列表 */
  customerList(param?: { mobile?: string; status?: number } & PageParam) {
    return client.get<
      PageResult<{ create_at: number; nick_name?: string; status: number; update_at: number; user_id: number }>
    >('customer/list', param)
  },
  /** 获取滑块验证  */
  verifyCaptcha(param: {
    /**
     * 随机字符串
     */
    once?: string
    /**
     * 秘钥固定加密： sha256(once+Jiezhou2025+ts)  转小写
     */
    sign?: string
    /**
     * 时间戳
     */
    ts?: number
  }) {
    const once = uuid()
    const ts = Date.now()
    const sign = SHA256(`${once}Jiezhou2025${ts}`)
    return client.get<{
      /**
       * 过期时间秒  固定 120s后该滑块失效
       */
      expire: number
      /**
       * 主图-背景图，包含“data:image/jpeg"
       */
      image_base64: string
      /**
       * 票据，验证码接口需要提交该票据
       */
      key: string
      /**
       * 滑块图的高
       */
      title_height: number
      /**
       * 块图-滑块图，包含“data:image/jpeg"
       */
      title_image_base64: string
      /**
       * 滑块图的宽
       */
      title_width: number
      /**
       * 滑块图的坐标位置
       */
      title_x: number
      title_y: number
    }>('verify/captcha', {
      ts,
      sign,
      once,
      ...param
    })
  },
  /** 滑块滑动结果验证 */
  verifyCaptchaCheck(param: {
    /**
     * key,获取滑块时返回的key字段
     */
    key?: string
    /**
     * 用户滑到的x位置
     */
    slide_x: number
    /**
     * 用户滑到的y位置
     */
    slide_y: number
  }) {
    return client.post<{
      expire: number
      /**
       * 票据，在发送验证码时需要提交，参考expire有效描述
       */
      ticket: string
    }>('verify/captcha/check', param, { showErrorMessage: false })
  }
}
