import useUrlState from '@ahooksjs/use-url-state'
import { Tabs } from 'antd'
import { OrderStatus } from '@/utils/constants/Order'
import { useRef } from 'react'
import { TableAction } from '@/components/FastTable'
import TableList from './TableList'
import EnumMap from '@/utils/constants/EnumMap'

type ActionType = React.MutableRefObject<TableAction | undefined>

function OrderList({
  channelId,
  disableCreateActions,
  isChannel,
  hiddenTabs
}: {
  channelId?: number
  disableCreateActions?: boolean
  isChannel?: boolean
  hiddenTabs?: OrderStatus[]
}) {
  const [activeTab, setActiveTab] = useUrlState({ status: `${OrderStatus.All}` })
  const tabActions = useRef<Record<number, ActionType>>({
    [OrderStatus.All]: useRef<TableAction>(),
    [OrderStatus.Pending]: useRef<TableAction>(),
    [OrderStatus.Paid]: useRef<TableAction>(),
    [OrderStatus.Shipped]: useRef<TableAction>(),
    [OrderStatus.Canceled]: useRef<TableAction>(),
    [OrderStatus.Refunded]: useRef<TableAction>(),
    [OrderStatus.Recycled]: useRef<TableAction>()
  })
  const buildParams = (status?: OrderStatus) => ({
    // channelId 有值是才传递，否则表单筛选字段会被覆盖
    ...(status ? { status_list: `${status}` } : {}),
    ...(channelId ? { channel_id: channelId } : {})
  })
  const items = [
    {
      key: `${OrderStatus.All}`,
      label: '全部',
      children: (
        <TableList
          status={OrderStatus.All}
          tableAction={tabActions.current[OrderStatus.All]}
          params={buildParams()}
          formCache={`ORDER_LIST_${OrderStatus.All}`}
          disableCreateActions={disableCreateActions}
          isChannel={isChannel}
        />
      )
    },
    {
      key: `${OrderStatus.Pending}`,
      label: '待支付',
      children: (
        <TableList
          status={OrderStatus.Pending}
          disableCreateActions
          tableAction={tabActions.current[OrderStatus.Pending]}
          params={buildParams(OrderStatus.Pending)}
          formCache={`ORDER_LIST_${OrderStatus.Pending}`}
          isChannel={isChannel}
        />
      )
    },
    {
      key: `${OrderStatus.Paid}`,
      label: '已支付',
      children: (
        <TableList
          status={OrderStatus.Paid}
          disableCreateActions
          tableAction={tabActions.current[OrderStatus.Paid]}
          params={buildParams(OrderStatus.Paid)}
          formCache={`ORDER_LIST_${OrderStatus.Paid}`}
          isChannel={isChannel}
        />
      )
    },
    {
      key: `${OrderStatus.Shipped}`,
      label: '已发货',
      children: (
        <TableList
          status={OrderStatus.Shipped}
          disableCreateActions
          tableAction={tabActions.current[OrderStatus.Shipped]}
          params={buildParams(OrderStatus.Shipped)}
          formCache={`ORDER_LIST_${OrderStatus.Shipped}`}
          isChannel={isChannel}
        />
      )
    },
    {
      key: `${OrderStatus.Canceled}`,
      label: '已取消',
      children: (
        <TableList
          status={OrderStatus.Canceled}
          disableCreateActions
          tableAction={tabActions.current[OrderStatus.Canceled]}
          params={buildParams(OrderStatus.Canceled)}
          formCache={`ORDER_LIST_${OrderStatus.Canceled}`}
          isChannel={isChannel}
          getExportColumns={columns => [
            ...columns,
            {
              title: '取消时间',
              dataIndex: 'cancel_at',
              valueType: 'datetimeRange'
            },
            {
              title: '取消人',
              dataIndex: 'cancel_name'
            },
            {
              title: '取消类型',
              dataIndex: 'cancel_type',
              valueEnum: EnumMap.orderCancelType
            }
          ]}
        />
      )
    },
    {
      key: `${OrderStatus.Refunded}`,
      label: '已退款',
      children: (
        <TableList
          status={OrderStatus.Refunded}
          disableCreateActions
          tableAction={tabActions.current[OrderStatus.Refunded]}
          params={buildParams(OrderStatus.Refunded)}
          formCache={`ORDER_LIST_${OrderStatus.Refunded}`}
          isChannel={isChannel}
        />
      )
    },
    {
      key: `${OrderStatus.Recycled}`,
      label: '已回收',
      children: (
        <TableList
          status={OrderStatus.Recycled}
          disableCreateActions
          tableAction={tabActions.current[OrderStatus.Recycled]}
          params={buildParams(OrderStatus.Recycled)}
          formCache={`ORDER_LIST_${OrderStatus.Recycled}`}
          isChannel={isChannel}
        />
      )
    }
  ].filter(item => !hiddenTabs?.includes(Number(item.key)))

  return (
    <Tabs
      activeKey={activeTab.status}
      items={items}
      onChange={v => {
        setActiveTab({ status: v })
        const currentTable = tabActions.current[Number(v)]
        if (currentTable.current) {
          currentTable.current?.reload()
        }
      }}
    />
  )
}

export default OrderList
