import React, { createContext, useContext, FC, ReactNode, useState } from 'react'
import { Input, InputProps } from 'antd'
import GroupSelect from './GroupSelect'

interface FilterBarContextType {
  value: Record<string, any>
  labelWidth: number
  onChange: (key: string, value: any) => void
}

const FilterBarContext = createContext<FilterBarContextType | undefined>(undefined)

interface FilterBarItemProps {
  title: string
  valueField: string
  uncheck?: boolean
  valueType: 'text' | 'select'
  options?: Array<Record<string, any>>
  fieldNames?: { label: string; value: string }
  placeholder?: string
  multiple?: boolean
  showAllOption?: boolean
}

interface FilterInputProps extends InputProps {
  onValueChange: (value: string | undefined) => void
}

const FilterInput = (props: FilterInputProps) => {
  const { defaultValue, onValueChange, ...restProps } = props
  const [value, setValue] = useState(defaultValue || '')

  return (
    <Input.Search
      onSearch={value => onValueChange?.(value)}
      value={value}
      onChange={e => setValue(e.target.value)}
      className="w-[300px]"
      {...restProps}
    />
  )
}

const FilterBarItem: FC<FilterBarItemProps> = ({
  title,
  valueField,
  valueType,
  options = [],
  fieldNames = { label: 'label', value: 'value' },
  placeholder,
  multiple = false,
  showAllOption = true,
  uncheck = true
}) => {
  const context = useContext(FilterBarContext)

  if (!context) {
    console.error('FilterBar.Item must be used within a FilterBar component')
    return null
  }

  const { value, labelWidth, onChange } = context
  const currentValue = value[valueField] || null

  const handleSelectChange = (newValue: any) => {
    onChange(valueField, newValue)
  }

  const renderInput = () => {
    switch (valueType) {
      case 'text':
        return (
          <FilterInput
            placeholder={placeholder || `请输入${title}`}
            defaultValue={currentValue}
            onValueChange={value => {
              onChange(valueField, value)
            }}
            allowClear
          />
        )
      case 'select':
        const selectOptions = options.map(option => ({
          label: option[fieldNames.label],
          value: option[fieldNames.value]
        }))
        if (showAllOption) {
          selectOptions.unshift({
            label: '全部',
            value: null
          })
        }
        return (
          <GroupSelect
            uncheck={uncheck}
            value={currentValue}
            onChange={handleSelectChange}
            options={selectOptions}
            multiple={multiple}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center space-x-3 last:pb-0">
      <span className="shrink-0 whitespace-nowrap text-end text-sm text-gray-500" style={{ width: `${labelWidth}px` }}>
        {title}:
      </span>
      <div className="min-w-0 flex-1">{renderInput()}</div>
    </div>
  )
}

interface FilterBarProps {
  value: Record<string, any>
  onChange: (key: string, value: any) => void
  children: ReactNode
  className?: string
  labelWidth?: number
}

type FilterBarComponent = FC<FilterBarProps> & {
  Item: FC<FilterBarItemProps>
}

const FilterBar: FilterBarComponent = ({ value, onChange, children, className, labelWidth = 80 }) => {
  return (
    <FilterBarContext.Provider value={{ value, onChange, labelWidth }}>
      <div className={`flex flex-col gap-4 ${className || ''}`}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === FilterBarItem) {
            return <div className="last:mb-0">{child}</div>
          }
          return child
        })}
      </div>
    </FilterBarContext.Provider>
  )
}

FilterBar.Item = FilterBarItem

export default FilterBar
