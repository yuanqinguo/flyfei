import { Form } from 'antd'
import { FormItemProps } from 'antd/es/form'
import ValueType from '../ValueType'
import { FastColumnProps } from '../TableWrapper'
import { SelectProps } from 'antd/es/select'
import NamesFormItem from '@/components/NamesFormItem'

interface WrapperInputProps<T> {
  value?: any
  onChange?: (v: any) => void
  column: FastColumnProps
  autoFocus?: boolean
  record?: T
}

export function WrapperInput<T>({ column, value, onChange, record, ...rest }: WrapperInputProps<T>) {
  let realChangeFunction = onChange
  let renderFunction = ValueType.text.renderFormItem!
  if (column.formItemRender) {
    renderFunction = column.formItemRender
  } else if (column.valueEnum) {
    renderFunction = ValueType.enum.renderFormItem!
  } else if (column.valueType) {
    renderFunction = ValueType[column.valueType]?.renderFormItem || renderFunction
  }

  if ((column.formItemFieldProps as SelectProps<any>)?.mode === 'multiple') {
    if (typeof value === 'string') {
      value = (value && value.split(',')) || []
      realChangeFunction = (val?: any) => {
        if (Array.isArray(val)) {
          onChange?.(val?.join(','))
        } else if (val) {
          onChange?.(val)
        } else {
          onChange?.(undefined)
        }
      }
    }
  }
  return renderFunction({ value, onChange: realChangeFunction, record, ...rest }, column)
}

function columnToFormItemProps(column: FastColumnProps): Omit<FormItemProps, 'children'> {
  return {
    label: column.title,
    name: column.formItemName || (column.dataIndex as string),
    ...column.formItemProps
  }
}

const labelWidth = 90

/** 计算最大宽度防止溢出换行 */
const formItemFixStyle = {
  labelCol: {
    flex: `0 0 ${labelWidth}px`
  },
  wrapperCol: {
    style: {
      maxWidth: `calc(100% - ${labelWidth}px)`
    }
  }
}

const DynamicFormItem = (props: FastColumnProps) => {
  const formProps = columnToFormItemProps(props)
  const FormItem = props.isNamesFormItem ? NamesFormItem : Form.Item
  return (
    <FormItem {...formItemFixStyle} {...formProps} names={formProps.name}>
      <WrapperInput column={props} />
    </FormItem>
  )
}

export default DynamicFormItem
