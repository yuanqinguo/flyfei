import React, { RefObject, useEffect, useRef, useState } from 'react'
import { Button, Form, Input, Modal } from 'antd'
import { FormProps } from 'antd/lib/form'
import './index.scss'
import { ModalProps } from 'antd/es/modal'
import { FormInstance } from 'antd/es/form'
import { useLoading } from '../../hooks'

export interface FormState<T> {
  show?: boolean
  readOnly?: boolean
  formData?: Partial<T>
}

type BaseModel = Record<string, any>

export type ModalFormAction<T> = {
  onSubmit?: (form?: T) => Promise<void | boolean> | void | boolean
  onCancel: () => void
  onShow: (form?: Partial<T>) => void
  showLoading: boolean
  formData?: Partial<T>
  visible?: boolean
  readOnly?: boolean
  otherData?: { [k in string]: any }
}

interface InnerFormProps<T> {
  action: ModalFormAction<T>
  formProps?: FormProps
  footer?: React.ReactNode
  showResetButton?: boolean
  children?: React.ReactNode
  okText?: React.ReactNode
  cancelText?: React.ReactNode
  appendButton?: (form: FormInstance) => React.ReactNode
}

function InnerForm<T>({
  action,
  formProps,
  footer,
  showResetButton = true,
  children,
  okText,
  cancelText,
  appendButton
}: InnerFormProps<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = formProps?.form || Form.useForm()[0]
  const [submitLoading, onSubmitHandle] = useLoading(async (data: any) => {
    const close: any = await action.onSubmit?.(data)
    if (close !== false) {
      action?.onCancel?.()
    }
  })

  useEffect(() => {
    if (action.visible) {
      form.resetFields()
      form.setFieldsValue(action.formData || {})
    }
  }, [action.formData, action.visible])
  const otherFormProps: FormProps = { layout: 'vertical', ...formProps }
  const FooterComponent = () => {
    if (footer) {
      return <>{footer}</>
    }
    return (
      <>
        <Button onClick={action.onCancel}>{cancelText || '取消'}</Button>
        {action.readOnly ? (
          ''
        ) : (
          <>
            {showResetButton && <Button onClick={() => form.resetFields()}>重置</Button>}
            <Button
              type="primary"
              loading={submitLoading}
              disabled={submitLoading}
              onSubmit={e => e.preventDefault()}
              htmlType={'submit'}
            >
              {okText || '保存'}
            </Button>
            {appendButton?.(form)}
          </>
        )}
      </>
    )
  }
  return (
    <Form form={form} onFinish={onSubmitHandle} initialValues={action.formData} {...otherFormProps}>
      <Form.Item noStyle hidden name={'id'}>
        <Input />
      </Form.Item>
      {children}
      <div className={'modal-form-footer'}>
        <FooterComponent />
      </div>
    </Form>
  )
}

export type FormActionOption<T> = {
  onCancel?: ModalFormAction<T>['onCancel']
  /**
   * 提交接口
   */
  onSubmit?: ModalFormAction<T>['onSubmit']
  /**
   * 默认值
   */
  defaultForm?: FormState<T>
  /**
   * getById 等接口获取完，打开弹窗前的回调
   */
  onShow?: (form?: Partial<T>) => void
  /**
   * 根据id获取数据接口
   * @param t
   */
  getById?(t: Partial<T>): any
  /** 其他数据 */
  otherData?: { [k in string]: any }
}

/**
 * 获取modalForm的action
 * @param defaultForm 默认表单
 * @param getById 通过id获取数据接口
 * @param onSubmit 提交接口
 * @return form的基本操作，以及一些状态对外暴露
 */
export function useModalFormAction<T>({
  defaultForm = { show: false },
  otherData,
  getById = t => t,
  onSubmit,
  onCancel,
  onShow
}: FormActionOption<T> = {}): ModalFormAction<T> {
  const [formState, setFormState] = useState(defaultForm)
  const [showLoading, showModal] = useLoading(async (editForm?: Partial<T>) => {
    if (editForm) {
      editForm = await getById(editForm)
    }
    setFormState({
      ...formState,
      show: true,
      formData: { ...defaultForm.formData, ...editForm } as T
    })
  })

  const handleCancel = () => {
    setFormState({ ...formState, show: false })
    onCancel?.()
  }

  const handleShow = (form?: Partial<T>) => {
    onShow?.(form)
    showModal(form)
  }

  return {
    visible: formState?.show,
    formData: formState?.formData,
    readOnly: formState?.readOnly,
    onSubmit,
    showLoading,
    onShow: handleShow,
    onCancel: handleCancel,
    otherData
  }
}

/**
 * @param formActionOption
 */
export function useModalForm<T>(
  formActionOption?: FormActionOption<T>
): [FormActionOption<T> | undefined, RefObject<ModalFormAction<T> | null | undefined>] {
  const actionRef = useRef<ModalFormAction<T>>(null)
  return [formActionOption, actionRef]
}

export interface ModalFormProps<T> extends Omit<ModalProps, 'footer'>, Omit<InnerFormProps<T>, 'action'> {
  actionOption?: FormActionOption<T>
  /**
   * 如果返回值非 false，提交成功后会自动调用 onCancel方法
   * @param form
   */
  actionRef?: RefObject<ModalFormAction<T> | null | undefined>
  editTitle?: string
  createTitle?: string
  centered?: boolean
  formProps?: InnerFormProps<T>['formProps']
  children?: React.ReactNode
}

/**
 * 此组件封装了表单的基本操作
 * @param props
 * @constructor
 */
function ModalForm<T extends BaseModel>({
  actionRef,
  actionOption,
  title,
  editTitle,
  createTitle,
  footer,
  ...rest
}: ModalFormProps<T>) {
  const action = useModalFormAction<T>(actionOption)

  if (actionRef) {
    ;(actionRef as any).current = action
  }
  return (
    <Modal
      {...rest}
      destroyOnClose
      title={title || (action.formData?.id ? editTitle || '编辑' : createTitle || '创建')}
      open={action.visible}
      onCancel={action.onCancel}
      footer={null}
    >
      <InnerForm footer={footer} action={action} {...rest} />
    </Modal>
  )
}

export default ModalForm

export { ModalForm }
