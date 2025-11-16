import { useFetch } from '@/hooks'
import BasicService from '@/service/BasicService'
import GradeService from '@/service/GradeService'
import { Select } from 'antd'
import { useEffect, useRef, useState } from 'react'

interface LabelInValueType {
  label: React.ReactNode
  value: string | number
  /** @deprecated `key` is useless since it should always same as `value` */
  key?: React.Key
}

interface GradeSelectProps {
  params?: {
    stage_id?: number
    subject_id?: number
  }
  value: any
  onChange?: (value: any) => void
}

export default function GradeSelect({ params, value, onChange }: GradeSelectProps) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const lastParams = useRef(params)

  const [nameMap] = useFetch(
    () =>
      BasicService.id2name({
        ids: [value],
        id_type: 'grade'
      }),
    [value]
  )

  useEffect(() => {
    if (JSON.stringify(lastParams.current || {}) !== JSON.stringify(params || {})) {
      setList([])
    }
  }, [params])

  const fetchSelectData = async () => {
    const defaultParams = { page: 1, limit: 999 }
    setLoading(true)

    try {
      if (!list.length) {
        lastParams.current = params
        await GradeService.list({ ...params, ...defaultParams }).then(res => setList(res.list))
      }
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
