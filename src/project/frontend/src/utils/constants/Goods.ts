export enum GoodsType {
  /** 课程vip商品（负责到高考） */
  SubjectVipGoods = 1,
  /** 真实商品 */
  RealGoods = 2,
  /** 辅导班商品 */
  TutorialGoods = 3,
  /** 集训课商品 */
  BootCampGoods = 4
}

export enum DurationType {
  Month = 1,
  Quarter = 2,
  HalfYear = 3,
  Year = 4,
  TwoYears = 5,
  ThreeYears = 6,
  SevenDays = 7
}

export enum DiscountType {
  /** 科目折扣 */
  Subject = 1,
  /** 年折扣 */
  Year = 2
}

export enum CourseGoodsItemType {
  /** 课程vip商品 */
  CourseProduct = 1,
  /** 实体教辅产品 */
  EntityProduct = 2
}

export enum CourseGoodsFileType {
  /** 电子教辅 */
  EBook = 1,
  /** 课程大纲 */
  CourseOutline = 2
}

export enum CourseGoodsSaleType {
  /** free */
  Free = 1,
  /** 收费 */
  Charge = 2,
  /** 试听 */
  Trial = 3
}
