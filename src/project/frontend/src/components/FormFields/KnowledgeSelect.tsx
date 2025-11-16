import { useFetch } from '@/hooks'
import BasicService from '@/service/BasicService'
import KnowledgeService from '@/service/KnowledgeService'
import { arrayToTree } from '@/utils'
import { Tag, TreeSelect } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { addIsLeafToTree } from './utils'

interface KnowledgeSelectProps {
  params?: {
    stage_id?: number
    subject_id?: number
  }
  value?: any
  onChange?: (value: any) => void
}

export default function KnowledgeSelect({ params, value, onChange }: KnowledgeSelectProps) {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const lastParams = useRef(params)
  const loadTreeData = async ({ node }: { node: any }) => {
    try {
      setLoading(true)
      const { list: detailList } = await KnowledgeService.detailList({
        knowledge_id: node.id,
        limit: 999,
        page: 1
      })

      const tree = arrayToTree(
        detailList || [],
        node => node.id,
        node => node.parent_id
      )
      // 创建 chapterList 的副本
      const newList = list.map(chapter => ({ ...chapter }))

      // 找到目标节点
      const targetNode = newList.find(item => item.id === node.id)

      if (targetNode) {
        // 如果目标节点没有 children 属性，初始化它
        if (!targetNode.children) {
          targetNode.children = []
        }

        // 将 tree 插入到目标节点的 children 中
        targetNode.children.push(...addIsLeafToTree(tree))
      }

      setList([...newList])
    } finally {
      setLoading(false)
    }
  }

  const [nameMap] = useFetch(
    () =>
      BasicService.id2name({
        ids: value,
        id_type: 'knowledge'
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
        await KnowledgeService.list({ ...params, ...defaultParams }).then(res =>
          setList(
            res.list.map(item => ({
              ...item,
              isLeaf: false,
              selectable: false,
              checkable: false,
              key: `knowledge_${item.id}`
            }))
          )
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <TreeSelect
      showSearch={false}
      virtual={false}
      value={value}
      onChange={onChange}
      treeCheckable
      allowClear
      multiple
      notFoundContent={null}
      loading={loading}
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      tagRender={tag => {
        if (!tag.label) return <></>
        return (
          <Tag bordered={false} closeIcon={true} onClose={tag.onClose}>
            {typeof tag.label === 'string' ? tag.label : nameMap?.[tag.value]}
          </Tag>
        )
      }}
      onFocus={() => fetchSelectData()}
      treeData={list}
      loadData={node => loadTreeData({ node })}
      fieldNames={{ label: 'name', value: 'key' }}
      getPopupContainer={triggerNode => triggerNode.parentElement}
    />
  )
}
