import { useFetch } from '@/hooks'
import BasicService from '@/service/BasicService'
import QuesSourceService from '@/service/QuesSourceService'
import { useDebounceFn } from 'ahooks'
import { Select } from 'antd'
import { useState } from 'react'

interface LabelInValueType {
  label: React.ReactNode
  value: string | number
  /** @deprecated `key` is useless since it should always same as `value` */
  key?: React.Key
}

interface SourceSelectProps {
  params?: {
    stage_id?: number
    subject_id?: number
  }
  value: any
  onChange?: (value: any) => void
}

export default function SourceSelect({ params, value, onChange }: SourceSelectProps) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [nameMap] = useFetch(
    () =>
      BasicService.id2name({
        ids: [value],
        id_type: 'ques_source'
      }),
    [value]
  )

  const fetchSelectData = useDebounceFn(
    async (args?: Record<string, any>) => {
      const defaultParams = { page: 1, limit: 999 }
      setLoading(true)

      try {
        await QuesSourceService.quesSourceList({ ...params, ...defaultParams, ...args }).then(res => setList(res.list))
      } finally {
        setLoading(false)
      }
    },
    { wait: 500, leading: true }
  ).run

  return (
    <Select
      value={value}
      allowClear
      loading={loading}
      options={list}
      fieldNames={{ label: 'name', value: 'id' }}
      labelRender={(props: LabelInValueType) => (
        <div> {typeof props.label === 'string' ? props.label : nameMap?.[props.value]}</div>
      )}
      onSearch={(value: string) => fetchSelectData({ name_kw: value })}
      showSearch
      filterOption={false}
      onChange={onChange}
      onFocus={() => {
        if (list.length > 0) return

        fetchSelectData()
      }}
      getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
    />
  )
}
