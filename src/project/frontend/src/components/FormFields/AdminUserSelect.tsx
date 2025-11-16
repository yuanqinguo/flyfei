import { useLoading } from '@/hooks'
import Teacher from '@/model/Teacher'
import UserService from '@/service/UserService'
import { Select, SelectProps } from 'antd'
import { useEffect, useState } from 'react'

interface AdminUserSelectProps extends SelectProps {
  value?: number
  onChange?: (value: number) => void
}

const AdminUserSelect = ({ value, onChange }: AdminUserSelectProps) => {
  const [options, setOptions] = useState<Teacher[]>([])

  const [loading, fetchTeacherList] = useLoading(async (params?: Record<string, any>) => {
    const { list } = await UserService.list({ status: 1, limit: 9999, unlimited: true, ...params })
    setOptions(list || [])
  })

  useEffect(() => {
    fetchTeacherList()
  }, [])

  return (
    <Select
      loading={loading}
      value={value}
      allowClear
      onChange={onChange}
      options={options}
      fieldNames={{ label: 'name', value: 'id' }}
      onFocus={() => {
        if (options.length > 0) return
        fetchTeacherList()
      }}
      onSearch={value => {
        if (value) {
          fetchTeacherList({ name_kw: value })
        }
      }}
    />
  )
}

export default AdminUserSelect
