import { Button } from 'antd'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import { EditAction } from './index'
import { ButtonProps } from 'antd/es/button'

import {LoadingButton} from '@/components/LoadingButton'

export interface EditButtonProps<T> {
  row: T

  /**
   * 用户点击确认事件，如果返回值不为空，会将改值渲染到table中
   * @param value 当前编辑后的表单数据
   */
  onConfirm?(value?: T, record?: T): Promise<T | void> | T | void

  /**
   * onEdit事件
   * @param row 当前编辑的行
   * @return 如果返回值不为空，会将改值作为当前编辑的默认值
   */
  onEdit?(row: T): Promise<T | void> | T | void
  onCancel?(): void

  /**
   * 编辑动作Action
   */
  editAction: EditAction<T>
  /** 是否是 cell */
  isCell?: boolean
  /**
   * 是否编辑状态，isCell 为 true 时有效
   */
  editing?: boolean

  editButtonText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  editButtonProps?: ButtonProps
  okButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
}

export default function EditButton<T>({
  editAction,
  row,
  isCell,
  editing,
  onConfirm,
  onEdit,
  onCancel,
  ...rest
}: EditButtonProps<T>) {
  const {
    editButtonText = '编辑',
    confirmButtonText = '确认',
    cancelButtonText = '取消',
    okButtonProps,
    cancelButtonProps
  } = rest
  const currentEditRow = editAction.getCurrentEditRow()
  return currentEditRow === row || editing ? (
    <div className="flex gap-2">
      <LoadingButton
        type={'primary'}
        size="small"
        icon={<CheckOutlined />}
        {...okButtonProps}
        onClick={async () => {
          if (isCell) {
            await onConfirm?.()
          } else {
            const value = await editAction.validateFields()
            const resultValue = await onConfirm?.(value, row)
            const mergeValue = value === false ? undefined : resultValue || value
            editAction.confirm(row, mergeValue)
          }
        }}
      >
        {confirmButtonText}
      </LoadingButton>
      <Button
        size="small"
        onClick={() => {
          if (isCell) {
            onCancel?.()
          } else {
            editAction.cancel()
            onCancel?.()
          }
        }}
        icon={<CloseOutlined />}
        {...cancelButtonProps}
      >
        {cancelButtonText}
      </Button>
    </div>
  ) : (
    <LoadingButton
      icon={<EditOutlined />}
      size="small"
      onClick={async () => {
        const resultValue = await onEdit?.(row)
        editAction.edit(row, resultValue || row)
      }}
    >
      {editButtonText}
    </LoadingButton>
  )
}
