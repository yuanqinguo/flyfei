import { useState } from 'react'
import { ModalForm, ModalFormProps } from '@/components/ModalForm'
import UserService, { ResetPasswordParam } from '@/service/UserService'
import { Form, Input, Row, Col, Button } from 'antd'
import { useCountDown } from 'ahooks'
import { showCaptcha } from '@/utils/captcha'

const ResetPassword: React.FC<
  ModalFormProps<ResetPasswordParam> & {
    /** 是否是修改密码 */
    isUpdate?: boolean
  }
> = ({ isUpdate, ...props }) => {
  const [targetDate, setTargetDate] = useState<number>()

  const [countdown] = useCountDown({
    targetDate
  })

  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)

  const [form] = Form.useForm<ResetPasswordParam>()
  return (
    <ModalForm<ResetPasswordParam>
      {...props}
      formProps={{ form }}
      title={isUpdate ? '修改密码' : '重置密码'}
      showResetButton={false}
    >
      <Form.Item
        label="手机号"
        name="mobile"
        style={{ marginTop: '16px' }}
        rules={[
          {
            required: true,
            message: '请输入手机号'
          },
          {
            pattern: /^1\d{10}$/,
            message: '手机号格式错误'
          }
        ]}
      >
        <Input disabled={isUpdate} placeholder="请输入" />
      </Form.Item>
      <Form.Item
        label="验证码"
        name="verify_code"
        rules={[
          {
            required: true,
            message: '请输入验证码'
          }
        ]}
      >
        <Row gutter={8}>
          <Col span={18}>
            <Input placeholder="请输入" />
          </Col>
          <Col span={6}>
            <Button
              style={{ width: '100%' }}
              onClick={async () => {
                setResetPasswordLoading(true)
                try {
                  await form.validateFields(['mobile'])
                  const mobile = form.getFieldValue('mobile')
                  const { ticket } = await showCaptcha()
                  await UserService.verifySmsCode({
                    ticket,
                    mobile,
                    scene: 'admin_user_reset_password'
                  })
                  setTargetDate(Date.now() + 60e3)
                } catch (error) {
                  console.log(error)
                }
                setResetPasswordLoading(false)
              }}
              loading={resetPasswordLoading}
              disabled={countdown !== 0}
            >
              {countdown === 0 ? '获取验证码' : `${Math.round(countdown / 1000)}s`}
            </Button>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item
        label="新密码"
        name="password"
        rules={[
          {
            required: true,
            message: '请输入新密码'
          },
          {
            max: 20,
            min: 6,
            message: '密码长度为6-20位'
          }
        ]}
      >
        <Input type="password" placeholder="请输入" />
      </Form.Item>
      <Form.Item
        label="确认新密码"
        name="confirm_pwd"
        rules={[
          {
            required: true,
            message: '请确认新密码'
          },
          {
            max: 20,
            min: 6,
            message: '密码长度为6-20位'
          }
        ]}
      >
        <Input type="password" placeholder="请输入" />
      </Form.Item>
    </ModalForm>
  )
}

export default ResetPassword
