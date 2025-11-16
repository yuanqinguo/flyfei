import { FastColumnProps, FastTable,  TableAction,  } from '@/components/FastTable'
import { Button, DatePicker, Form, Image, message, Space } from 'antd'
import { useRef } from 'react'
import EnumMap from '@/utils/constants/EnumMap'
import CustomerService from '@/service/CustomerService'
import { Customer } from '@/model/Customer'
import { Authorization, hasPermission } from '@/utils/authorization'
import { ConfirmSwitch } from '@/components/ConfirmSwitch'
import dayjs from 'dayjs'
import UserDetailsModal, { useUserDetailsModal } from '@/components/UserDetailsModal'
import { useAppSelector } from '@/store'

const PERMISSION_EDIT = 'user/edit'

export default function UserView() {
  const [form] = Form.useForm()

  const tableAction = useRef<TableAction>()
  const [userDetailsModalProps, userDetailsModalActions] = useUserDetailsModal()
  const { subjectList } = useAppSelector(state => state.baseData)

  const doReload = () => {
    tableAction.current?.reload()
  }

  const columns: FastColumnProps<Customer>[] = [
    { title: '用户ID', dataIndex: 'user_id' },
 
    { title: '用户昵称', dataIndex: 'nick_name', showInSearch: true },
   
    { title: '手机号码', dataIndex: 'mobile', showInSearch: true },

    {
      title: '注册日期',
      dataIndex: 'create_at',
      showInSearch: true,
      isNamesFormItem: true,
      formItemName: ['start_time', 'end_time'],
      valueType: 'datetimeRange',
      formItemFieldProps: {
        showTime: false
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: EnumMap.enableStatus,
      render(_, row) {
        return (
          <ConfirmSwitch
            value={row.status === 1}
            checkedChildren="启用"
            unCheckedChildren="冻结"
            disabled={!hasPermission(PERMISSION_EDIT)}
            onConfirm={async () => {
              try {
                if (!row.user_id) return
                await CustomerService.updateUser({
                  id: row.user_id,
                  status: row.status === 1 ? -1 : 1
                })
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
          <Space>
            <Button
              size="small"
              onClick={() => {
                window.open(`/order-list?user_id=${row.user_id}`, '_blank')
              }}
            >
              用户订单
            </Button>
          </Space>
        )
      }
    }
  ]


  return (
    <>
      <FastTable<Customer>
        formProps={{ form }}
        actionRef={tableAction}
        bordered
        columns={columns}
        size="small"
        rowKey="user_id"
        request={CustomerService.list}
      />
      <UserDetailsModal {...userDetailsModalProps} />
    </>
  )
}
