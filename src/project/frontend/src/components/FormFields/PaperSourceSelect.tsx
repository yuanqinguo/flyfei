import PaperTypeService from '@/service/PaperTypeService'
import EnumMap, { mapToOptions } from '@/utils/constants/EnumMap'
import { Cascader } from 'antd'
import { useEffect, useState } from 'react'

interface PaperSourceSelectProps {
  params?: {
    stage_id?: number
    subject_id?: number
  }
  value: any
  onChange?: (value: any) => void
}

export default function PaperSourceSelect({ value, onChange }: PaperSourceSelectProps) {
  const defaultList = mapToOptions(EnumMap.paperOrigin).map(item => ({ ...item, isLeaf: false }))
  const [list, setList] = useState<any[]>(defaultList)

  useEffect(() => {
    if (!value || !value.length || !list.length) return
    if (value.length <= 1) return
    const [origin, type] = value
    const target = list.find(item => item.value === origin)

    if (!type || target?.children?.length) return

    PaperTypeService.list({ origin_type: origin }).then(res => {
      const newList = list.map(item =>
        item.value === origin
          ? {
              ...item,
              children: res.list.map(child => ({
                ...child,
                label: child.name,
                value: child.id
              }))
            }
          : item
      )

      setList(newList)
    })
  }, [])

  const loadData = async (selectedOptions: any) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    const { list: paperTypeList } = await PaperTypeService.list({ origin_type: targetOption.value })
    if (paperTypeList.length) {
      targetOption.children = paperTypeList.map(item => ({ ...item, label: item.name, value: item.id }))
    } else {
      targetOption.isLeaf = true
    }
    setList([...list])
  }

  return (
    <Cascader
      options={list}
      value={value}
      onChange={onChange}
      loadData={loadData}
      changeOnSelect
      getPopupContainer={triggerNode => triggerNode.parentElement}
    />
  )
}
