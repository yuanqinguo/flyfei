import { CodeOutlined, LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons'
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components'
import { Alert, Tabs, message, Typography, Divider } from 'antd'
import React, { useEffect, useState } from 'react'
import { RouteName } from '@/router'
import SessionUtils from '@/router/SessionUtils'
import UserService, { ResetPasswordParam } from '@/service/UserService'
import { useModalForm } from '@/components/ModalForm'
import cryptojs from 'crypto-js'
import ResetPassword from './ResetPassword'
import './index.scss'
import dayjs from 'dayjs'
import { useRouter } from '@/hooks'
import Lark from './Lark'
import { showCaptcha } from '@/utils/captcha'

const CURRENT_YEAR = dayjs().year()

const { Paragraph, Link } = Typography

const LoginMessage: React.FC<{
  content: string
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24
      }}
      message={content}
      type="error"
      showIcon
    />
  )
}

const Login: React.FC = () => {
  const router = useRouter()
  const [status, setStatus] = useState<'error' | 'success'>()
  const [type, setType] = useState<string>('account')

  const [resetPasswordOption, resetPasswordAction] = useModalForm<ResetPasswordParam>({
    async onSubmit(form) {
      if (form) {
        form = {
          ...form,
          password: cryptojs.MD5(form.password).toString(),
          confirm_pwd: cryptojs.MD5(form.confirm_pwd).toString()
        }
        await UserService.resetPassword(form)
        message.success('重置成功')
      }
    }
  })

  const handleLarkLogin = async (data: { code: string; redirectUri: string }) => {
    const app_code = 4000
    // 使用 async/await 处理异步操作
    try {
      const result = await UserService.loginLarkQrCode({ app_code, code: data.code, redirect_uri: data.redirectUri })
      const { token } = result
      SessionUtils.loginSuccess(token)
      router.push(decodeURIComponent(router.query.redirect || '') || RouteName.Home)
    } catch (error) {
      console.error('飞书扫码登录失败:', error)
      message.error('飞书扫码登录失败，请稍后再试')
    }
  }

  useEffect(() => {
    document.title = '登录 - 大秦科技管理后台'
  }, [])

  return (
    <div>
      <div
        style={{
          flex: '1',
          padding: '32px 0'
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw'
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="大秦科技管理后台"
          subTitle={'大秦出品，只出精品'}
          initialValues={{
            autoLogin: true
          }}
          submitter={type === 'lark' ? false : undefined}
          onFinish={async ({ mobile, password, verify_code }) => {
            try {
              let ticket: string | undefined
              if (type === 'account') {
                const res = await showCaptcha()
                ticket = res.ticket
              }
              const { token } = await (type === 'account'
                ? UserService.loginPassword({ ticket, mobile, password: cryptojs.MD5(password).toString() })
                : UserService.loginVerifyCode({ mobile, verify_code }))
              SessionUtils.loginSuccess(token)
              location.href = decodeURIComponent(router.query.redirect || '') || RouteName.Home
            } catch (error: any) {
              if (error?.code === 405) {
                setStatus('error')
              }
            }
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录'
              },
              {
                key: 'mobile',
                label: '验证码登录'
              },
              {
                key: 'lark',
                label: '飞书扫码登录'
              }
            ]}
          />

          {status === 'error' && type === 'account' && <LoginMessage content="账户或密码错误" />}
          {type === 'account' && (
            <>
              <ProFormText
                name="mobile"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />
                }}
                placeholder="用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名'
                  }
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />
                }}
                placeholder="密码"
                rules={[
                  {
                    required: true,
                    message: '请输入密码'
                  }
                ]}
              />
              <a
                style={{
                  float: 'right',
                  marginBottom: '16px'
                }}
                onClick={() => resetPasswordAction.current?.onShow()}
              >
                忘记密码？
              </a>
            </>
          )}

          {status === 'error' && type === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />
                }}
                name="mobile"
                placeholder="手机号"
                rules={[
                  {
                    required: true,
                    message: '请输入手机号'
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '请输入正确的手机号'
                  }
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <CodeOutlined />
                }}
                captchaProps={{
                  size: 'large'
                }}
                phoneName="mobile"
                placeholder="请输入验证码"
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count}s`
                  }
                  return <span className="text-sm">获取验证码</span>
                }}
                name="verify_code"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码'
                  }
                ]}
                onGetCaptcha={async mobile => {
                  if (!/^1\d{10}$/.test(mobile)) {
                    throw new Error('请输入正确的手机号')
                  }
                  const { ticket } = await showCaptcha()
                  await UserService.verifySmsCode({ ticket, mobile, scene: 'admin_user_mobile_login' })
                }}
              />
            </>
          )}

          {type === 'lark' && <Lark onSuccess={handleLarkLogin} />}
        </LoginForm>
        <ResetPassword actionRef={resetPasswordAction} actionOption={resetPasswordOption} />
      </div>
      <Paragraph className="qing-footer">
        Copyright©2024{CURRENT_YEAR > 2024 ? `-${CURRENT_YEAR}` : ''} 大秦科技有限公司 All Rights Reserved
        <Divider type="vertical" />
        <Link href="https://beian.miit.gov.cn/" target="_blank">
          湘ICP备12233444号
        </Link>
      </Paragraph>
    </div>
  )
}

export default Login
