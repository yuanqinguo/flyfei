import { CustomerInfo } from '@/model/Customer'
import CustomerService from '@/service/CustomerService'
import { getAreaNames } from '@/utils/constants/AreaData'
import { CopyOutlined } from '@ant-design/icons'
import { useSetState } from 'ahooks'
import {
  Button,
  Card,
  ConfigProvider,
  Descriptions,
  DescriptionsProps,
  Empty,
  message,
  Modal,
  ModalProps,
  Tabs,
  TabsProps,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import { useMemo } from 'react'
import { get } from 'lodash'
import dayjs from 'dayjs'

interface UserDetailsModalProps extends ModalProps {
  userInfo?: CustomerInfo
  userId?: number
  userNo?: string
}

export interface UserDetailsModalActions {
  onShow: (params: Partial<UserDetailsModalProps>) => void
  onClose: () => void
}

export const useUserDetailsModal = (initialProps?: Partial<UserDetailsModalProps>) => {
  const [props, setProps] = useSetState<Partial<UserDetailsModalProps>>({
    open: false,
    loading: false,
    userInfo: undefined,
    ...initialProps,
    onCancel: e => {
      setProps({
        open: false
      })
      initialProps?.onCancel?.(e)
    }
  })

  const getUserInfo = async (params: Partial<UserDetailsModalProps>) => {
    try {
      if (params.userId || params.userNo) {
        setProps({ loading: true })
        const user_no_list = params.userNo ? [params.userNo] : []
        const user_ids = params.userId ? [params.userId] : []
        const res = await CustomerService.info({ user_no_list, user_ids })
        const userInfo = res?.list?.[0]
        setProps({ userInfo })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setProps({ loading: false })
    }
  }

  const actions: UserDetailsModalActions = {
    onShow(params: Partial<UserDetailsModalProps>) {
      getUserInfo(params)
      setProps({ open: true, ...params })
    },
    onClose: () => {
      setProps({ open: false })
    }
  }
  return [props, actions] as const
}

const UserDetailsModal = ({ open, userInfo, ...restProps }: UserDetailsModalProps) => {
  const deliveryAddress = useMemo(() => {
    const { delivery_province_id, delivery_city_id, delivery_district_id, delivery_address } =
      userInfo?.student_profile || {}
    const areaNames = getAreaNames([delivery_province_id, delivery_city_id, delivery_district_id]) || ''
    return `${areaNames.split('/').join('')}${delivery_address || ''}`
  }, [userInfo])



  const baseItems: DescriptionsProps['items'] = useMemo(() => {
    return [
      {
        label: '用户名',
        children: get(userInfo, ['base_info', 'nick_name']) || ''
      },
      {
        label: '用户ID',
        children: <Typography.Text copyable>{get(userInfo, ['base_info', 'user_id']) || ''}</Typography.Text>
      },
      {
        label: '手机号',
        children: <Typography.Text copyable>{get(userInfo, ['base_info', 'mobile']) || ''}</Typography.Text>
      },
      {
        label: '公众号关注',
        children: (
          <div
            style={{
              color: get(userInfo, ['base_info', 'wechat_bind']) === 1 ? '#52c41a' : '#ff4d4f'
            }}
          >
            {get(userInfo, ['base_info', 'wechat_bind']) === 1 ? '已关注' : '未关注'}
          </div>
        )
      },
      {
        label: '用户状态',
        children: (
          <div
            style={{
              color: get(userInfo, ['base_info', 'status']) === 1 ? '#52c41a' : '#ff4d4f'
            }}
          >
            {get(userInfo, ['base_info', 'status']) === 1 ? '启用' : '禁用'}
          </div>
        )
      },
      {
        label: '注册时间',
        children: userInfo?.base_info?.create_at
          ? dayjs(get(userInfo, ['base_info', 'create_at'])).format('YYYY-MM-DD HH:mm:ss')
          : ''
      },
      {
        label: '最后登录时间',
        children: userInfo?.base_info?.last_login
          ? dayjs(get(userInfo, ['base_info', 'last_login'])).format('YYYY-MM-DD HH:mm:ss')
          : ''
      }
    ]
  }, [userInfo])


  const postItems: DescriptionsProps['items'] = useMemo(() => {
    return [
      {
        label: '收货人',
        children: get(userInfo, ['student_profile', 'delivery_name']) || ''
      },
      {
        label: '联系电话',
        children: (
          <Typography.Text copyable>{get(userInfo, ['student_profile', 'delivery_mobile']) || ''}</Typography.Text>
        )
      },
      {
        label: '收货地址',
        span: 3,
        children: deliveryAddress || ''
      }
    ]
  }, [userInfo, deliveryAddress])


  return (
    <Modal open={open} width={1000} footer={null} {...restProps}>
      <ConfigProvider
        theme={{
          components: {
            Descriptions: {
              titleMarginBottom: 10
            }
          }
        }}
      >
        <div className="flex flex-col gap-6">
          <Descriptions size="middle" bordered title="基础信息" items={baseItems} />
          <Descriptions
            size="middle"
            title="收货信息"
            bordered
            items={postItems}
            extra={
              <Tooltip title="复制收货信息">
                <Button
                  className="text-primary"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    const delivery_name = userInfo?.student_profile?.delivery_name || ''
                    const delivery_mobile = userInfo?.student_profile?.delivery_mobile || ''
                    navigator.clipboard
                      .writeText(`收货人：${delivery_name}\n联系电话：${delivery_mobile}\n收货地址：${deliveryAddress}`)
                      .then(() => {
                        message.success('复制成功')
                      })
                      .catch(() => {
                        message.warning('复制失败')
                      })
                  }}
                />
              </Tooltip>
            }
          />
        </div>
      </ConfigProvider>
    </Modal>
  )
}

export default UserDetailsModal
