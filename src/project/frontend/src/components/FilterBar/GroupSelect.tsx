import { Tag } from 'antd'
import React from 'react'

interface Option {
  label: React.ReactNode
  value: string | number
  [property: string]: any
}

type ValueType = string | number
type ArrayValueType = ValueType[]

interface GroupSelectProps {
  options: Option[]
  value: ValueType | ArrayValueType
  multiple?: boolean
  /** 是否可以取消选中 */
  uncheck?: boolean
  fieldNames?: {
    label: string
    value: string
  }
  onChange: (value: ValueType | ArrayValueType | undefined) => void
}

interface FilterOptionProps {
  label: React.ReactNode
  value: ValueType
  checked: boolean
  onChange: (value: ValueType, checked: boolean) => void
}

const FilterOption: React.FC<FilterOptionProps> = ({ label, value, checked, onChange }) => (
  <Tag.CheckableTag checked={checked} onChange={checked => onChange(value, checked)} className="cursor-pointer text-sm">
    {label}
  </Tag.CheckableTag>
)

const GroupSelect: React.FC<GroupSelectProps> = ({
  fieldNames,
  options,
  value,
  multiple = false,
  uncheck,
  onChange
}) => {
  const labelKey = fieldNames?.label || 'label'
  const valueKey = fieldNames?.value || 'value'

  const handleChange = (optionValue: ValueType, checked: boolean) => {
    if (multiple) {
      const values = Array.isArray(value) ? value : []
      if (checked) {
        onChange([...values, optionValue] as ArrayValueType)
      } else {
        onChange(values.filter(v => v !== optionValue) as ArrayValueType)
      }
    } else {
      if (!(uncheck && optionValue === value)) {
        onChange(checked ? optionValue : undefined)
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <FilterOption
          key={opt.value}
          label={opt[labelKey]}
          value={opt[valueKey]}
          checked={Array.isArray(value) ? value.some(item => item === opt.value) : value === opt.value}
          onChange={handleChange}
        />
      ))}
    </div>
  )
}

export default GroupSelect
