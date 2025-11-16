import { useFetch } from '@/hooks'
import BasicService from '@/service/BasicService'
import QuestionTypesService from '@/service/QuestionTypesService'
import { Select, SelectProps } from 'antd'
import { useState } from 'react'

interface LabelInValueType {
  label: React.ReactNode
  value: string | number
  /** @deprecated `key` is useless since it should always same as `value` */
  key?: React.Key
}

interface QuesTypeSelectProps extends SelectProps {
  params?: {
    stage_id?: number
    subject_id?: number
  }
  value: any
  onChange?: (value: any) => void
}

export default function QuesTypeSelect({ params, value, onChange }: QuesTypeSelectProps) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [nameMap] = useFetch(
    () =>
      BasicService.id2name({
        ids: [value],
        id_type: 'ques_type'
      }),
    [value]
  )

  const fetchSelectData = async () => {
    const defaultParams = { page: 1, limit: 999 }
    setLoading(true)
    try {
      await QuestionTypesService.list({ ...defaultParams, ...params }).then(res => setList(res.list))
    } finally {
      setLoading(false)
    }
  }

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
      onChange={onChange}
      onFocus={() => fetchSelectData()}
      getPopupContainer={triggerNode => triggerNode.parentElement}
    />
  )
}
