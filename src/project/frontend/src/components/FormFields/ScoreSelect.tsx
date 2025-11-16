import useScoreList from '@/hooks/useScoreList'
import { Select, SelectProps } from 'antd'

interface SourceSelectProps extends SelectProps {
  params?: {
    stage_id?: number
    subject_id?: number
  }
  value?: any
  onChange?: (value: any) => void
}

export default function ScoreSelect({ params, value, onChange, ...rest }: SourceSelectProps) {
  const scoreList = useScoreList(params?.subject_id)

  return (
    <Select
      value={value}
      allowClear
      options={scoreList}
      fieldNames={{ label: 'name', value: 'id' }}
      showSearch
      filterOption={false}
      onChange={onChange}
      getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
      {...rest}
    />
  )
}
