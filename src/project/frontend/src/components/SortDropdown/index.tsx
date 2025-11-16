import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'

const getIconColor = (isActive: boolean) => {
  return isActive ? '#1890ff' : '#ccc'
}

interface SortProps {
  fieldNames?: {
    field: string
    type: string
  }
  value?: Record<string, string>
  onChange?: (value: Record<string, string>) => void
  items?: {
    key: string
    label: string
  }[]
}

function SortDropdown({
  value,
  onChange,
  fieldNames = { field: 'sort_field', type: 'sort_type' },
  items = []
}: SortProps) {
  const sortValue = typeof value === 'object' ? value : {}
  const { field, type } = fieldNames
  const fieldValue = sortValue[field]
  const typeValue = sortValue[type]

  return (
    <div className="inline-flex">
      <Dropdown.Button
        menu={{
          items,
          onClick: e => {
            onChange?.({
              [field]: e.key,
              [type]: typeValue
            })
          }
        }}
        placement="bottom"
        size="small"
        onClick={() => {
          const newTypeValue = typeValue === 'asc' ? 'desc' : typeValue === 'desc' ? '' : 'asc'
          onChange?.({
            [field]: fieldValue,
            [type]: newTypeValue
          })
        }}
      >
        {items.find(item => item.key === fieldValue)?.label}
        <div className="flex flex-col gap-0">
          <CaretUpOutlined style={{ fontSize: 12, color: getIconColor(typeValue === 'asc') }} />
          <CaretDownOutlined style={{ fontSize: 12, marginTop: '-0.3em', color: getIconColor(typeValue === 'desc') }} />
        </div>
      </Dropdown.Button>
    </div>
  )
}

export default SortDropdown
