import { FastColumnProps, FastTable } from '@/components/FastTable'
import { OrderInfo } from '@/model/Order'
import OrderService from '@/service/OrderService'
import { useSetState } from 'ahooks'
import { Card, Empty, Form, Input, InputNumber, message, Modal, ModalProps, Space, Tooltip, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { OrderRefundParams } from './types'
import Price from '@/components/Price'
import { fenToYuan, yuanToFen } from '@/utils/business'
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import EnumMap from '@/utils/constants/EnumMap'
import UploadImage from '@/components/UploadImage'

interface OrderDetailsModalProps extends ModalProps {
  orderId?: number
  orderInfo?: OrderInfo
  onConfirm?: (params: OrderRefundParams) => void
}

export interface OrderRefundModalActions {
  onShow: (params: Partial<OrderDetailsModalProps>) => void
  onCancel: () => void
}

export const useOrderRefundModal = () => {
  const [props, setProps] = useSetState<Partial<OrderDetailsModalProps>>({
    open: false,
    loading: false,
    orderId: undefined,
    orderInfo: undefined,
    onCancel: () => {
      setProps({ open: false })
    }
  })

  const actions: OrderRefundModalActions = {
    onShow: async (params: Partial<OrderDetailsModalProps>) => {
      setProps({ open: true, ...params })
      if (params.orderId) {
        try {
          setProps({ loading: true })
          const orderInfo = await OrderService.info({ order_id: params.orderId })
          setProps({ orderInfo })
        } finally {
          setProps({ loading: false })
        }
      }
    },
    onCancel: () => {
      setProps({ open: false })
    }
  }

  return [props, actions] as const
}

const OrderRefundModal = ({ orderId, orderInfo, onConfirm, ...restProps }: OrderDetailsModalProps) => {
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const goodsItems = useMemo(() => {
    return orderInfo?.items || []
  }, [orderInfo])

  const refundableAmount = useMemo(() => {
    if (!selectedRowKeys.length) return 0
    const selectedGoods = goodsItems.filter(item => item.id && selectedRowKeys.includes(item.id))
    const selectedGoodsPaymentAmount = selectedGoods.reduce((prev, cur) => prev + (cur.payment_amount || 0), 0)
    const selectedGoodsGapAmount = selectedGoods.reduce((prev, cur) => prev + (cur.gap_amount || 0), 0)
    return selectedGoodsPaymentAmount - selectedGoodsGapAmount
  }, [selectedRowKeys, goodsItems])

  const fieldList = [
    {
      label: '订单编号',
      value: <Typography.Text copyable>{orderInfo?.order_no}</Typography.Text>
    },
    {
      label: '订单金额',
      value: <Price value={orderInfo?.order_amount} />
    },
    {
      label: '实付金额',
      value: <Price value={orderInfo?.payment_amount} />
    },
    {
      label: '已退金额',
      value: <Price value={orderInfo?.refund_amount ?? 0} />
    },
    {
      label: '补差总金额',
      value: <Price value={orderInfo?.gap_amount} />
    }
  ]

  const columns: FastColumnProps[] = [
    {
      title: '子订单编号',
      dataIndex: 'order_no',
      render: (_, __, index: number) => (
        <span>
          {orderInfo?.order_no}-{index + 1}
        </span>
      )
    },
    {
      title: '商品名称',
      dataIndex: ['goods_snap', 'name']
    },
    {
      title: '时长',
      dataIndex: ['goods_snap', 'duration_type'],
      valueEnum: EnumMap.vipDurationType,
      render: value => {
        return orderInfo?.upgrade_days ? `${orderInfo.upgrade_days}天` : EnumMap.vipDurationType[value]
      }
    },
    {
      title: '商品价格',
      dataIndex: ['goods_snap', 'goods_price'],
      valueType: 'money'
    },
    {
      title: '时长优惠',
      dataIndex: 'year_discount_amount',
      valueType: 'money'
    },
    {
      title: '多科优惠',
      dataIndex: 'subject_discount_amount',
      render: (value, record) => {
        const discountRate = record?.discount_rate
        return (
          <Space>
            <Price value={value} />
            {discountRate?.discount_rate ? (
              <Tooltip title={`${discountRate?.subject_count} 科：${discountRate?.discount_rate} 折`}>
                <InfoCircleOutlined />
              </Tooltip>
            ) : null}
          </Space>
        )
      }
    },
    {
      title: '平台优惠',
      dataIndex: 'platform_discount_amount',
      valueType: 'money'
    },
    {
      title: '满减优惠',
      dataIndex: 'full_discount_amount',
      valueType: 'money'
    },
    {
      title: '补差金额',
      dataIndex: 'gap_amount',
      valueType: 'money'
    },
    {
      title: '实付金额',
      dataIndex: 'payment_amount',
      valueType: 'money'
    },
    {
      title: '退款状态',
      dataIndex: 'refund_status',
      valueEnum: EnumMap.orderRefundStatus
    }
  ]

  const handleOk = async (e: any) => {
    if (loading) return
    if (!orderInfo?.id) {
      message.warning('未获取到订单ID')
      return
    }
    const valid = await form.validateFields()
    if (!valid) return
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要退款的商品')
      return
    }
    try {
      setLoading(true)
      const formData = form.getFieldsValue()
      const params = {
        ...formData,
        amount: yuanToFen(formData.amount),
        order_id: orderInfo?.id,
        item_ids: selectedRowKeys
      }
      await onConfirm?.(params)
      restProps.onCancel?.(e)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (restProps.open) {
      setSelectedRowKeys([])
      form.resetFields()
    }
  }, [restProps.open])

  return (
    <Modal
      title="退款"
      width={1200}
      style={{ top: '5vh' }}
      destroyOnClose
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={e => {
        restProps.onCancel?.(e)
      }}
      {...restProps}
    >
      <Card>
        {!orderInfo ? (
          <Empty description="未获取到退款数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="flex flex-col gap-3">
            <Form form={form} labelCol={{ span: 3 }}>
              {fieldList.map(item => {
                return (
                  <Form.Item className="mb-4" key={item.label} label={item.label} name={item.label}>
                    <div>{item.value}</div>
                  </Form.Item>
                )
              })}
              <Form.Item label="退款商品" required>
                <FastTable
                  bordered
                  rowKey="id"
                  options={false}
                  dataSource={goodsItems}
                  columns={columns}
                  rowSelection={{
                    getCheckboxProps: record => {
                      // 已退款的子订单禁止选择
                      const refundGoodsIds = orderInfo?.refunds?.map(r => r.items.map((i: any) => i.id)).flat() || []
                      const disabled = refundGoodsIds?.includes(record?.id)
                      return { disabled }
                    },
                    selectedRowKeys: selectedRowKeys,
                    onChange: selectedRowKeys => {
                      setSelectedRowKeys(selectedRowKeys as number[])
                    }
                  }}
                  pagination={false}
                />
              </Form.Item>
              {selectedRowKeys.length > 0 && (
                <>
                  <Form.Item
                    label="退款金额"
                    name="amount"
                    rules={[{ required: true, message: '请输入退款金额' }]}
                    extra={
                      <div className="mt-2 text-black/70">
                        可退金额：
                        <Price value={refundableAmount} />
                        （选中商品的实付金额 - 选中商品的补差金额）
                      </div>
                    }
                  >
                    <InputNumber prefix="￥" min={0} max={fenToYuan(refundableAmount)} className="min-w-[150px]" />
                  </Form.Item>
                  <Form.Item label="退款原因" name="reason" rules={[{ required: true, message: '请输入退款原因' }]}>
                    <Input.TextArea rows={4} placeholder="可补充用户退款原因" />
                  </Form.Item>
                  <Form.Item
                    label="退款凭证"
                    name="refund_keys"
                    rules={[{ required: true, message: '请上传退款凭证' }]}
                  >
                    <div>
                      <UploadImage
                        scene="order"
                        maxCount={9}
                        onFileListChange={file_list => {
                          const file_keys = file_list?.map(item => item.file_key)
                          form.setFieldValue('refund_keys', file_keys)
                        }}
                      />
                    </div>
                  </Form.Item>
                </>
              )}
            </Form>
            <div className="flex items-center gap-2 text-red-500">
              <ExclamationCircleOutlined twoToneColor="#eb2f96" />
              退款操作将回收用户对应退款商品权益，请谨慎操作
            </div>
          </div>
        )}
      </Card>
    </Modal>
  )
}

export default OrderRefundModal
