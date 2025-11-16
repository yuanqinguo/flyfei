import React from 'react'
import { ModalForm, ModalFormProps } from '@/components/ModalForm'
import { Form, Input, InputNumber, Radio, TreeSelect } from 'antd'
import { arrayToTree } from '@/utils'
import Perm from '@/model/Perm'

const EditForm: React.FC<ModalFormProps<Perm> & { permissions: Perm[] }> = ({ permissions, ...props }) => {
  return (
    <ModalForm {...props} width={500} formProps={{ layout: 'horizontal', labelCol: { span: 4 } }}>
      <Form.Item noStyle shouldUpdate={(prevProps, nextProps) => prevProps.code !== nextProps.code}>
        {form => {
          const code = form.getFieldValue('code')
          const noSelfPermission = permissions.filter(a => a.code !== code)
          const treeData = arrayToTree(
            noSelfPermission.map(item => ({
              title: item.name,
              value: item.id,
              parentId: item.parent_id
            })),
            item => item.value,
            item => item.parentId
          )
          return (
            <Form.Item label="上级菜单" name={'parent_id'}>
              <TreeSelect treeData={treeData} allowClear showSearch treeNodeFilterProp={'title'} />
            </Form.Item>
          )
        }}
      </Form.Item>
      <Form.Item label="名称" name={'name'} rules={[{ required: true }]}>
        <Input autoFocus />
      </Form.Item>
      <Form.Item label="权限标识" name={'code'} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="类型" name={'type'}>
        <Radio.Group>
          <Radio value={1}>菜单</Radio>
          <Radio value={2}>功能</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="菜单地址" name={'page_path'} extra="用于配置菜单页面的 URL 地址">
        <Input />
      </Form.Item>
      <Form.Item label="API全路径" name={'api_path'} extra="用于配置 API 调用权限">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="排序" initialValue={1} name={'sort'}>
        <InputNumber min={1} />
      </Form.Item>
      <Form.Item label="描述" name={'desc'}>
        <Input />
      </Form.Item>
    </ModalForm>
  )
}

export default EditForm
