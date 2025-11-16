import React, { useEffect, useState } from 'react'
import { Form } from 'antd'
import { WrapperInput } from '../SearchForm/DynamicFormItem'
import { EditAction, FastColumnProps } from './index'
import { EditOutlined } from '@ant-design/icons'
import EditButton from './EditButton'

export function toArray<T>(value?: T | T[] | null): T[] {
  if (value === undefined || value === null) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export interface EditableCellProps<T> {
  editable: FastColumnProps<T>['editable']
  editing: boolean
  record: T
  rowIndex?: number
  children?: React.ReactNode
  columnProps: FastColumnProps<T>
  editAction: EditAction<T>
}

const autoFocusCache = new WeakMap<any, boolean>()

function EditableCell<T>({
  children,
  record,
  editing,
  columnProps,
  rowIndex,
  editable,
  editAction,
  ...rest
}: EditableCellProps<T>) {
  if (typeof editable === 'function') {
    editable = editable(record)
  }
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm()
  editing = editing && !!editable

  useEffect(() => {
    if (!editing || !isEdit) {
      autoFocusCache.delete(record)
    }
  }, [editing, isEdit])

  if (editing && editable) {
    const rules = typeof columnProps.rules === 'function' ? columnProps.rules(record, rowIndex) : columnProps.rules
    const autoFocus = !autoFocusCache.has(record)
    if (autoFocus && record) {
      autoFocusCache.set(record, true)
    }
    children = (
      <Form.Item
        className={'inner-edit-cell-item'}
        name={columnProps.dataIndex as string}
        rules={rules}
        // label={columnProps.title}
      >
        <WrapperInput column={columnProps} autoFocus={autoFocus} record={record} />
      </Form.Item>
    )
  }

  if (isEdit && editable) {
    const rules = typeof columnProps.rules === 'function' ? columnProps.rules(record, rowIndex) : columnProps.rules
    const autoFocus = !autoFocusCache.has(record)
    if (autoFocus && record) {
      autoFocusCache.set(record, true)
    }

    children = (
      <Form initialValues={record as Record<string, any>} form={form}>
        <Form.Item
          className={'inner-edit-cell-item'}
          name={columnProps.dataIndex as string}
          rules={rules}
          // label={columnProps.title}
        >
          <WrapperInput column={columnProps} autoFocus={autoFocus} record={record} />
        </Form.Item>
      </Form>
    )
  }

  let editButton = null
  if (columnProps?.showEditButton && editable) {
    editButton = isEdit ? (
      <EditButton
        row={record}
        editAction={editAction}
        isCell
        editing={true}
        onCancel={() => {
          setIsEdit(false)
        }}
        onConfirm={async () => {
          await form.validateFields()
          const values = form.getFieldsValue()
          await columnProps.onEditConfirm?.(values, record)
          editAction.confirm(record, values)
          setIsEdit(false)
        }}
      />
    ) : (
      <a
        onClick={() => {
          setIsEdit(true)
          form.setFieldsValue(record)
        }}
      >
        <EditOutlined />
      </a>
    )
  }

  return (
    <td {...rest}>
      {children}
      {editButton}
    </td>
  )
}

export default EditableCell
