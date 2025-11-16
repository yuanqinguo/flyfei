import UploadImage from '@/components/UploadImage'
import { useSetState } from 'ahooks'
import { Card, Form, Input, InputNumber, Modal, ModalProps } from 'antd'
import { OrderRecycleParams } from './types'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { fenToYuan, yuanToFen } from '@/utils/business'
import OrderService from '@/service/OrderService'
import { OrderInfo } from '@/model/Order'

interface OrderDetailsModalProps extends ModalProps {
  orderId?: number
  orderNo?: string
  orderInfo?: OrderInfo
  onConfirm?: (params: OrderRecycleParams) => Promise<void>
}

export interface OrderRecycleModalActions {
  onShow: (params: Partial<OrderDetailsModalProps>) => void
  onCancel: () => void
}

export const useOrderRecycleModal = () => {
  const [props, setProps] = useSetState<Partial<OrderDetailsModalProps>>({
    open: false,
    loading: false,
    orderId: undefined,
    orderNo: undefined,
    orderInfo: undefined,
    onCancel: () => {
      setProps({ open: false })
    }
  })

  async function getOrderInfo(order_id?: number) {
    if (!order_id) return
    try {
      setProps({ loading: true })
      const orderInfo = await OrderService.info({ order_id })
      setProps({ orderInfo })
    } finally {
      setProps({ loading: false })
    }
  }

  const actions: OrderRecycleModalActions = {
    onShow: async (params: Partial<OrderDetailsModalProps>) => {
      setProps({ open: true, ...params })
      if (params.orderId) {
        getOrderInfo(params.orderId)
      }
    },
    onCancel: () => {
      setProps({ open: false })
    }
  }

  return [props, actions] as const
}

const OrderRecycleModal = ({ orderId, orderNo, orderInfo, onConfirm, ...restProps }: OrderDetailsModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleOk = async (e: any) => {
    if (loading) return
    const valid = await form.validateFields()
    if (!valid) return
    try {
      setLoading(true)
      const formData = form.getFieldsValue()
      formData.recycle_amount = yuanToFen(formData.recycle_amount)
      await onConfirm?.(formData)
      restProps.onCancel?.(e)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (restProps.open) {
      form.resetFields()
    }
  }, [restProps.open])

  return (
    <Modal
      title="订单回收"
      width={800}
      destroyOnClose
      onOk={handleOk}
      onCancel={e => {
        restProps.onCancel?.(e)
      }}
      {...restProps}
    >
      <Card>
        <Form colon={false} form={form} labelCol={{ span: 3 }}>
          <Form.Item name="order_id" initialValue={orderId} hidden />
          <Form.Item label="订单编号" name="order_no" initialValue={orderNo}>
            {orderNo || orderInfo?.order_no}
          </Form.Item>
          <Form.Item label="回收原因" name="recycle_reason" rules={[{ required: true, message: '请输入回收原因' }]}>
            <Input.TextArea rows={4} placeholder="说明回收订单的原因" />
          </Form.Item>
          <Form.Item label="回收凭证" name="recycle_keys" rules={[{ required: true, message: '请上传回收凭证' }]}>
            <div>
              <UploadImage
                scene="order"
                maxCount={9}
                onFileListChange={file_list => {
                  const file_keys = file_list?.map(item => item.file_key)
                  form.setFieldValue('recycle_keys', file_keys)
                }}
              />
            </div>
          </Form.Item>
          <Form.Item
            label="回收金额"
            name="recycle_amount"
            initialValue={orderInfo?.payment_amount ? fenToYuan(orderInfo?.payment_amount) : ''}
            rules={[{ required: true, message: '请输入回收金额' }]}
          >
            <InputNumber prefix="￥" min={0} max={orderInfo?.payment_amount} className="min-w-[150px]" />
          </Form.Item>
        </Form>
        <div className="flex items-center gap-2 text-red-500">
          <ExclamationCircleOutlined twoToneColor="#eb2f96" />
          回收操作将回收用户对应订单所有商品权益，请谨慎操作
        </div>
      </Card>
    </Modal>
  )
}

export default OrderRecycleModal
