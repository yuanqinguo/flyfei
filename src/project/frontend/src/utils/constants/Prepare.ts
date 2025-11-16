export enum PrepareShareType {
  /** 只读 */
  READONLY = 1,
  /** 可编辑 */
  EDITABLE = 2
}

/** 课件默认模版页面类型 */
export enum CoursewarePageType {
  /** 封面页 */
  Title = 'title',
  /** 列表页 */
  List = 'list',
  /** 内容页 */
  Content = 'content',
  /** 目录页 */
  Catalog = 'catalog',
  /** 标题页 */
  CatalogTitle = 'catalog_title',
  /** 大字页 */
  BigText = 'big_text',
  /** 题目页 */
  Question = 'question',
  /** 结尾页 */
  End = 'end'
}

/** 列表页布局 */
export const enum CoursewareListItemLayout {
  /** 垂直排列 */
  Vertical = 'vertical',
  /** 水平排列 */
  Horizontal = 'horizontal',
  /** 网格排列 */
  Grid = 'grid'
}

/** 课件对比点类型 */
export const enum CoursewareCompareDotType {
  /** 毛线球 */
  Yarn = 'yarn',
  /** 毛线球-新 */
  YarnNew = 'yarn_new',
  /** 水滴 */
  Water = 'water',
  /** 笑脸 */
  SmileFace = 'smile_face',
  /** 标签 */
  Tag = 'tag',
  /** 灯泡 */
  Bulb = 'bulb',
  /** 拼图 */
  Puzzle = 'puzzle',
  /** 星星 */
  Star = 'star',
  /** 矩形 */
  Rectangle = 'rectangle'
}

/** 试题列表排列类型 */
export const enum CoursewareQuestionListLayout {
  /** 垂直排列 */
  Vertical = 'vertical',
  /** 水平排列 */
  Horizontal = 'horizontal',
  /** 网格排列 */
  Grid = 'grid'
}

/** 页面模板 */
export const enum CoursewareTemplateCode {
  /** 默认 */
  Default = 'default',
  /** A4 */
  A4 = 'a4'
}

/** 标题字体大小 */
export const enum CoursewarePageTitleFontSizeType {
  /** 大 */
  Large = 'large',
  /** 中 */
  Middle = 'middle',
  /** 小 */
  Small = 'small'
}

/** 大字页背景色 */
export const bigTextBackground = [
  '#e59edd',
  '#74d1d4',
  '#80d5ff',
  '#9c90e0',
  '#fecde6',
  '#4aaecd',
  '#7fc5a4',
  '#ffc300',
  '#e87c85',
  '#2989cd',
  '#a2ea9f',
  '#aed168',
  '#ce4c4d'
]

/** 目录类型 */
export const enum CoursewareCatalogType {
  /** 裁切 */
  Clip = 'clip',
  /** 渐变 */
  Gradient = 'gradient',
  /** 分割 */
  Split = 'split',
  /** 上左 */
  UpperLeft = 'upperLeft',
  /** 半透明 */
  Translucent = 'translucent',
  /** 树 */
  Tree = 'tree'
}

/** 目录布局 */
export const enum CoursewareContentCatalogLayout {
  /** 竖向排列 */
  Vertical = 'vertical',
  /** 横向排列 */
  Horizontal = 'horizontal',
  /** 左右分支 */
  LeftRight = 'left_right'
}

/** 对比页布局 */
export const enum CoursewareCompareImageLayout {
  /** 竖向 */
  Vertical = 'vertical',
  /** 横向 */
  Horizontal = 'horizontal',
  /** 网格 */
  Grid = 'grid'
}

/** 课件图文页图片位置 */
export const enum CoursewareImageTextImagePosition {
  /** 顶部 */
  Top = 1,
  /** 右部 */
  Right = 2,
  /** 左部 */
  Left = 3
}

/** 课件标题类型 */
export const enum CoursewareTitleType {
  Default = 'default',
  Bg = 'bg'
}

/** 可加标题布局 */
export const enum CoursewareTitleLayout {
  /** 上下排列 */
  Vertical = 'vertical',
  /** 左右排列 */
  Horizontal = 'horizontal'
}

export const enum CoursewareTitleAlign {
  /** 左对齐 */
  Left = 'left',
  /** 居中对齐 */
  Center = 'center'
}
