import { useLoading } from '@/hooks'
import Teacher from '@/model/Teacher'
import TeacherService from '@/service/TeacherService'
import { Select, SelectProps } from 'antd'
import { useEffect, useState } from 'react'

interface TeacherSelectProps extends SelectProps {
  value?: number
  onChange?: (value: number) => void
}

const TeacherSelect = ({ value, onChange }: TeacherSelectProps) => {
  const [options, setOptions] = useState<Teacher[]>([])

  const [loading, fetchTeacherList] = useLoading(async (params?: Record<string, any>) => {
    const { list } = await TeacherService.list({ status: 1, limit: 9999, unlimited: true, ...params })
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

export default TeacherSelect
