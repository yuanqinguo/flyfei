export interface Customer {
  create_at: number
  nick_name?: string
  channel_name?: string
  status: number
  vip_type: number
  vip_subjects: {
    stage_id: number
    subject_ids: number[]
  }
  benefits?: Benefit[]
  update_at: number
  user_id: number
  [property: string]: any
}

export interface CustomerInfo {
  base_info: BaseInfo
  profile: Profile
  wechat_user: WechatUser
  mobile_user: MobileUser
  app_users: AppUsers[]
  student_profile: StudentProfile
}

export interface Benefit {
  expire_at: number
  subject_id: number
  vip_type: number
  has_expired?: boolean
}

interface BaseInfo {
  user_id: number
  nick_name: string
  status: number
  mobile_bind: number
  wechat_bind: number
  icon_url: string
  create_at: number
  update_at: number
  mobile: string
  user_no: string
  benefits: Benefit[]
  last_login: number
}

interface Profile {
  user_id: number
}

interface WechatUser {
  user_id: number
  union_id: string
  nick_name: string
}

interface MobileUser {
  user_id: number
  mobile: string
}

interface AppUsers {
  user_id: number
  app_code: number
  open_id: string
}

interface StudentProfile {
  id: number
  user_id: number
  updated_at: number
  parent_phone: string
  student_type: number
  attend_type: number
  province_id: number
  school_name: string
  delivery_address: string
  delivery_name: string
  delivery_mobile: string
  ncee_vintage: number
  stage_id: number
  grade_id: number
  real_name: string
  delivery_province_id: number
  delivery_city_id: number
  delivery_district_id: number
  tag_ncee_vintage: number
}
