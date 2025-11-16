import { FastTable} from '@/components/FastTable'
import { Button, Dropdown } from 'antd'
import { RouteName } from '@/router'
import { useRouter } from '@/hooks'
import OrderService from '@/service/OrderService'
import { OrderListProps } from './types'
import {
  useColumns,
} from './helper'
import OrderDetailsModal, { useOrderDetailsModal } from './OrderDetailsModal'
import UserDetailsModal, { useUserDetailsModal } from '@/components/UserDetailsModal'


const PERMISSION_EDIT = 'order-list/edit'

const TableList = (props: OrderListProps) => {
  const { status, params, tableAction, disableCreateActions, getExportColumns, ...restProps } = props
  const [orderDetailsModal, orderDetailsModalActions] = useOrderDetailsModal()
  const [userDetailsModalProps, userDetailsModalActions] = useUserDetailsModal()
  const columns = useColumns({
    status,
    tableAction,
    orderListProps: props,
    orderDetailsModalActions,
    userDetailsModalActions,
  })

  return (
    <>
      <FastTable
        bordered
        rowKey="id"
        columns={columns}
        scroll={{ x: 'max-content' }}
        actionRef={tableAction}
        request={form => OrderService.list({ ...form, ...params })}
      
        {...restProps}
      />
      <OrderDetailsModal {...orderDetailsModal} />
      <UserDetailsModal {...userDetailsModalProps} />
    </>
  )
}

export default TableList
