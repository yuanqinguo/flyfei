import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
  RouterProviderProps,
  useNavigate,
  Link
} from 'react-router-dom'
import { Suspense, ReactNode, useContext, useState, useEffect, useMemo } from 'react'
import { RouteViews, FullLayoutRouteViews, IgnoreAuthRouteViews } from '@/router/RouteViews'
import AvatarDropdown from './AvatarDropdown'
import { ProLayout, MenuDataItem } from '@ant-design/pro-components'
import RouteName from '@/router/RouteName'
import { Button, Result, Spin, Breadcrumb, Input, Space, BackTop, FloatButton } from 'antd'
import store, { useAppDispatch, useAppSelector } from '@/store'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { sessionInit } from '@/store/actions'
import LayoutContext, { BreadcrumbItems } from './LayoutContext'
import SessionUtils from './SessionUtils'
import { arrayToTree, filterTree } from '@/utils'
import { useDebounce } from 'ahooks'
import './index.scss'
import MenuIcon from './MenuIcon'

const ReturnLink = () => {
  return (
    <Button
      onClick={() => {
        location.href = '/'
      }}
    >
      回到首页
    </Button>
  )
}

const ViewNoFound = () => {
  return <Result status="404" title="404" subTitle="抱歉，此页面不存在" extra={<ReturnLink />} />
}

const ViewNoAuthorization = () => {
  return <Result status="403" title="403" subTitle="抱歉，您没有权限访问该页面" extra={<ReturnLink />} />
}

const ViewLoading = () => <Spin style={{ width: '100%', marginTop: '64px' }} />

