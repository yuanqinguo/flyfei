import React, { useEffect, useMemo, useState } from 'react'
import {
  Dropdown,
  message,
  Descriptions,
  Modal,
  ModalProps,
  Button,
  Tooltip,
  Typography,
  QRCode,
  Space,
  Spin
} from 'antd'
import { useAppDispatch, useAppSelector } from '@/store'
import ResetPassword from '@/views/login/ResetPassword'
import UserService, { ResetPasswordParam } from '@/service/UserService'
import { useModalForm } from '@/hooks/useModalForm'
import SessionUtils from './SessionUtils'
import cryptojs from 'crypto-js'
import User from '@/model/User'
import EnumMap from '@/utils/constants/EnumMap'
import Lark from '@/views/login/Lark'
import { systemInit } from '@/store/actions'
import { downloadFile } from '@/utils/file'
import { useRequest } from 'ahooks'



interface AvatarDropdownProps {
  children?: React.ReactNode
}

const UserInfoModal: React.FC<{ user: Partial<User> } & ModalProps> = ({ open, user, ...rest }) => {
  const dispatch = useAppDispatch()

  const handleBindLark = async (data: { code: string; redirectUri: string }) => {
    message.loading('绑定中...', 0)
    try {
      await UserService.bindLarkQrCode({ app_code: 4000, code: data.code, redirect_uri: data.redirectUri })
      const userInfo = await UserService.info()
      dispatch(
        systemInit({
          userInfo
        })
      )
      message.destroy()
      message.success('绑定成功')
    } catch (error) {
      message.destroy()
      message.error('绑定失败')
    }
  }

  return (
    <Modal footer={false} open={open} {...rest}>
      <Descriptions title="个人信息">
        <Descriptions.Item label="姓名">{user.name}</Descriptions.Item>
        <Descriptions.Item label="性别">{EnumMap.sex[user?.sex || '']}</Descriptions.Item>
        <Descriptions.Item label="手机号">{user.mobile}</Descriptions.Item>
        <Descriptions.Item label="飞书账号">
          {user.lark_open_id ? (
            <>
              {user.lark_nickname && (
                <Tooltip title={user.lark_open_id}>
                  <div>
                    <span>{user.lark_nickname}</span>
                  </div>
                </Tooltip>
              )}

              <Button
                style={{ marginLeft: '10px' }}
                size={'small'}
                onClick={async () => {
                  await UserService.unbindLark({ app_code: '4000' })
                  message.success('解绑成功')
                  window.location.reload()
                }}
              >
                解绑
              </Button>
            </>
          ) : (
            <div>
              <div style={{ textAlign: 'center' }}> 扫码绑定</div>
              {open && <Lark onSuccess={handleBindLark} />}
            </div>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ children }) => {
  const userInfo = useAppSelector(state => state.system.userInfo)

  const [openUserInfo, setOpenUserInfo] = useState(false)
  const [openOrderLink, setOpenOrderLink] = useState(false)

  const [resetPasswordOption, resetPasswordAction] = useModalForm<ResetPasswordParam>({
    async onSubmit(form) {
      if (form) {
        form = {
          ...form,
          password: cryptojs.MD5(form.password).toString(),
          confirm_pwd: cryptojs.MD5(form.password).toString()
        }
        await UserService.resetPassword(form)
        message.success('重置成功')
      }
    }
  })

  const userExit = () => {
    SessionUtils.logout()
  }

  const updatePassword = () => {
    resetPasswordAction.current?.onShow({
      mobile: userInfo?.mobile
    })
  }

  const items = [
    { key: 1, label: <a onClick={() => setOpenUserInfo(true)}>个人信息</a> },
    { key: 3, label: <a onClick={updatePassword}>修改密码</a> },
    { key: 4, label: <a onClick={userExit}>退出</a> }
  ]

  return (
    <>
      <div className="header-group header-right" style={{ float: 'right', display: 'flex' }}>
        <Dropdown menu={{ items }}>
          <div className="header-item">{children}</div>
        </Dropdown>
      </div>
      <ResetPassword isUpdate actionRef={resetPasswordAction} actionOption={resetPasswordOption} />
      <UserInfoModal
        open={openUserInfo}
        onCancel={() => {
          setOpenUserInfo(false)
        }}
        user={userInfo}
      />
    </>
  )
}

export default AvatarDropdown
