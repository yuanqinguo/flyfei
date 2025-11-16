import { TableAction, FastColumnProps, FastTable } from  '@/components/FastTable'
import {ConfirmButton} from '@/components/ConfirmButton'

import {useModalForm} from '@/components/ModalForm'
import { Button, Flex, List, message, Popover } from 'antd'
import { useRef } from 'react'
import EditForm from './Form'
import User from '@/model/User'
import UserService from '@/service/UserService'
import EnumMap from '@/utils/constants/EnumMap'
import { EllipsisOutlined } from '@ant-design/icons'
import VirtualList from 'rc-virtual-list'
import { Authorization, hasPermission } from '@/utils/authorization'
import { ConfirmSwitch } from '@/components/ConfirmSwitch'

const PERMISSION_EDIT = 'sys-user/edit'

export default function SysUser() {
  const tableAction = useRef<TableAction>()

  const doReload = () => {
    tableAction.current?.reload()
  }

  const columns: FastColumnProps<User>[] = [
    { title: '姓名', dataIndex: 'name', formItemName: 'name_kw', showInSearch: true },
    { title: '昵称', dataIndex: 'nick_name', formItemName: 'nickname_kw', showInSearch: true },
    { title: '性别', dataIndex: 'sex', valueEnum: EnumMap.sex },
    {
      title: '所属角色',
      render(_, row) {
        const getText = (showCount?: number) => {
          return (row.roles || [])
            .slice(0, showCount)
            .map(item => item.name)
            .join('、')
        }
        const text = getText(3)
        return (
          <>
            {text}
            {text && (
              <Popover
                placement="bottom"
                content={
                  <List size="small">
                    <VirtualList data={row.roles} itemKey="id" itemHeight={20}>
                      {item => <List.Item style={{ height: '30px' }}>{item.name}</List.Item>}
                    </VirtualList>
                  </List>
                }
              >
                <Button style={{ marginLeft: '6px' }} icon={<EllipsisOutlined />} size="small"></Button>
              </Popover>
            )}
          </>
        )
      }
    },
    { title: '手机号', dataIndex: 'mobile', showInSearch: true },
    { title: '飞书昵称', dataIndex: 'lark_nickname' },
    { title: '添加时间', dataIndex: 'create_at', valueType: 'datetime' },
    { title: '最后登录时间', dataIndex: 'update_at', valueType: 'datetime' },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: EnumMap.enableStatus,
      showInSearch: true,
      render(_, row) {
        return (
          <ConfirmSwitch
            value={row.status === 1}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            disabled={!hasPermission(PERMISSION_EDIT)}
            onConfirm={async () => {
              try {
                row.id &&
                  (await UserService.update({
                    id: row.id,
                    status: row.status === -1 ? 1 : -1
                  }))
                doReload()
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
      width: 100,
      render(_, row) {
        return (
          <Authorization permission={PERMISSION_EDIT}>
            <Flex gap="small">
              <Button
                onClick={() =>
                  editFormAction.current?.onShow({
                    ...row,
                    role_ids: row.roles.map(item => item.id)
                  })
                }
                size="small"
              >
                编辑
              </Button>
              <ConfirmButton
                danger
                size="small"
                title="确认删除？"
                onConfirm={async () => {
                  row.id &&
                    (await UserService.delete({
                      id: row.id
                    }))
                  doReload()
                }}
              >
                删除
              </ConfirmButton>
            </Flex>
          </Authorization>
        )
      }
    }
  ]

  const [editFormOption, editFormAction] = useModalForm<User & { role_ids: number[] }>({
    defaultForm: {
      formData: { sex: 1 }
    },
    async onSubmit(form) {
      if (form) {
        await (form.id ? UserService.update(form) : UserService.create(form))
        doReload()
        message.success('保存成功')
      }
    }
  })
  return (
    <>
      <FastTable<User>
        actionRef={tableAction}
        bordered
        columns={columns}
        size="small"
        rowKey="id"
        request={UserService.list}
        toolBarRender={() => [
          <Authorization permission={PERMISSION_EDIT} key={'create'}>
            <Button onClick={() => editFormAction.current?.onShow()} type={'primary'}>
              新增管理员
            </Button>
          </Authorization>
        ]}
      />
      <EditForm createTitle="新增管理员" actionOption={editFormOption} actionRef={editFormAction} />
    </>
  )
}