function checkPagePermission(path: string) {
  const pathPath = path.replace(/^\//, '')
  if (
    store
      .getState()
      .system.userPermission.some(
        item => (item.page_path && pathPath === item.page_path) || pathPath.startsWith(`${item.page_path}/`)
      ) ||
    import.meta.env.DEV
  ) {
    return true
  }
  return false
}

const AuthRouteViews = [...RouteViews, ...FullLayoutRouteViews]

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { loginToken, initPromise, isInit } = useAppSelector(app => app.session)
  const { userPermission } = useAppSelector(app => app.system)

  if (loginToken && !initPromise) {
    const systemInit = SessionUtils.loginSystemInit().then(() => {
      SessionUtils.loginSuccess(loginToken)
    })
    dispatch(
      sessionInit({
        initPromise: systemInit
      })
    )
  }

  if (!loginToken) {
    return (
      <Navigate to={`${RouteName.Login}?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
    )
  }

  if (isInit && location?.pathname === '/') {
    const firstPage = userPermission.sort((a, b) => a.sort - b.sort).find(item => item.page_path)
    return <Navigate to={firstPage?.page_path || '/'} replace />
  }

  if (isInit && !checkPagePermission(location.pathname)) {
    return <ViewNoAuthorization />
  }

  if (FullLayoutRouteViews.some(view => view.path === location.pathname)) {
    return <Outlet />
  }

  return children
}

const filterByMenuData = (data: MenuDataItem[], keyWord: string): MenuDataItem[] =>
  data
    .map(item => {
      if (item.name?.includes(keyWord)) {
        return { ...item }
      }
      const children = filterByMenuData(item.children || [], keyWord)
      if (children.length > 0) {
        return { ...item, children }
      }
      return undefined
    })
    .filter(item => item) as MenuDataItem[]

const LayoutWithMenu = () => {
  const { isInit } = useAppSelector(app => app.session)
  const { userInfo, userPermission, allMenu } = useAppSelector(state => state.system)
  const navigate = useNavigate()
  const [keyWord, setKeyWord] = useState('')
  const debounceKeyWord = useDebounce(keyWord, {
    wait: 300
  })

  const getIcon = (code: string) => {
    return MenuIcon[code] || null
  }

  const menuData = useMemo(() => {
    const menus = allMenu
      .filter(item => item.type === 1)
      .sort((a, b) => a.sort - b.sort)
      .map((item, index) => ({
        ...item,
        key: item.page_path || String(index),
        parentId: item.parent_id === -1 ? undefined : item.parent_id,
        path: item.page_path
      }))
    const tree = filterTree(
      arrayToTree(menus),
      userPermission.map(item => item.id),
      { valueKey: 'id' }
    ).map(item => {
      // @ts-ignore
      item.icon = getIcon(item.code)
      return item
    })
    return tree
  }, [userPermission, allMenu])

  return (
    <Suspense fallback={<ViewLoading />}>
      <RequireAuth>
        <ProLayout
          fixSiderbar
          className="layout-container"
          layout="mix"
          title="大秦科技管理后台"
          logo={<img src="/logo.png" />}
          location={location}
          menuDataRender={() => menuData}
          menuExtraRender={({ collapsed }) =>
            !collapsed && (
              <Space align="center">
                <Input
                  value={keyWord}
                  onChange={e => setKeyWord(e.target.value)}
                  style={{
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }}
                  prefix={
                    <SearchOutlined
                      style={{
                        color: 'rgba(0, 0, 0, 0.2)'
                      }}
                    />
                  }
                  allowClear
                  placeholder="搜索菜单"
                  variant="borderless"
                />
              </Space>
            )
          }
          postMenuData={menus => filterByMenuData(menus || [], debounceKeyWord)}
          contentStyle={{
            paddingBlock: '24px',
            paddingInline: '32px'
          }}
          avatarProps={{
            src: <UserOutlined style={{ color: '#999' }} />,
            size: 'small',
            title: userInfo?.name,
            render: (_: any, avatarChildren: any) => {
              return <AvatarDropdown>{avatarChildren}</AvatarDropdown>
            }
          }}
          style={{
            background: '#f5f5f5'
          }}
          menuProps={{
            style: {
              background: '#f5f5f5'
            },
            onClick(menu) {
              const currentPath = location.pathname.replace(/^\//, '')
              if (menu.key === currentPath) return // 如果点击的是当前页面，则不进行跳转
              navigate(menu.key)
            }
          }}
        >
          <Suspense fallback={<ViewLoading />}>
            {isInit ? (
              <>
                <Outlet />
                <FloatButton.BackTop className="global-back-top" />
              </>
            ) : (
              <ViewLoading />
            )}
          </Suspense>
        </ProLayout>
      </RequireAuth>
    </Suspense>
  )
}

type LayoutOptions = {
  /** 面包屑 */
  breadcrumbItems?: BreadcrumbItems
  /** html 页面标题 */
  title?: string
}

export const useLayout = (defaultOptions?: LayoutOptions) => {
  const context = useContext(LayoutContext)

  const setTitle = (title: string) => {
    document.title = title
  }

  useEffect(() => {
    if (defaultOptions?.breadcrumbItems) {
      context.setBreadcrumbItems?.(defaultOptions.breadcrumbItems)
    }
    if (defaultOptions?.title) {
      setTitle(defaultOptions.title)
    }
    return () => {
      context.setBreadcrumbItems?.(null)
      setTitle('')
    }
  }, [])

  return {
    ...context,
    setTitle
  }
}

const LayoutContent = ({ Component }: { Component: any }) => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItems>()

  return (
    <LayoutContext.Provider
      value={{
        breadcrumbItems,
        setBreadcrumbItems
      }}
    >
      {Array.isArray(breadcrumbItems) && (
        <Breadcrumb
          items={breadcrumbItems}
          style={{ marginBottom: '16px' }}
          itemRender={(currentRoute, params, items, paths) => {
            const isLast = currentRoute?.path === items[items.length - 1]?.path

            return isLast ? (
              <span>{currentRoute.title}</span>
            ) : (
              <Link to={`/${paths.join('/')}`}>{currentRoute.title}</Link>
            )
          }}
        />
      )}
      <Suspense fallback={<ViewLoading />}>
        <Component />
      </Suspense>
    </LayoutContext.Provider>
  )
}

const router: RouterProviderProps['router'] = createBrowserRouter(
  [
    {
      path: '/',
      element: <LayoutWithMenu />,
      children: AuthRouteViews.map(item => ({
        ...item,
        Component: () => <LayoutContent Component={item.Component} />
      }))
    },
    ...IgnoreAuthRouteViews,
    {
      path: '*',
      element: <ViewNoFound />
    }
  ],
  {
    basename: '/'
  }
)

const MainRouter = () => {
  return <RouterProvider router={router} />
}

export { RouteName, router, MainRouter }
