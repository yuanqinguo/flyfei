import { getAreaNames } from '@/utils/constants/AreaData'
import { LogisticsCompanyList } from '@/utils/constants/Logistics'
import { CopyOutlined } from '@ant-design/icons'
import { Button, Image, message, Space, Typography } from 'antd'

interface ReceiverAddressProps {
  delivery_name?: string
  delivery_mobile?: number
  delivery_province_id: number
  delivery_city_id: number
  delivery_district_id: number
  delivery_address: string
}

export const ReceiverAddress = (props: ReceiverAddressProps) => {
  const {
    delivery_name,
    delivery_mobile,
    delivery_province_id,
    delivery_city_id,
    delivery_district_id,
    delivery_address
  } = props
  const areaNames = getAreaNames([delivery_province_id, delivery_city_id, delivery_district_id], '')
  const address = `${areaNames || ''}${delivery_address || ''}`
  const showCopy = !!areaNames.trim() && !!delivery_mobile && !!address.trim()
  return (
    <div className="flex w-full items-center gap-2">
      <div>
        <p>收货人：{delivery_name || ''}</p>
        <p>联系电话：{delivery_mobile || ''}</p>
        <p>收货地址：{address}</p>
      </div>
      {showCopy && (
        <Button
          type="text"
          icon={<CopyOutlined className="text-primary" />}
          onClick={() => {
            navigator.clipboard
              .writeText(`收货人：${delivery_name}\n联系电话：${delivery_mobile}\n收货地址：${address}`)
              .then(() => {
                message.success('复制成功')
              })
              .catch(() => {
                message.error('复制失败')
              })
          }}
        />
      )}
    </div>
  )
}

export const LogisticsOrder = (props: { tracking_name: string; tracking_code: string; tracking_no: number }) => {
  const { tracking_code, tracking_no, tracking_name } = props
  if (!tracking_no) return null
  const company = LogisticsCompanyList.find(item => item.code === tracking_code)

  return (
    <Space direction="vertical">
      <Button
        type="link"
        className="px-0 underline"
        onClick={() => {
          navigator.clipboard
            .writeText(tracking_no.toString())
            .then(async () => {
              message.success('复制成功, 正在跳转快递100查询...')
              window.open(`https://www.kuaidi100.com/chaxun?nu=${tracking_no}`, '_blank')
            })
            .catch(() => {
              message.error('复制失败')
            })
        }}
      >
        <Typography.Link copyable>{tracking_no}</Typography.Link>
      </Button>
      <Space>
        <Image height={30} src={company?.logo} className="rounded" />
        <span>{tracking_name}</span>
      </Space>
    </Space>
  )
}
