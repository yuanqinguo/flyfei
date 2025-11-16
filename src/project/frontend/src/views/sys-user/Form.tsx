import { ModalForm, ModalFormProps } from '@/components/ModalForm'
import { Form, Input, Radio, Select } from 'antd'
import User from '@/model/User'
import EnumMap from '@/utils/constants/EnumMap'
import React from 'react'
import { useFetch } from '@/hooks'
import RoleService from '@/service/RoleService'

const EditForm: React.FC<ModalFormProps<User & { role_ids: number[] }>> = props => {
  const [roleList] = useFetch(() => RoleService.list({ limit: 999 }).then(({ list }) => list))
  return (
    <ModalForm {...props}>
      <Form.Item name="status" hidden></Form.Item>
      <Form.Item
        label="姓名"
        name="name"
        rules={[
          {
            required: true,
            message: '请输入姓名'
          }
        ]}
      >
        <Input maxLength={10} />
      </Form.Item>
      <Form.Item
        label="昵称"
        name="nick_name"
        rules={[
          {
            required: false,
            message: '请输入昵称'
          }
        ]}
      >
        <Input maxLength={10} />
      </Form.Item>
      <Form.Item label="性别" name="sex">
        <Radio.Group>
          {Object.entries(EnumMap.sex).map(([value, name]) => {
            return (
              <Radio value={+value} key={value}>
                {name}
              </Radio>
            )
          })}
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="手机号"
        name="mobile"
        rules={[
          {
            required: true,
            message: '请输入姓名'
          },
          {
            pattern: /^1\d{10}$/,
            message: '请输入正确的手机号'
          }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="角色选择"
        name="role_ids"
        rules={[
          {
            required: true,
            message: '请选择角色'
          }
        ]}
      >
        <Select
          mode="multiple"
          options={roleList?.map(item => ({
            label: `${item.name}${item.desc ? `-${item.desc}` : item.desc}`,
            value: item.id
          }))}
        />
      </Form.Item>
    </ModalForm>
  )
}

export default EditForm
