import { Button, Empty, Flex, Input, message, Space, Spin, Tooltip, Tree, type TreeProps } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { ConfirmButton } from '@/components/ConfirmButton'
import { useMemo, useState } from 'react'
import { BasicDataNode } from 'antd/es/tree'

import './index.scss'

export interface BasicEditDataNode extends BasicDataNode {
  id: number
  name?: string
  level?: number
}

interface EditTreeProps<T extends BasicEditDataNode> extends TreeProps<T> {
  treeData?: T[]
  loading?: boolean
  editable?: boolean
  emptyText?: string
  onAddClick?: (node?: T) => void
  onCancelClick?: (node?: T) => void
  onAddConfirm?: (node: T) => void
  onEditConfirm?: (node: T) => void
  onDeleteConfirm?: (node: T) => void
  onChange?: (node: T, value: string) => void
  renderNodeTitle?: (node: T) => React.ReactNode
  renderBottom?: React.ReactNode | ((params: { editingId: number | null }) => React.ReactNode)
  renderTop?: React.ReactNode | ((params: { editingId: number | null }) => React.ReactNode)
  hasAddingNode?: boolean
  clickTitleCopy?: boolean
  hideBtn?: boolean
}

interface EditTreeTitleProps<T extends BasicEditDataNode> extends Omit<EditTreeProps<T>, 'treeData'> {
  node: T
  editingId: number | null
  setEditingId: (value: number | null) => void
  hasAddingNode?: boolean
  hideBtn?: boolean
}

const TreeNodeTitle = <T extends BasicEditDataNode>(props: EditTreeTitleProps<T>) => {
  const {
    node,
    editable = true,
    editingId,
    hasAddingNode,
    clickTitleCopy = true,
    disabled,
    hideBtn,
    setEditingId,
    onAddClick,
    onCancelClick,
    onAddConfirm,
    onEditConfirm,
    onDeleteConfirm,
    onChange
  } = props
  const [inputValue, setInputValue] = useState(node.name)
  const isAdd = useMemo(() => node.name === '', [node])
  const isEditing = useMemo(() => editingId === node.id, [editingId, node])
  const onInputChange = (value: string) => {
    setInputValue(value)
    onChange?.(node, value)
  }

  const onConfirm = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (!inputValue) {
      message.warning('请输入内容')
      return
    }
    if (inputValue === node.name) {
      setEditingId(null)
      return
    }
    const newNode = { ...node, name: inputValue }

    if (isAdd) {
      onAddConfirm?.(newNode)
    }
    if (editingId) {
      onEditConfirm?.(newNode)
      setEditingId(null)
    }
  }

  const onCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)

    if (isAdd) {
      onCancelClick?.(node)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    if (editingId || isAdd || hasAddingNode) {
      message.warning('请先保存正在编辑的节点')
      return
    }
    e.stopPropagation()
    if (!inputValue || inputValue !== node.name) {
      setInputValue(node.name)
    }
    setEditingId(node.id)
  }

  const handleAddClick = (e: React.MouseEvent) => {
    if (editingId || isAdd) {
      message.warning('请先保存正在编辑的节点')
      return
    }
    e.stopPropagation()
    onAddClick?.(node)
  }

  const NodeTitle = () => <div className="max-w-[200px] flex-1 truncate px-2 py-1">{node.name}</div>
  if (props.draggable) {
    return <NodeTitle />
  }

  const showBtns = editable && !disabled && !hideBtn

  return (
    <div className="group flex items-center gap-2">
      <div className="flex-1">
        {isEditing || isAdd ? (
          <Input
            autoFocus
            value={inputValue}
            onPressEnter={onConfirm}
            onInput={e => e.stopPropagation()}
            onChange={e => onInputChange(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <NodeTitle />
        )}
      </div>

      {showBtns && (
        <div onClick={e => e.stopPropagation()}>
          {isAdd || isEditing ? (
            <div className="flex gap-1">
              <Button size="small" type="text" className="text-primary" onClick={onConfirm}>
                确定
              </Button>
              <Button size="small" type="text" onClick={onCancel}>
                取消
              </Button>
            </div>
          ) : (
            <div className="invisible flex gap-2 group-hover:visible">
              {node?.level && node.level < 6 && (
                <Button
                  className="text-primary"
                  type={'text'}
                  onClick={handleAddClick}
                  icon={<PlusOutlined />}
                  size="small"
                />
              )}
              <Button
                className="text-primary"
                type={'text'}
                onClick={handleEditClick}
                icon={<EditOutlined />}
                size="small"
              />
              <ConfirmButton
                danger
                size="small"
                type="text"
                title="删除该节点将同时删除其所有子节点，确认删除吗？"
                onClick={e => e.stopPropagation()}
                onConfirm={e => {
                  e?.stopPropagation()
                  onDeleteConfirm?.(node)
                }}
                onCancel={e => e?.stopPropagation()}
                icon={<DeleteOutlined />}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const EditTree = <T extends BasicEditDataNode>(props: EditTreeProps<T>) => {
  const {
    treeData,
    emptyText,
    loading,
    renderNodeTitle,
    renderBottom,
    renderTop,
    hasAddingNode,
    hideBtn,
    ...restProps
  } = props
  const [editingId, setEditingId] = useState<number | null>(null)
  const isEmpty = treeData?.length === 0
  return (
    <Spin spinning={loading || false} className="h-full">
      <Flex className="h-full" vertical gap={treeData?.length ? 'middle' : ''}>
        {renderTop ? (typeof renderTop === 'function' ? renderTop({ editingId }) : renderTop) : null}
        {isEmpty ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText || '暂无数据'} />
        ) : (
          <Tree
            fieldNames={{
              key: 'id',
              title: 'name'
            }}
            className="tree-form"
            blockNode
            showLine
            treeData={treeData}
            titleRender={node =>
              renderNodeTitle ? (
                renderNodeTitle(node)
              ) : (
                <TreeNodeTitle<T>
                  hasAddingNode={hasAddingNode}
                  editingId={editingId}
                  hideBtn={hideBtn}
                  setEditingId={setEditingId}
                  node={node}
                  {...restProps}
                />
              )
            }
            disabled={false}
            {...restProps}
          />
        )}
        {renderBottom ? (typeof renderBottom === 'function' ? renderBottom({ editingId }) : renderBottom) : null}
      </Flex>
    </Spin>
  )
}

export default EditTree
