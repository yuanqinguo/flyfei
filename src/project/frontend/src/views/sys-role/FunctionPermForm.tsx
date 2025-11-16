import { ModalForm, ModalFormProps } from '@/components/ModalForm'
import { Form, Input, Tree, TreeProps } from 'antd'
import Role from '@/model/Role'
import Perm from '@/model/Perm'
import { useMemo } from 'react'
import { arrayToTree } from '@/utils'

interface TreePanelSelectProps {
  value?: any[]
  onChange?: (value: any[]) => void
}

const TreePanelSelect = ({ value, onChange, treeData }: TreePanelSelectProps & TreeProps) => {
  return (
    <Tree
      checkable
      checkStrictly
      onCheck={value => {
        const keys = Array.isArray(value) ? value : value.checked
        onChange?.(keys as number[])
      }}
      checkedKeys={value}
      treeData={treeData}
    />
  )
}

export type IFunctionPermForm = Role & {
  perm_ids: number[]
}

type ModalProps = ModalFormProps<IFunctionPermForm> & { permissions?: Perm[] }

export default ({ permissions, ...props }: ModalProps) => {
  const treeData = useMemo(() => {
    return arrayToTree(
      permissions?.map(item => ({
        title: item.name,
        value: item.id,
        key: item.id,
        parentId: item.parent_id,
        checkable: true,
        sort: item.sort
      })) || [],
      item => item.value,
      item => item.parentId
    ).sort((a, b) => a.sort - b.sort)
  }, [permissions])

  return (
    <ModalForm {...props}>
      <Form.Item label="角色名称" name="name">
        <Input disabled />
      </Form.Item>
      <Form.Item label="角色描述" name="desc">
        <Input.TextArea disabled />
      </Form.Item>
      <Form.Item label="角色功能权限" name="perm_ids">
        <TreePanelSelect treeData={treeData} />
      </Form.Item>
    </ModalForm>
  )
}
