# 管理后台

请确保已具备较新的 node 环境（18/20+）和 [pnpm](https://pnpm.io/zh/installation)

## 安装及启动

```shell
# 安装依赖
pnpm install

# 启动应用
pnpm run dev
```

## 路由

### 路由生成

views 目录下第一个层级的文件夹默认会生成路由，第二个层级及更多层级则需要在 `router/RouteViews.tsx` views 里添加此文件的路径引入，路由名就是文件夹的名称，下面是生成路由的例子：

- `views/foo-bar/index.tsx` -> `/foo-bar`
- `views/foo-bar/edit/index.tsx` -> `/foo-bar/edit`
- `views/foo-bar/edit/[id]/index.tsx` -> `/foo-bar/edit/:id` (和 next.js 类似的生成方式， 参考 [next.js dynamic-routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) )


### 命名规范

- 路由名：使用 kebab-case 命名，如 `foo-bar`, `foo-bar/edit-name`
- 组件名：使用 PascalCase 命名，如 `FooBar.tsx`, `FooBar.jsx`

### Layout

可使用 `useLayout` 设置当前路由 layout 和获取当前页面的 layout

```tsx
import { useLayout } from '@/router'

// 组件内
const layout = useLayout({
  // 设置面包屑
  breadcrumbItems: [
    {
      title: 'foo'
    },
    {
      title: 'bar'
    }
  ],
  // 设置页面标题
  title: '新增'
})
```
