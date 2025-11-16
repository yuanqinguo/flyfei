import { Modal, ModalProps } from 'antd'
import User from '@/model/User'
import UserService from '@/service/UserService'
import { FastColumnProps, FastTable, TableAction } from '@/components/FastTable'
import { useEffect, useRef } from 'react'
import EnumMap from '@/utils/constants/EnumMap'

export default ({ id, open, ...props }: ModalProps & { id?: number }) => {
  const tableAction = useRef<TableAction>()
  const columns: FastColumnProps<User>[] = [
    { title: '姓名', dataIndex: 'name', formItemName: 'name_kw', showInSearch: true },
    { title: '性别', dataIndex: 'sex', valueEnum: EnumMap.sex },
    { title: '手机号', dataIndex: 'mobile' },
    { title: '添加时间', dataIndex: 'create_at', valueType: 'datetime' },
    { title: '最后登录时间', dataIndex: 'update_at', valueType: 'datetime' },
    { title: '状态', dataIndex: 'status', valueEnum: EnumMap.enableStatus }
  ]

  useEffect(() => {
    if (id && open) {
      tableAction.current?.reload({ role_id: id })
    }
  }, [id, open])

  return (
    <Modal
      styles={{
        body: {
          paddingTop: '30px'
        }
      }}
      open={open}
      width={1000}
      footer={null}
      {...props}
    >
      <FastTable<User>
        actionRef={tableAction}
        formCache={false}
        rowKey="id"
        size="small"
        columns={columns}
        isCard={false}
        requestImmediate={false}
        request={form => UserService.list({ role_id: id, ...form })}
      ></FastTable>
    </Modal>
  )
}
