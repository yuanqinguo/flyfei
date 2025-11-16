import { lazy } from 'react'

type RouteComponentType = {
  path: string
  Component: any
}

export const RouteViews: RouteComponentType[] = []

export const FullLayoutRouteViews: RouteComponentType[] = []

export const IgnoreAuthRouteViews: RouteComponentType[] = []

// 不需要登录的页面
const ignoreAuthPaths = ['/login', '/ques/import-help', '/ques-render', '/weditor']
// 全屏页面
const fullLayoutPaths = ['/full-screen', '/ques/import-help', '/ques-render', '/weditor', '/prepare-courseware/edit']

// 里面层级的路由需要在这里定义
const views: any = import.meta.glob([
  '../views/*/index.tsx',
  '../views/bank-category/ques/index.tsx',
  '../views/paper/edit/index.tsx',
  '../views/ques/edit/index.tsx',
  '../views/ques/feedback/index.tsx',
  '../views/ques/edit/index.tsx',
  '../views/ques-audit/audit/index.tsx',
  '../views/bank-paper/paper/index.tsx',
  '../views/paper-audit/audit/index.tsx',
  '../views/ques/import/index.tsx',
  '../views/ques/import-help/index.tsx',
  '../views/bank-module/category/index.tsx',
  '../views/image-audit/audit/index.tsx',
  '../views/recording-course/edit/index.tsx',
  '../views/course/edit/index.tsx',
  '../views/course/data/index.tsx',
  '../views/course-series/courses/index.tsx',
  '../views/knowledge/tree/index.tsx',
  '../views/recording-course/data/index.tsx',
  '../views/prepare-courseware/edit/index.tsx',
  '../views/knowledge-content/edit/index.tsx',
  '../views/knowledge-content-audit/audit/index.tsx',
  '../views/knowledge-content/public-content/index.tsx',
  '../views/class-list/class-data/index.tsx',
  '../views/students-manage/learning-data/index.tsx',
  /** 创建赠品订单 */
  '../views/order-list/add-gift/index.tsx',
  /**  创建系统班（负责到高考）商品订单 */
  '../views/order-list/add-subject-goods/index.tsx',
  /**  创建课程商品(书课包和辅导班)订单 */
  '../views/order-list/add-course-goods/index.tsx',
  /**  分销商商品管理 */
  '../views/channel/goods-manage/index.tsx',
  /**  分销商订单结算 */
  '../views/channel/qr-code-manage/index.tsx',
  '../views/channel/order-settle/index.tsx',
  '../views/channel/order-settle/order-manage/index.tsx',
  /**  分销商订单列表 */
  '../views/channel/order-list/index.tsx',
  /**  新增/编辑课程商品（书课包和辅导班）订单 */
  '../views/virtual-goods/edit-course-goods/index.tsx'
])

Object.keys(views).forEach(k => {
  const path = k.match(/..\/views(.*?)\/index\.tsx/)?.[1] as string
  const routePath = path.replace(/\[([a-zA-Z0-9]+)\]/g, ':$1')
  const module = views[k]()
  let targetRouterViews: RouteComponentType[] = RouteViews
  if (ignoreAuthPaths.includes(routePath)) {
    targetRouterViews = IgnoreAuthRouteViews
  } else if (fullLayoutPaths.includes(routePath)) {
    targetRouterViews = FullLayoutRouteViews
  }
  targetRouterViews.push({
    path: routePath,
    Component: lazy(() => module)
  })
})
