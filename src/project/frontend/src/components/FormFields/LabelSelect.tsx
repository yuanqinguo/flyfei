import { useFetch } from '@/hooks'
import BasicService from '@/service/BasicService'
import LabelService from '@/service/LabelService'
import { Tag, TreeSelect } from 'antd'
import { useState } from 'react'

interface LabelSelectProps {
  params?: {
    stage_id?: number
    subject_id?: number
    scope_type?: number
  }
  value: any
  onChange?: (value: any) => void
}

export default function LabelSelect({ params, value, onChange }: LabelSelectProps) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [nameMap] = useFetch(
    () =>
      BasicService.id2name({
        ids: value,
        id_type: 'label'
      }),
    [value]
  )

  const loadLabelData = async ({ node }: { node: any }) => {
    const { list: levelTwoList } = await LabelService.customList({
      scope_type: 1,
      default_query_all: 1,
      ...params,
      parent_id: node.id,
      page: 1,
      limit: 999
      // status: 1
    })

    // 创建 List 的副本
    const newList = list.map(chapter => ({ ...chapter }))

    // 找到目标节点
    const targetNode = newList.find(item => item.id === node.id)

    if (newList.length) {
      targetNode.children = levelTwoList.map(item => ({ ...item, isLeaf: true }))
    } else {
      targetNode.isLeaf = true
    }

    setList([...newList])
  }

  const fetchSelectData = async () => {
    const defaultParams = { page: 1, limit: 999 }
    setLoading(true)

    try {
      if (!list.length) {
        await LabelService.customList({
          parent_id: -1,
          default_query_all: 1,
          ...params,
          ...defaultParams
        }).then(res => setList(res.list.map(item => ({ ...item, isLeaf: false }))))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <TreeSelect
      showSearch={false}
      value={value}
      treeCheckable
      allowClear
      multiple
      loading={loading}
      treeData={list}
      notFoundContent={null}
      loadData={node => loadLabelData({ node })}
      fieldNames={{ label: 'name', value: 'id' }}
      tagRender={tag => {
        if (!tag.label) return <></>
        return (
          <Tag bordered={false} closeIcon={true} onClose={tag.onClose}>
            {typeof tag.label === 'string' ? tag.label : nameMap?.[tag.value]}
          </Tag>
        )
      }}
      onChange={onChange}
      onFocus={() => fetchSelectData()}
      getPopupContainer={triggerNode => triggerNode.parentElement}
    />
  )
}
