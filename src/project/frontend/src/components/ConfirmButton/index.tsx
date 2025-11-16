import { Button, ButtonProps, Popconfirm, PopconfirmProps, Typography, Spin } from 'antd'
import { LinkProps } from 'antd/es/typography/Link'
import { useState } from 'react'
import { useMountedRef } from '../../hooks'
import { LoadingOutlined } from '@ant-design/icons'

export interface ConfirmButtonBaseProps {
  /**
   * 是否是链接按钮
   */
  isLink?: boolean
  /**
   * Popconfirm 的title属性，弹出框的内容
   */
  title: PopconfirmProps['title']
  /**
   * Popconfirm 的 onConfirm 事件，点击确定时触发
   */
  onConfirm?: PopconfirmProps['onConfirm'] | (() => Promise<void>)
  /**
   * Popconfirm 的 onCancel 事件，点击取消时触发
   */
  onCancel?: PopconfirmProps['onCancel']
  /** 前置条件 */
  condition?: boolean | (() => boolean | Promise<boolean>)
}

export interface ConfirmButtonProps extends ConfirmButtonBaseProps, Omit<ButtonProps, 'title'> {
  isLink?: false
}
export interface ConfirmLinkButtonProps extends ConfirmButtonBaseProps, Omit<LinkProps, 'title'> {
  isLink?: true
}

const ConfirmButton: React.FC<ConfirmButtonProps | ConfirmLinkButtonProps> = ({
  onConfirm,
  isLink,
  title,
  condition = true,
  onCancel,
  ...rest
}) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const mounted = useMountedRef()

  const handleOpenChange = async (newOpen: boolean) => {
    if (!newOpen) {
      setOpen(newOpen)
      return
    }
    if (typeof condition === 'function' ? await condition() : condition) {
      setOpen(newOpen)
    } else {
      // noop
    }
  }
  return (
    <Popconfirm
      title={title}
      open={open}
      cancelButtonProps={{ disabled: false }}
      okButtonProps={{ disabled: false }}
      onOpenChange={handleOpenChange}
      onConfirm={async e => {
        setLoading(true)
        try {
          await onConfirm?.(e)
        } finally {
          mounted.current && setLoading(false)
        }
      }}
      onCancel={onCancel}
    >
      {isLink ? (
        <Spin indicator={<LoadingOutlined spin />} size="small" spinning={loading}>
          <Typography.Link disabled={loading} {...(rest as Omit<LinkProps, 'title'>)} />
        </Spin>
      ) : (
        <Button loading={loading} {...(rest as Omit<ButtonProps, 'title'>)} />
      )}
    </Popconfirm>
  )
}

export { ConfirmButton }
export default ConfirmButton
