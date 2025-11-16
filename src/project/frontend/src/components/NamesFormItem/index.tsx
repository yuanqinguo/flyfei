import { Form, FormItemProps } from 'antd'

type Name = FormItemProps['name']

export interface NamesFormItemProps extends FormItemProps {
  /** 字段数组 */
  names: Name[]
  /** 清空字段后的默认值 */
  defaultValue?: any
}

const getValue = (value: any, defaultValue: any) => (value === undefined ? defaultValue : value)

const NamesFormItem = (props: NamesFormItemProps) => {
  const { name, defaultValue, names, ...restProps } = props

  const form = Form.useFormInstance()

  return (
    <>
      <Form.Item
        name={names[0]}
        {...restProps}
        getValueFromEvent={values => {
          names
            .slice(1)
            .forEach((name: Name, index: number) =>
              form.setFieldValue(name, getValue(values?.[index + 1], defaultValue))
            )
          return getValue(values?.[0], defaultValue)
        }}
        getValueProps={value => {
          return {
            value: [value, ...names.slice(1).map((name: Name) => form.getFieldValue(name))].filter(Boolean)
          }
        }}
      />
      {names.slice(1).map((name: Name, index: number) => (
        <Form.Item key={index} name={name} {...restProps} hidden />
      ))}
    </>
  )
}

export { NamesFormItem }
export default NamesFormItem
