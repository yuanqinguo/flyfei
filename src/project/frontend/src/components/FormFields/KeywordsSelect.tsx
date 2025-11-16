import KeywordAdminService from '@/service/KeywordAdminService'
import KeywordContentService from '@/service/KeywordContentService'
import { useDebounceFn } from 'ahooks'
import { Select, SelectProps } from 'antd'
import { useState } from 'react'

interface KeywordsSelectProps extends SelectProps {
  params?: {
    subject_id?: number
    stage_id?: number
  }
  /**
   * 接口调用类型
   * @default `content`
   */
  type?: 'content' | 'admin'
  value?: any
  onChange?: (value: any) => void
}

export default function KeywordsSelect({
  params,
  value,
  type = 'content',
  onChange,
  ...restProps
}: KeywordsSelectProps) {
  const [options, setOptions] = useState<SelectProps['options']>([])

  const { run: fetchOptions } = useDebounceFn(
    async (keyword: string) => {
      const Service = type === 'content' ? KeywordContentService : KeywordAdminService
      const { list } = await Service.list({ keyword, ...params })
      setOptions(list.map(item => ({ label: item.name, value: item.name })))
    },
    { wait: 300, leading: false }
  )

  return (
    <Select
      value={value}
      onChange={onChange}
      allowClear
      mode="tags"
      style={{ width: '100%' }}
      placeholder="请输入关键词"
      showSearch
      onSearch={value => fetchOptions(value)}
      optionFilterProp="label"
      options={options}
      {...restProps}
    />
  )
}
