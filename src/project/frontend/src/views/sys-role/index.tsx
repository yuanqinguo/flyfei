import { FastColumnProps, FastTable, TableAction } from '@/components/FastTable'
import { useModalForm } from '@/components/ModalForm'

import { Button, message, Flex, Popover, Tree } from 'antd'
import Role from '@/model/Role'
import { useMemo, useRef, useState } from 'react'
import { EllipsisOutlined } from '@ant-design/icons'
import EditForm from './Form'
import RoleService from '@/service/RoleService'
import { useFetch } from '@/hooks'
import PermService from '@/service/PermService'
import Perm from '@/model/Perm'
import FunctionPermForm, { IFunctionPermForm } from './FunctionPermForm'
import { arrayToTree, filterTree } from '@/utils'
import UserListModal from './UserListModal'
import { Authorization, hasPermission } from '@/utils/authorization'
import { ConfirmSwitch } from '@/components/ConfirmSwitch'
import EnumMap from '@/utils/constants/EnumMap'

const PERMISSION_EDIT = 'sys-role/edit'

type TreeData = {
  children?: TreeData[]
  id: number
  name: string
  level?: number
  [key: string]: any
}

/**
 * 根据 id 获取树的名字
 * @param tree
 * @param ids
 * @returns
 */
const getNamesByIds = (tree: TreeData[], ids: number[], filter: (node: TreeData) => any = node => node): string[] => {
  const names: string[] = []
  const traverse = (node: TreeData): void => {
    const newPath = node.name
    if (ids.includes(node.id) && filter(node)) {
      names.push(newPath)
    }
    if (node.children) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }
  for (const node of tree) {
    traverse(node)
  }
  return names
}

const TreeTable: React.FC<{ tree: TreeData[]; ids?: number[] }> = ({ tree, ids }) => {
  const treeData = useMemo(() => (ids ? filterTree(tree, ids, { valueKey: 'id' }) : tree), [tree, ids])

  /* @ts-ignore */
  return <Tree fieldNames={{ title: 'name', children: 'children' }} treeData={treeData}></Tree>
}

export default function SysRole() {
  const tableAction = useRef<TableAction>()
  const [allPermission] = useFetch<Perm[]>(() => PermService.list({ limit: 999 }).then(res => res.list))
  const permissionTreeData = useMemo(() => {
    if (!allPermission) return []
    return arrayToTree(
      allPermission.sort((a, b) => a.sort - b.sort),
      item => item.id,
      item => item.parent_id,
      {
        setLevel: true
      }
    )
  }, [allPermission])
  const [roleId, setRoleId] = useState<number>()
  const [showUserList, setShowUserList] = useState<boolean>()

  const doReload = () => {
    tableAction.current?.reload()
  }

  const [editFormOption, editFormAction] = useModalForm<Role>({
    async onSubmit(form) {
      if (form) {
        await (form.id ? RoleService.update(form) : RoleService.create(form))
        doReload()
        message.success('保存成功')
      }
    }
  })
  const [functionPermFormOption, functionPermFormAction] = useModalForm<IFunctionPermForm>({
    async onSubmit(form) {
      if (form) {
        const { perm_ids, id } = form
        await RoleService.permSets({ perm_ids, role_id: id })
        doReload()
        message.success('保存成功')
      }
    }
  })
  const [dataPermFormOption, dataPermFormAction] = useModalForm<Role>({
    async onSubmit(form) {
      if (form) {
        const { id, data_perms } = form
        await RoleService.auditSetDataPerm({ audits: data_perms, role_id: id })
        doReload()
        message.success('保存成功')
      }
    }
  })

  const columns: FastColumnProps<Role>[] = [
    { title: '角色名称', dataIndex: 'name', formItemName: 'name_kw', showInSearch: true },
    { title: '角色描述', dataIndex: 'desc' },
    {
      title: '功能权限',
      render(_, row) {
        const names = getNamesByIds(
          (permissionTreeData || []).filter(item => item.type === 1),
          row.perms
            ?.filter(item => allPermission?.some(p => p.type === 1 && item.perm_id === p.id))
            .map(item => item.perm_id) || [],
          node => node.page_path
        )
        const text = names.slice(0, 3).join('、') + (names.length > 3 ? `等${names.length}个` : '')
        return (
          <>
            {text}
            {text && (
              <Popover
                placement="bottom"
                content={<TreeTable tree={permissionTreeData || []} ids={row.perms?.map(item => item.perm_id) || []} />}
              >
                <Button style={{ marginLeft: '6px' }} icon={<EllipsisOutlined />} size="small"></Button>
              </Popover>
            )}
          </>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: EnumMap.enableStatus,
      showInSearch: true,
      render(_, record) {
        return (
          <ConfirmSwitch
            value={record.status === 1}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            disabled={!hasPermission(PERMISSION_EDIT)}
            onConfirm={async () => {
              try {
                await RoleService.update({
                  id: record.id,
                  status: record.status === 1 ? -1 : 1
                })
                tableAction.current?.reload()
                message.success('操作成功')
              } catch (e) {
                console.error(e)
              }
            }}
          />
        )
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 430,
      render(_, row) {
        return (
          <Authorization permission={PERMISSION_EDIT}>
            <Flex wrap gap="small">
              <Button onClick={() => editFormAction.current?.onShow(row)} size="small">
                编辑
              </Button>
              <Button
                onClick={() =>
                  functionPermFormAction.current?.onShow({
                    ...row,
                    perm_ids: row.perms?.map(item => item.perm_id) || []
                  })
                }
                size="small"
              >
                功能权限配置
              </Button>

              <Button
                onClick={() => {
                  setRoleId(row.id)
                  setShowUserList(true)
                }}
                size="small"
              >
                管理员
              </Button>
            </Flex>
          </Authorization>
        )
      }
    }
  ]
  return (
    <>
      <FastTable<Role>
        bordered
        actionRef={tableAction}
        columns={columns}
        size="small"
        rowKey="id"
        formCache={'SYS_ROLE_LIST'}
        request={params => RoleService.list({ ...params, default_query_all: 1 })}
        toolBarRender={() => [
          <Authorization permission={PERMISSION_EDIT} key={'create'}>
            <Button onClick={() => editFormAction.current?.onShow()} type={'primary'}>
              新增角色
            </Button>
          </Authorization>
        ]}
      />
      <EditForm createTitle="新增角色" actionOption={editFormOption} actionRef={editFormAction} />
      <FunctionPermForm
        editTitle="功能权限配置"
        actionOption={functionPermFormOption}
        actionRef={functionPermFormAction}
        permissions={allPermission}
      />
      <UserListModal id={roleId} open={showUserList} onCancel={() => setShowUserList(false)} />
    </>
  )
}
