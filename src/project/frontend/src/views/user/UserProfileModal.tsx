import { useLoading } from '@/hooks'
import CustomerService from '@/service/CustomerService'
import { getAreaNames } from '@/utils/constants/AreaData'
import { CopyOutlined } from '@ant-design/icons'
import { Button, Descriptions, message, Modal, ModalProps, Space } from 'antd'
import copy from 'copy-to-clipboard'
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'

export interface UserProfileModalRef {
  onShow: ({ user_id }: { user_id: number }) => void
}

interface UserProfileModalProps extends ModalProps {}

const UserProfileModal = forwardRef<UserProfileModalRef, UserProfileModalProps>((props, ref) => {
  const [open, setOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<any>()

  const [loading, fetchUserInfo] = useLoading(async (params: { user_ids: number[] }) => {
    const res = await CustomerService.info(params)
    setUserInfo(res.list?.[0])
  })

  const deliveryAddress = useMemo(() => {
    const { delivery_province_id, delivery_city_id, delivery_district_id, delivery_address } =
      userInfo?.student_profile || {}
    const areaNames = getAreaNames([delivery_province_id, delivery_city_id, delivery_district_id]) || ''
    return `${areaNames.split('/').join('')}${delivery_address || ''}`
  }, [userInfo, open])

  useImperativeHandle(ref, () => ({
    onShow: (params: { user_id: number }) => {
      setOpen(true)
      fetchUserInfo({ user_ids: [params.user_id] })
    }
  }))

  // 将高考类型数字映射到文本
  const getExamType = (type: number) => {
    switch (type) {
      case 1:
        return '文化生'
      case 2:
        return '艺术生'
      case 3:
        return '特长生'
      default:
        return '未知'
    }
  }

  // 将住宿方式数字映射到文本
  const getAccommodationType = (type: number) => {
    switch (type) {
      case 1:
        return '走读'
      case 2:
        return '住宿'
      default:
        return '未知'
    }
  }

  return (
    <Modal loading={loading} width={1000} open={open} onCancel={() => setOpen(false)} footer={null} {...props}>
      {userInfo ? (
        <div className="space-y-6">
          <Descriptions title="基本信息" bordered column={1} labelStyle={{ width: '140px' }}>
            <Descriptions.Item label="高考年份">{userInfo?.student_profile?.ncee_vintage || ''}</Descriptions.Item>
            <Descriptions.Item label="监督电话">{userInfo?.student_profile?.parent_phone || ''}</Descriptions.Item>
            <Descriptions.Item label="高考类型">
              {getExamType(userInfo?.student_profile?.student_type)}
            </Descriptions.Item>
            <Descriptions.Item label="住宿方式">
              {getAccommodationType(userInfo?.student_profile?.attend_type)}
            </Descriptions.Item>
            <Descriptions.Item label="高考省份">
              {userInfo?.student_profile?.province_id ? getAreaNames([userInfo?.student_profile?.province_id]) : null}
            </Descriptions.Item>
            <Descriptions.Item label="学校名称">{userInfo?.student_profile?.school_name || ''}</Descriptions.Item>
            <Descriptions.Item label="真实姓名">{userInfo?.student_profile?.real_name || ''}</Descriptions.Item>
          </Descriptions>

          <Descriptions
            title={
              <Space>
                <span>邮寄信息</span>
                {userInfo?.student_profile?.delivery_name ||
                userInfo?.student_profile?.delivery_mobile ||
                deliveryAddress ? (
                  <Button
                    title="复制"
                    type="text"
                    size="small"
                    onClick={() => {
                      try {
                        const text = `收件人：${userInfo?.student_profile?.delivery_name || ''}\n联系电话：${
                          userInfo?.student_profile?.delivery_mobile || ''
                        }\n收货地址：${deliveryAddress || ''}`
                        // 复制
                        copy(text)
                        // 复制成功提示
                        message.success('复制成功')
                      } catch (error) {
                        message.warning('复制失败')
                        console.error(error)
                      }
                    }}
                    icon={<CopyOutlined />}
                  />
                ) : null}
              </Space>
            }
            bordered
            column={1}
            labelStyle={{ width: '140px' }}
          >
            <Descriptions.Item label="收货人">{userInfo?.student_profile?.delivery_name || ''}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{userInfo?.student_profile?.delivery_mobile || ''}</Descriptions.Item>
            <Descriptions.Item label="收货地址">{deliveryAddress || ''}</Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <div>获取用户信息失败</div>
      )}
    </Modal>
  )
})

export default UserProfileModal
