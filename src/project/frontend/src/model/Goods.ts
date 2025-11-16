export interface SubjectGoods {
  create_at?: number
  create_by?: number
  create_name?: string
  discount_rates?: DiscountRate[]
  /**
   * 1: 月 2：季度 3：半年 4： 一年 :5：两年 6：三年
   */
  duration_type?: number
  /**
   * 单位元
   */
  goods_price?: number
  id: number
  name?: string
  sort?: number
  /** 单位分 */
  origin_price?: number
  /** 单位分 */
  platform_discount_amount?: number
  /**
   * -1： 下架  1：上架
   */
  status?: number
  subject_id?: number
  update_at?: number
  update_by?: number
  update_name?: string
  /**
   * 1： VIP 2：SVIP
   */
  vip_type?: number
  [property: string]: any
}
export interface RealGoods {
  cover_key?: string
  cover_url?: string
  create_at?: number
  create_by?: number
  create_name?: string
  desc?: string
  detail: string
  id?: number
  name?: string
  price: number
  update_at?: number
  update_by?: number
  update_name?: string
  [property: string]: any
}
export interface DiscountRate {
  discount_desc?: string
  discount_rate?: number
  /**
   * 1: 多科折扣
   */
  discount_type?: number
  subject_count?: number
  [property: string]: any
}

export interface CourseGoods {
  cover_key?: string
  cover_url?: string
  create_at?: number
  create_by?: number
  create_name?: string
  files: CourseGoodsFile[]
  goods_price?: number
  grade_id?: number
  id: number
  intro_key: string
  intro_url: string
  is_distributable?: boolean
  is_official_sale?: boolean
  items?: CourseGoodsItem[]
  name?: string
  stage_id?: number
  status?: number
  subject_id?: number
  type?: number
  update_at?: number
  update_by?: number
  update_name?: string
  [property: string]: any
}

export interface CourseGoodsFile {
  course_goods_id: number
  create_at: number
  create_by: number
  create_name: string
  file_key: string
  file_name: string
  /**
   * 1：电子教辅  2：课程大纲
   */
  file_type: number
  file_url: string
  /**
   * ID 编号
   */
  id: number
  sort: number
  [property: string]: any
}

export interface CourseGoodsItem {
  course_goods_id: number
  create_at: number
  create_by: number
  create_name: string
  id: number
  item_id: number
  item_info: { [key: string]: any }
  item_type: number
  nums: number
  [property: string]: any
}
