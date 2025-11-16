import { FastColumnProps, FastTable, TableAction } from '@/components/FastTable'
import { OrderItem, OrderListParams } from '@/model/Order'
import { Button, Image, message, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import EnumMap, { mapToOptions } from '@/utils/constants/EnumMap'
import {  OrderStatus } from '@/utils/constants/Order'
import OrderService from '@/service/OrderService'
import { MutableRefObject, useEffect } from 'react'
import { OrderDetailsModalActions } from './OrderDetailsModal'
import { OrderRefundModalActions } from './OrderRefundModal'
import { OrderRecycleModalActions } from './OrderRecycleModal'
import {
  OrderRecycleParams,
  OrderRefundParams,
  CancelGiftParams,
  OrderPriceChangeParams,
  VisibleColumn,
  OrderTransferParams,
  OrderGapParams,
  OrderListProps
} from './types'
import dayjs from 'dayjs'
import { arrayToObject } from '@/utils'
import { useAppSelector } from '@/store'
import Price from '@/components/Price'
import { hasPermission } from '@/utils/authorization'
import { LogisticsOrder } from './Receiver'
import { omit } from 'lodash'
import { UserDetailsModalActions } from '@/components/UserDetailsModal'
import { Customer } from '@/model/Customer'
import ActionButtons, { ActionButtonItem } from '@/components/ActionButtons'
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { OrderSettleStatus } from '@/utils/constants/Channel'
import MathUtils from '@/utils/math'
import { fenToYuan } from '@/utils/business'
const PERMISSION_EDIT = 'order-list/edit'

const statusColorMap = {
  [OrderStatus.All]: '#4e5969', // 默认中性色
  [OrderStatus.Pending]: '#f90', // 警告色（待处理）
  [OrderStatus.Paid]: '#19be6b', // 成功色（已支付）
  [OrderStatus.Canceled]: '#aaa', // 错误色（已取消）
  [OrderStatus.Refunded]: '#d9363e', // 错误加强色（全额退款）
  [OrderStatus.Shipped]: '#3491fa', // 新增：信息蓝色（已发货）
  [OrderStatus.Signed]: '#3491fa', // 新增：信息蓝色（已签收）
  [OrderStatus.Received]: '#19be6b', // 新增：成功色（已收货）
  [OrderStatus.Recycled]: '#86909c', // 次要中性色（已回收）
  [OrderStatus.Error]: '#f00' // 大红色警告（异常）
}


const getListAmount = (infos: any[], fieldName: string) => {
  return infos?.reduce((prev: number, cur: any) => MathUtils.add(prev, cur[fieldName] || 0), 0) || 0
}

export const useColumns = ({
  status,
  tableAction,
  orderListProps,
  orderDetailsModalActions,
  orderRefundModalActions,
  orderRecycleModalActions,
  userDetailsModalActions,
}: {
  status?: OrderStatus
  tableAction?: MutableRefObject<TableAction | undefined>
  orderListProps?: OrderListProps
  orderDetailsModalActions?: OrderDetailsModalActions
  orderRefundModalActions?: OrderRefundModalActions
  orderRecycleModalActions?: OrderRecycleModalActions
  userDetailsModalActions?: UserDetailsModalActions
}): FastColumnProps<OrderItem>[] => {
  const { subjectList } = useAppSelector(state => state.baseData)

  function getOrderStatusName(item: OrderItem) {
  if (!item?.status) return ''

  return EnumMap.orderStatus[item.status]
}

  /** 是否显示退款按钮 */
  const showRefund = (record: OrderItem) => {
    if (!hasPermission(PERMISSION_EDIT)) return false
    const status = record.status
    const canDoStatus = [
      OrderStatus.Refunded,
      OrderStatus.Paid,
      OrderStatus.Received,
      OrderStatus.Signed,
      OrderStatus.Shipped
    ].includes(status)
    return canDoStatus 
  }
  
  /** 是否显示回收按钮 */
  const showRecycle = (record: OrderItem) => {
    if (!hasPermission(PERMISSION_EDIT)) return false
    const status = record.status
    const canDoStatus = [OrderStatus.Paid, OrderStatus.Received, OrderStatus.Signed, OrderStatus.Shipped].includes(
      status
    )
    return canDoStatus
  }
  
  const columns: VisibleColumn[] = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      showInSearch: true,
      fixed: 'left',
      render: (value, record) => {
        return (
          <Space direction="vertical">
            <Button
              type="link"
              className="px-0 underline"
              onClick={() => {
                orderDetailsModalActions?.onShow({ orderNo: record?.order_no })
              }}
            >
              <Typography.Link copyable className="cursor-pointer">
                {value}
              </Typography.Link>
            </Button>

                      </Space>
        )
      }
    },

    {
      title: '用户ID',
      dataIndex: 'user_id',
      showInSearch: true,
      fixed: 'left',
      render: value => {
        return (
          <Button
            type="link"
            className="p-0 underline"
            onClick={() => {
              userDetailsModalActions?.onShow({ userId: value })
            }}
          >
            <Typography.Link copyable>{value}</Typography.Link>
          </Button>
        )
      }
    },
    {
      title: '用户昵称',
      dataIndex: 'user_name',
      showInSearch: true,
      render(value, record) {
        return (
          <div className="flex flex-col gap-1">
            <span>{value}</span>
            
          </div>
        )
      }
    },
    {
      title: '商品名称',
      dataIndex: 'order_desc',
      render: value => {
        if (!value) return ''
        const names = value.split(',')
        const isMoreThanThree = names.length > 3
        const displayNames = isMoreThanThree ? names.slice(0, 3).concat('...') : names
        return (
          <Tooltip
            title={
              isMoreThanThree ? (
                <div>
                  {names.map((item: string) => (
                    <div key={item} className="mb-1">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                ''
              )
            }
          >
            {displayNames.map((item: string) => (
              <div key={item} className="mb-1">
                {item}
              </div>
            ))}
          </Tooltip>
        )
      }
    },
    {
      title: '支付方式',
      dataIndex: 'trade_type',
      valueEnum: EnumMap.tradeType,
      showInSearch: true,
      hiddenInTable: true,
      exportIgnore: true
    },
    {
      title: '下单时间',
      dataIndex: 'create_at',
      formItemName: ['create_start', 'create_end'],
      isNamesFormItem: true,
      valueType: 'dateRange',
      showInSearch: true,
      render(value) {
        if (!value) return ''
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '原价订单金额',
      dataIndex: 'origin_order_amount',
      align: 'right',
      valueType: 'money'
    },
    {
      title: '满减优惠',
      dataIndex: 'full_discount_amount',
      align: 'right',
      valueType: 'money'
    },
    {
      title: '订单金额',
      dataIndex: 'order_amount',
      align: 'right',
      valueType: 'money'
    },
    {
      title: '应付金额',
      dataIndex: 'payment_amount',
      align: 'right',
      valueType: 'money',
      visible: status => status === OrderStatus.Pending || status === OrderStatus.All || status === OrderStatus.Canceled
    },
    {
      title: '实付金额',
      dataIndex: 'payment_amount',
      valueType: 'money',
      align: 'right',
      hiddenInTable: status === OrderStatus.Pending || status === OrderStatus.Canceled,
      exportIgnore: true,
      render(value, record) {
        if (record?.status === OrderStatus.Pending || record?.status === OrderStatus.Canceled) return ''
        if (record.chan_payment_amount) {
          return (
            <Tooltip
              title={
                <div className="flex flex-col">
                  <p className="flex">
                    <span>用户支付：</span>
                    <Price value={value} />
                  </p>
                </div>
              }
            >
              <Space>
                <Price value={record.chan_payment_amount} />
                <InfoCircleOutlined />
              </Space>
            </Tooltip>
          )
        }

        return <Price value={value} />
      }
    },
    // 用于导出
    {
      title: '实付金额',
      dataIndex: 'payment_amount_export',
      hiddenInTable: true,
      exportIgnore: status === OrderStatus.Pending || status === OrderStatus.Canceled
    },
    {
      title: '退款金额',
      dataIndex: 'refund_amount',
      valueType: 'money',
      align: 'right',
      visible: status => {
        if (typeof status !== 'number') return false
        return [OrderStatus.Refunded, OrderStatus.All].includes(status)
      }
    },
    {
      title: '回收金额',
      dataIndex: 'recycle_amount',
      valueType: 'money',

      align: 'right',
      visible: status => status === OrderStatus.Recycled
    },
    {
      title: '付款时间',
      dataIndex: 'payment_at',
      valueType: 'datetimeRange',
      hiddenInTable: status === OrderStatus.Canceled || status === OrderStatus.Pending,
      exportIgnore: status === OrderStatus.Canceled || status === OrderStatus.Pending,
      showInSearch: status !== OrderStatus.Canceled && status !== OrderStatus.Pending,
      formItemName: ['payment_start', 'payment_end'],
      isNamesFormItem: true
    },
    {
      title: '退款时间',
      dataIndex: 'refund_at',
      valueType: 'datetimeRange',
      hiddenInTable: true,
      exportIgnore: true,
      // showInSearch:
      //   status === OrderStatus.All || status === OrderStatus.PartialRefunded || status === OrderStatus.FullRefunded,
      formItemName: ['refund_start', 'refund_end'],
      isNamesFormItem: true
    },
    {
      title: '回收原因',
      dataIndex: 'recycle_reason',
      visible: status => status === OrderStatus.Recycled
    },
    {
      title: '回收人',
      dataIndex: 'recycle_name',
      visible: status => status === OrderStatus.Recycled
    },
    {
      title: '回收时间',
      dataIndex: 'recycle_at',
      valueType: 'datetimeRange',
      formItemName: ['recycle_start', 'recycle_end'],
      isNamesFormItem: true,
      showInSearch: status === OrderStatus.Recycled,
      visible: status => status === OrderStatus.Recycled
    },
    {
      title: '取消原因',
      dataIndex: 'cancel_reason',
      visible: status => status === OrderStatus.Canceled,
      render(value, record) {
        return (
          <Tooltip
            title={
              <div className="flex flex-col gap-1">
                <span>取消人：{record?.cancel_name}</span>
                {record?.cancel_at ? (
                  <span>取消时间：{dayjs(record?.cancel_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                ) : null}
                {record?.cancel_type ? <span>取消类型：{EnumMap.orderCancelType[record?.cancel_type]}</span> : null}
              </div>
            }
          >
            {value}
          </Tooltip>
        )
      }
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      valueEnum: omit(EnumMap.orderStatus, 0),
      formItemName: 'status_list',
      formItemProps: {
        getValueFromEvent(value) {
          return value ? value.join(',') : value
        },
        getValueProps(value) {
          if (!value) return { value: [] }
          if (typeof value === 'string') return { value: value.split(',').map(Number) }
          return { value }
        }
      },
      formItemRender: ({ value, onChange }) => {
        return (
          <Select
            value={value}
            onChange={onChange}
            mode="multiple"
            options={mapToOptions(omit(EnumMap.orderStatus, 0))}
          />
        )
      },
      showInSearch: status === OrderStatus.All,
      render: (value, record) => {
        if (!value) return
        let color = statusColorMap[value as OrderStatus]
        
        return <div style={{ color }}>{getOrderStatusName(record)}</div>
      }
    },
    {
      title: '物流单号',
      dataIndex: 'tracking_no',
      showInSearch: true,
      visible: status => status === OrderStatus.Shipped || status === OrderStatus.All,
      render(value, record) {
        return (
          <LogisticsOrder
            tracking_name={record.tracking_name}
            tracking_code={record.tracking_code}
            tracking_no={value}
          />
        )
      }
    },
    {
      title: '发货时间',
      dataIndex: 'delivery_at',
      valueType: 'datetimeRange',
      visible: status => status === OrderStatus.Shipped || status === OrderStatus.All,
      render(value) {
        if (!value) return
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '购买时长',
      dataIndex: 'duration_type',
      showInSearch: !orderListProps?.isChannel,
      hiddenInTable: orderListProps?.isChannel,
      exportIgnore: orderListProps?.isChannel,
      valueEnum: EnumMap.durationType
    },
    {
      title: '操作',
      dataIndex: '',
      fixed: 'right',
      hiddenInTable: orderListProps?.isChannel,
      render: (_, record) => {
        const items: ActionButtonItem[] = [
         
          {
            label: '退款',
            hidden: !showRefund(record),
            onClick: () => {
              orderRefundModalActions?.onShow({ orderId: record.id })
            }
          },
    
          {
            label: '回收',
            hidden: !showRecycle(record),
            onClick: () => {
              orderRecycleModalActions?.onShow({ orderId: record.id })
            }
          }
        ]
        return <ActionButtons maxCount={3} items={items} />
      }
    }
  ]

  // 过滤只显示当前状态需要的列
  return columns.filter(col => {
    // 默认显示
    if (!col.visible) return true
    return col.visible(status)
  })
}



/** 根据订单状态获取支付文本 */
export function getPayTextByStatus(status?: OrderStatus) {
  if (!status) return ''
  switch (status) {
    case OrderStatus.Canceled:
      return '应付款'
    case OrderStatus.Pending:
      return '待付款'
    case OrderStatus.Paid:
      return '实付款'
    default:
      return '实付款'
  }
}

