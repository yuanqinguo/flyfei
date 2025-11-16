import { FastColumnProps, FastTable } from '@/components/FastTable'
import Price from '@/components/Price'
import { OrderInfo } from '@/model/Order'
import OrderService from '@/service/OrderService'
import EnumMap from '@/utils/constants/EnumMap'
import { useSetState } from 'ahooks'
import {
  Button,
  Card,
  ConfigProvider,
  Descriptions,
  DescriptionsProps,
  Empty,
  Form,
  Image,
  message,
  Modal,
  ModalProps,
  Space,
  Tooltip,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { OrderRefundStatus, OrderStatus } from '@/utils/constants/Order'
import { CopyOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { DiscountRate } from '@/model/Goods'
import { DiscountType } from '@/utils/constants/Goods'
import UserDetailsModal, { useUserDetailsModal } from '@/components/UserDetailsModal'
import { getAreaNames } from '@/utils/constants/AreaData'

interface OrderDetailsModalProps extends ModalProps {
  orderId?: number
  orderNo?: string
  orderInfo?: OrderInfo
  refresh?: () => void
}

export interface OrderDetailsModalActions {
  onShow: (params: Partial<OrderDetailsModalProps>) => void
  onCancel: () => void
}

export const useOrderDetailsModal = () => {
  const [props, setProps] = useSetState<Partial<OrderDetailsModalProps>>({
    open: false,
    loading: false,
    orderId: undefined,
    orderInfo: undefined,
    onCancel: () => {
      setProps({ open: false })
    },
    refresh: () => getOrderInfo(props.orderId)
  })

  async function getOrderInfo(order_id?: number, order_no?: string) {
    if (!order_id && !order_no) return
    try {
      setProps({ loading: true })
      const orderInfo = await OrderService.info({ order_id, order_no })

      setProps({ orderInfo })
    } finally {
      setProps({ loading: false })
    }
  }

  const actions: OrderDetailsModalActions = {
    onShow: async (params: Partial<OrderDetailsModalProps>) => {
      setProps({ open: true, ...params })
      if (params.orderId || params.orderNo) {
        getOrderInfo(params.orderId, params.orderNo)
      }
    },
    onCancel: () => {
      setProps({ open: false })
    }
  }

  return [props, actions] as const
}

interface InfoCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

const InfoCard = ({ title, children, className }: InfoCardProps) => {
  return (
    <div className={`flex flex-col ${className} `}>
      <div className="mb-[10px] text-[16px] font-semibold">{title}</div>
      {children}
    </div>
  )
}

const TooltipTitle = ({ title, tip }: { title: React.ReactNode; tip?: React.ReactNode }) => {
  return (
    <Space>
      <span>{title}</span>
      {tip && (
        <Tooltip
          title={
            <div className="max-w-[420px] p-3">
              <div className="text-sm text-gray-900">{tip}</div>
            </div>
          }
          overlayStyle={{ maxWidth: '420px' }}
          color="#fff"
        >
          <InfoCircleOutlined />
        </Tooltip>
      )}
    </Space>
  )
}

const OrderDetailsModal = ({ orderInfo, refresh, ...restProps }: OrderDetailsModalProps) => {
  const [userDetailsModalProps, userDetailsModalActions] = useUserDetailsModal()

  const addressInfo = useMemo(() => {
    if (!orderInfo) return {}
    const {
      delivery_name,
      delivery_mobile,
      delivery_province_id,
      delivery_city_id,
      delivery_district_id,
      delivery_address
    } = orderInfo
    const areaNames = getAreaNames([delivery_province_id, delivery_city_id, delivery_district_id], '')
    const address = `${areaNames || ''}${delivery_address || ''}`
    return { delivery_name, delivery_mobile, delivery_address: address }
  }, [orderInfo])

  // 用户信息
  const userFields: DescriptionsProps['items'] = useMemo(() => {
    return [
      {
        label: '用户ID',
        children: (
          <Button
            type="link"
            className="p-0 underline"
            onClick={() => {
              if (!orderInfo?.user_id) return
              userDetailsModalActions.onShow({ userId: orderInfo?.user_id })
            }}
          >
            <Typography.Link copyable>{orderInfo?.user_no}</Typography.Link>
          </Button>
        )
      },
      { label: '用户昵称', children: orderInfo?.user_name },
    ]
  }, [orderInfo])

  // 订单信息
  const orderFields: DescriptionsProps['items'] = useMemo(() => {
    return [
      // 订单信息
      { label: '订单编号', children: <Typography.Text copyable>{orderInfo?.order_no}</Typography.Text> },
      { label: '订单状态', children: orderInfo?.order_status ? EnumMap.orderStatus[orderInfo.order_status] : '' },
      { label: '回收人', children: orderInfo?.recycle_name },
      { label: '回收原因', children: orderInfo?.recycle_reason },
      { label: '取消人', children: orderInfo?.cancel_name },
      { label: '取消方式', children: orderInfo?.cancel_type ? EnumMap.orderCancelType[orderInfo.cancel_type] : '' },
      {
        label: '取消时间',
        children: orderInfo?.cancel_at ? dayjs(orderInfo.cancel_at).format('YYYY-MM-DD HH:mm:ss') : ''
      },
      // 时间信息
      {
        label: '下单时间',
        children: orderInfo?.create_at ? dayjs(orderInfo.create_at).format('YYYY-MM-DD HH:mm:ss') : ''
      },
      {
        label: '付款时间',
        children: orderInfo?.payment_at ? dayjs(orderInfo.payment_at).format('YYYY-MM-DD HH:mm:ss') : ''
      },
      {
        label: '回收时间',
        children: orderInfo?.recycle_at ? dayjs(orderInfo.recycle_at).format('YYYY-MM-DD HH:mm:ss') : ''
      },
      // 回收凭证
      {
        label: '回收凭证',
        span: 3,
        children:
          orderInfo?.recycle_images?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {orderInfo?.recycle_images?.map((e: string) => (
                <Image className="object-cover" width={50} height={50} src={e} />
              ))}
            </div>
          ) : null
      }
    ]
  }, [orderInfo])

  // 金额信息
  const amountFields: DescriptionsProps['items'] = useMemo(() => {
    return [
      { label: '原价订单金额', children: <Price value={orderInfo?.origin_order_amount} /> },
      {
        label: '满减优惠',
        children: orderInfo?.hit_full_amount ? (
          <span>
            满 <Price value={orderInfo?.hit_full_amount} /> 减 <Price value={orderInfo?.full_discount_amount} />
          </span>
        ) : null
      },
      { label: '总优惠金额', children: <Price value={orderInfo?.total_discount_amount} /> },
      { label: '订单金额', children: <Price value={orderInfo?.order_amount} /> },
      {
        label:
          orderInfo?.status === OrderStatus.Pending || orderInfo?.status === OrderStatus.Canceled
            ? '应付金额'
            : '实付金额',
        children: <Price value={orderInfo?.payment_amount} />
      },
      { label: '回收金额', children: orderInfo?.recycle_amount ? <Price value={orderInfo?.recycle_amount} /> : null }
    ]
  }, [orderInfo])

  // 物流信息
  const receiverFields: DescriptionsProps['items'] = useMemo(() => {
    return [
      { label: '收件人', children: orderInfo?.delivery_name },
      { label: '收件号码', children: orderInfo?.delivery_mobile },
      {
        label: '收件地址',
        children: addressInfo?.delivery_address || ''
      },
      {
        label: '发货时间',
        children: orderInfo?.delivery_at ? dayjs(orderInfo.delivery_at).format('YYYY-MM-DD HH:mm:ss') : ''
      },
      { label: '物流单号', children: orderInfo?.tracking_no },
      { label: '物流名称', children: orderInfo?.tracking_name }
    ]
  }, [orderInfo, addressInfo])

  const goodsColumns: FastColumnProps[] = [
    {
      title: '子订单号',
      dataIndex: 'id',
      render: value => (
        <span>
          {value}
        </span>
      )
    },
    {
      title: '商品ID',
      dataIndex: 'goods_id',
      render: value => <Typography.Text copyable>{value}</Typography.Text>
    },
    {
      title: '商品名称',
      dataIndex: ['goods_snap', 'name']
    },
    {
      title: '商品主图',
      dataIndex: ['goods_snap', 'cover_url'],
      render(value) {
        return <Image style={{ objectFit: 'cover' }} src={value} width={50} height={50} />
      }
    },
    {
      title: '商品数量',
      dataIndex: 'quantity',
    },
    {
      title: <TooltipTitle title="商品价格" />,
      dataIndex: ['goods_snap', 'goods_price'],
      valueType: 'money'
    },
    {
      title: '满减优惠',
      dataIndex: 'full_discount_amount',
      valueType: 'money'
    },
    {
      title: <TooltipTitle title="实付金额" />,
      dataIndex: 'payment_amount',
      valueType: 'money'
    }
  ]
  
  const refundColumns: FastColumnProps[] = [
    {
      title: '退款单号',
      dataIndex: 'items',
      render: value => {
        return (
          <>
            {value.map((item: any) => (
              <p key={item.id}>
                {item.id}
              </p>
            ))}
          </>
        )
      }
    },
    {
      title: '商品名称',
      dataIndex: 'items',
      render: value => {
        if (!value) return null
        return (
          <>
            {value.map((item: any) => (
              <p key={item.id} className="whitespace-nowrap">
                {item?.goods_snap?.name}
              </p>
            ))}
          </>
        )
      }
    },
    {
      title: '退款金额',
      dataIndex: 'amount',
      render: value => <Price value={value} />
    },
    {
      title: '退款备注',
      dataIndex: 'reason'
    },
    {
      title: '退款人',
      dataIndex: 'refund_name'
    },
    {
      title: '退款时间',
      dataIndex: 'apply_at',
      render: value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '')
    },
    {
      title: '退款状态',
      dataIndex: 'status',
      valueEnum: EnumMap.orderRefundStatus,
      render: (value, record) => {
        return (
          <Tooltip
            title={
              record?.refund_images && record?.refund_images?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div>退款说明：{record?.remark}</div>
                </div>
              ) : null
            }
          >
            {EnumMap.orderRefundStatus[value]}
          </Tooltip>
        )
      }
    
    }
  ]
  

  const goodsItems = useMemo(() => {
    return orderInfo?.items || []
  }, [orderInfo])

  

  const refundItems = useMemo(() => {
    return orderInfo?.refunds || []
  }, [orderInfo])

  const getDisplayFieldList = (fields: DescriptionsProps['items']): DescriptionsProps['items'] => {
    if (!fields || fields.length === 0) return []
    return fields
      .filter(item => item.children)
      .map(item => {
        return { ...item, span: 3 }
      })
  }

  return (
    <>
      <Modal title="订单详情" width={'80vw'} footer={null} {...restProps}>
        <ConfigProvider
          theme={{
            components: {
              Descriptions: {
                titleMarginBottom: 10
              }
            }
          }}
        >
          <Card className="max-h-[80vh] overflow-auto">
            {!orderInfo ? (
              <Empty description="未获取到订单数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Form size={'small'} className="flex flex-col gap-6">
                <div className="flex gap-2">
                  <Descriptions size="default" title="用户信息" items={getDisplayFieldList(userFields)} />
                  <Descriptions size="default" title="订单信息" items={getDisplayFieldList(orderFields)} />
                  <Descriptions size="default" title="金额信息" items={getDisplayFieldList(amountFields)} />
                    <Descriptions
                      size="default"
                      title="物流信息"
                      items={getDisplayFieldList(receiverFields)}
                      extra={
                        <Tooltip title="复制物流信息">
                          <Button
                            onClick={() => {
                              const { delivery_name, delivery_mobile, delivery_address } = addressInfo
                              navigator.clipboard
                                .writeText(
                                  `收货人：${delivery_name}\n联系电话：${delivery_mobile}\n收货地址：${delivery_address}`
                                )
                                .then(() => {
                                  message.success('复制成功')
                                })
                                .catch(() => {
                                  message.warning('复制失败')
                                })
                            }}
                            className="text-primary"
                            type="text"
                            icon={<CopyOutlined />}
                          />
                        </Tooltip>
                      }
                    />
                </div>

                <InfoCard title="子订单">
                  <FastTable
                    bordered
                    isCard={false}
                    options={false}
                    dataSource={goodsItems}
                    columns={goodsColumns}
                    pagination={false}
                  />
                </InfoCard>
                

                {refundItems.length > 0 && (
                  <InfoCard title="退款">
                    <FastTable
                      isCard={false}
                      options={false}
                      bordered
                      dataSource={refundItems}
                      columns={refundColumns}
                      pagination={false}
                    />
                  </InfoCard>
                )}
                
              </Form>
            )}
          </Card>
        </ConfigProvider>
      </Modal>
     
      <UserDetailsModal {...userDetailsModalProps} />
    </>
  )
}

export default OrderDetailsModal
