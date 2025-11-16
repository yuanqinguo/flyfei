import classNames from 'classnames'
import { CSSProperties, forwardRef, useImperativeHandle, useMemo, useState } from 'react'

import './index.scss'

interface MenuItem {
  label: React.ReactNode
  icon?: React.ReactNode
  onClick?: (item: MenuItem) => void
}

interface ContextMenuPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  menuList?: MenuItem[]
}

export interface ContextMenuPanelRef {
  close: () => void
  open: (position: { left: number; top: number }) => void
}

const ContextMenuPanel = forwardRef<ContextMenuPanelRef, ContextMenuPanelProps>((props, ref) => {
  const { className, children, style, menuList, ...restProps } = props
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  const close = () => {
    setVisible(false)
    unregisterEvent()
  }

  useImperativeHandle(ref, () => ({
    open: (position: { left: number; top: number }) => {
      setVisible(true)
      setPosition(position)
      registerEvent()
    },
    close
  }))

  const mergedStyle = useMemo<CSSProperties>(() => {
    return {
      position: 'fixed',
      left: position?.left,
      top: position?.top,
      ...style
    }
  }, [position, style])

  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const menuPanelNode = document.querySelector('.context-menu-panel')
    if (menuPanelNode?.contains(target)) return
    close() // 点击非菜单区域，关闭菜单
  }

  const handleScroll = () => {
    close() // 页面滚动，关闭菜单
  }

  const registerEvent = () => {
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)
  }

  const unregisterEvent = () => {
    document.removeEventListener('click', handleClick)
    document.removeEventListener('scroll', handleScroll)
  }

  return visible ? (
    <div className={classNames('context-menu-panel', className)} style={mergedStyle} {...restProps}>
      {children || menuList?.map((item, index) => <ContextMenuItem key={index} {...item} />)}
    </div>
  ) : null
})

export const ContextMenuItem = (props: MenuItem) => {
  const { label, icon, onClick } = props
  return (
    <div className="context-menu-item" onClick={() => onClick?.(props)}>
      {label}
      {icon && <span>{icon}</span>}
    </div>
  )
}

export default ContextMenuPanel
