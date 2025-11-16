import { DownOutlined, EllipsisOutlined } from '@ant-design/icons'
import { Button, ButtonProps, Dropdown, DropdownProps, Modal, Space, Tooltip } from 'antd'
import React, { useState } from 'react'
import { ConfirmButton } from '@/components/ConfirmButton'
import { LoadingButton } from '@/components/LoadingButton'

export interface ActionButtonItem {
  /**
   * 按钮图标
   */
  icon?: React.ReactNode
  /**
   * 按钮文本
   */
  label?: React.ReactNode
  /**
   * 确认框标题，如果存在则会在点击时弹出确认框
   */
  confirmTitle?: string
  /**
   * 按钮类型，展示形式为按钮时有效
   */
  type?: 'primary' | 'default'
  danger?: boolean
  /** 禁用按钮 */
  disabled?: boolean
  onClick?: (e: any) => void
  /**
   * 确认框确认事件
   */
  onConfirm?: () => void
  /** 是否隐藏 */
  hidden?: boolean
  /** tooltip */
  tooltip?: React.ReactNode
}

interface ActionButtonsProps {
  items: ActionButtonItem[]
  /**
   * 按钮类型
   * @default 'link'
   */
  type?: 'link' | 'button'
  /**
   * 最大按钮数量，超过该数量展示“更多功能”按钮，且超出数量的展示在下拉菜单
   * @default 2
   */
  maxCount?: number
  /**
   * 更多功能按钮，仅对按钮类型和展示形式为按钮时有效
   * @default '更多功能'
   */
  moreButton?: (ButtonProps & { tooltip?: React.ReactNode; label?: React.ReactNode }) | string
  /**
   * 下拉菜单属性
   */
  dropdownProps?: DropdownProps
}

const DEFAULT_MORE_BUTTON_LABEL = '更多功能'

function ActionButtons({
  items,
  type = 'link',
  maxCount = 2,
  moreButton = DEFAULT_MORE_BUTTON_LABEL,
  dropdownProps
}: ActionButtonsProps) {
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false)
  const actionButtons = items.filter(item => !item.hidden)
  const buttonItems = actionButtons.slice(0, maxCount - 1)
  const dropdownItems = actionButtons.slice(maxCount - 1).map((item, index) => ({
    key: index,
    label: item.label,
    disabled: item.disabled,
    danger: item.danger,
    onClick: async (e: any) => {
      setDropdownLoading(true)
      try {
        await item.onClick?.(e)
      } catch (error) {
        console.error(error)
      }
      setDropdownLoading(false)
    },
    onConfirm: item.onConfirm,
    confirmTitle: item.confirmTitle
  }))

  return (
    <Space size={14}>
      {buttonItems.length > 0 &&
        buttonItems.map((item, index) => {
          const ButtonComponent = item.confirmTitle ? ConfirmButton : LoadingButton
          const confirmTitle = item.confirmTitle
          return (
            <Tooltip title={item.tooltip || null} key={index}>
              {type === 'button' ? (
                <ButtonComponent
                  type={item.type}
                  danger={item.danger}
                  icon={item.icon}
                  disabled={item.disabled}
                  size="middle"
                  title={confirmTitle}
                  onClick={item.onClick}
                  onConfirm={item.onConfirm}
                >
                  {item.label}
                </ButtonComponent>
              ) : (
                <ButtonComponent
                  title={confirmTitle}
                  type="link"
                  style={{ padding: 0 }}
                  danger={item.danger}
                  disabled={item.disabled}
                  onClick={item.onClick}
                  onConfirm={item.onConfirm}
                >
                  {item.label}
                </ButtonComponent>
              )}
            </Tooltip>
          )
        })}
      {dropdownItems.length > 0 && (
        <Dropdown
          {...dropdownProps}
          menu={{
            items: dropdownItems,
            onClick: e => {
              const item = dropdownItems[Number(e.key)]
              if (item.onConfirm) {
                Modal.confirm({
                  title: item.confirmTitle,
                  onOk: item.onConfirm
                })
              }
            }
          }}
        >
          {type === 'button' ? (
            <div className="inline-block">
              {typeof moreButton === 'string' ? (
                <Button loading={dropdownLoading} size="middle">
                  {moreButton}
                  <DownOutlined />
                </Button>
              ) : (
                (() => {
                  const { tooltip, label, children, ...rest } = moreButton
                  return (
                    <Tooltip title={tooltip}>
                      <Button loading={dropdownLoading} {...rest}>
                        {label || children || DEFAULT_MORE_BUTTON_LABEL}
                        <DownOutlined />
                      </Button>
                    </Tooltip>
                  )
                })()
              )}
            </div>
          ) : (
            <Button type="link" loading={dropdownLoading} style={{ padding: 0 }} className="!text-xl">
              <EllipsisOutlined />
            </Button>
          )}
        </Dropdown>
      )}
    </Space>
  )
}

export default ActionButtons
