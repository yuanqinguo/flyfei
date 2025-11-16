import { createContext } from 'react'
import type { BreadcrumbProps } from 'antd'

export type BreadcrumbItems = BreadcrumbProps['items'] | null

type LayoutContextProps = {
  breadcrumbItems?: BreadcrumbItems
  /** 设置面包屑 */
  setBreadcrumbItems?: (items: BreadcrumbItems) => void
}

const LayoutContext = createContext<LayoutContextProps>({})

export default LayoutContext
