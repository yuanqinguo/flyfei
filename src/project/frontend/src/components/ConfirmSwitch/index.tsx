import { Popconfirm, PopconfirmProps, Switch } from 'antd'
import { useMemo, useState } from 'react'
import { useMountedRef } from '../../hooks'
import { SwitchProps } from 'antd/lib'

export interface ConfirmSwitchProps extends SwitchProps {
  title?: string
  unCheckedTitle?: string
  checkedTitle?: string
  /**
   * Popconfirm 的 onConfirm 事件，点击确定时触发
   */
  onConfirm?: PopconfirmProps['onConfirm'] | (() => Promise<void>)
  /**
   * Popconfirm 的 onCancel 事件，点击取消时触发
   */
  onCancel?: PopconfirmProps['onCancel']
}

const ConfirmSwitch: React.FC<ConfirmSwitchProps> = ({
  onConfirm,
  value,
  unCheckedChildren,
  checkedChildren,
  unCheckedTitle,
  checkedTitle,
  title,
  onCancel,
  ...rest
}) => {
  const [loading, setLoading] = useState(false)
  const mounted = useMountedRef()
  const popConfirmTitle = useMemo(() => {
    if (title) return title

    if (value) {
      return unCheckedTitle || `确认${typeof unCheckedChildren === 'string' ? unCheckedChildren : '禁用'}此项吗`
    } else {
      return checkedTitle || `确认${typeof checkedChildren === 'string' ? checkedChildren : '启用'}此项吗`
    }
  }, [title, checkedChildren, unCheckedChildren, value, checkedTitle, unCheckedTitle])

  return (
    <Popconfirm
      title={popConfirmTitle}
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
      <Switch
        value={value}
        loading={loading}
        disabled={loading}
        unCheckedChildren={unCheckedChildren}
        checkedChildren={checkedChildren}
        {...rest}
      />
    </Popconfirm>
  )
}

export { ConfirmSwitch }
export default ConfirmSwitch
