import { ModalForm, ModalFormProps } from '@/components/ModalForm'
import { Form, Input } from 'antd'
import Role from '@/model/Role'

const EditForm: React.FC<ModalFormProps<Role>> = props => {
  return (
    <ModalForm<Role> {...props}>
      <Form.Item
        label="角色名称"
        name="name"
        rules={[
          {
            required: true,
            message: '请输入角色名称'
          }
        ]}
      >
        <Input maxLength={50} />
      </Form.Item>
      <Form.Item label="角色描述" name="desc">
        <Input.TextArea maxLength={200} showCount />
      </Form.Item>
    </ModalForm>
  )
}

export default EditForm
