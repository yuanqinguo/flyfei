import { useEffect, useMemo, useState } from 'react'
import { Button, message, Switch, Flex } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { FastTable, FastColumnProps } from '@/components/FastTable'
import { ConfirmButton } from '@/components/ConfirmButton'
import { useModalForm } from '@/components/ModalForm'
import { useLoading } from '@/hooks'
import { wildcardMatchString, arrayToTree, treeToArray } from '@/utils'
import { KeyValue } from '@/utils/CommonTypes'
import EditForm from './Form'
import PermService from '@/service/PermService'
import Perm from '@/model/Perm'
import { Authorization, hasPermission } from '@/utils/authorization'

const PERMISSION_EDIT = 'sys-perm/edit'

export default function SysPerm() {
  const [searchKey, setSearchKey] = useState('')
  const [enableRowDrag, setEnableRowDrag] = useState(false)
  const [allPermission, setAllPermission] = useState<Perm[]>([])
  const treeData = useMemo(() => {
    const filterResult = allPermission.filter(a => {
      return wildcardMatchString(searchKey, a.name, a.code)
    })
    return arrayToTree<Perm>(
      filterResult,
      r => r.id,
      r => r.parent_id
    )
  }, [allPermission, searchKey])

  const idIndexMap = useMemo(() => {
    const idIndexMap: KeyValue<number> = {}
    allPermission.forEach((p, index) => (idIndexMap[p.id!] = index))
    return idIndexMap
  }, [allPermission])

  const [loading, doReload] = useLoading(() =>
    PermService.list({ limit: 999 }).then(({ list }) => setAllPermission(list.sort((a, b) => a.sort - b.sort)))
  )

  useEffect(() => {
    doReload()
  }, [])

  const [editFormOption, editFormAction] = useModalForm<Perm>({
    defaultForm: {
      formData: { type: 1 }
    },
    async onSubmit(form) {
      if (form) {
        await (form.id ? PermService.update({ list: [form] }) : PermService.create(form))
        doReload()
        message.success('保存成功')
      }
    }
  })

  const columns: FastColumnProps<Perm>[] = [
    { title: '菜单名', dataIndex: 'name', formItemName: 'name', showInSearch: true },
    { title: '权限标识', dataIndex: 'code' },
    { title: '菜单路径', dataIndex: 'page_path' },
    { title: 'API全路径', dataIndex: 'api_path' },
    { title: '类型', dataIndex: 'type', valueEnum: { 1: '菜单', 2: '功能' } },
    { title: '排序', dataIndex: 'sort' },
    { title: '描述', dataIndex: 'desc' },
    {
      title: '更新时间',
      dataIndex: 'update_at',
      valueType: 'datetime'
    },
    {
      title: '操作',
      render(_, row) {
        return (
          <Authorization permission={PERMISSION_EDIT}>
            <Flex gap="small" wrap>
              <Button
                type={'primary'}
                onClick={() => editFormAction.current?.onShow({ parent_id: row.id })}
                icon={<PlusOutlined />}
                size="small"
                ghost
              />
              <Button
                type={'primary'}
                onClick={() =>
                  editFormAction.current?.onShow({
                    ...row,
                    parent_id: row.parent_id === -1 ? undefined : row.parent_id
                  })
                }
                icon={<EditOutlined />}
                size="small"
                ghost
              />
              <ConfirmButton
                danger
                size="small"
                title="确认删除？"
                onConfirm={async () => {
                  row.id &&
                    (await PermService.updateStatus({
                      id: row.id,
                      status: -1
                    }))
                  doReload()
                }}
                icon={<DeleteOutlined />}
                ghost
              />
            </Flex>
          </Authorization>
        )
      }
    }
  ]

  return (
    <div>
      <FastTable<Perm>
        loading={loading}
        dataSource={treeData}
        size="small"
        columns={columns}
        rowKey="id"
        bordered
        options={{ reload: doReload }}
        requestImmediate={false}
        onSearch={params => setSearchKey(params?.name || '')}
        enableRowDrag={{
          enable: enableRowDrag,
          width: 90,
          title: '',
          onRowDragEnd({ source, target }) {
            const sourceIndex = idIndexMap[source.id!]
            const targetIndex = idIndexMap[target.id!]
            const sourceItem = allPermission[sourceIndex]
            const targetItem = allPermission[targetIndex]
            sourceItem.parent_id = targetItem.parent_id
            allPermission.splice(sourceIndex, 1)
            allPermission.splice(targetIndex, 0, sourceItem)
            const list = treeToArray(
              arrayToTree(
                allPermission,
                n => n.id,
                n => n.parent_id
              )
            ).map((p, index) => {
              p.sort = index
              return p
            })
            PermService.update({ list })
            setAllPermission([...allPermission])
            return arrayToTree<Perm>(
              allPermission,
              r => r.id,
              r => r.parent_id
            )
          }
        }}
        toolBarRender={() =>
          hasPermission(PERMISSION_EDIT)
            ? [
                !searchKey && (
                  <Switch
                    checked={enableRowDrag}
                    key={'drag'}
                    checkedChildren="排序"
                    unCheckedChildren="排序"
                    onChange={setEnableRowDrag}
                  />
                ),
                <Button onClick={() => editFormAction.current?.onShow()} type={'primary'} key={'create'}>
                  新增菜单
                </Button>
              ]
            : []
        }
        pagination={false}
      />
      <EditForm
        createTitle="新增菜单"
        permissions={allPermission}
        actionRef={editFormAction}
        actionOption={editFormOption}
      />
    </div>
  )
}
