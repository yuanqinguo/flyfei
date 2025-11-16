import { MutableRefObject, useRef, useState } from 'react'
import { DatePicker, SelectProps, Form, Input, Modal, Select } from 'antd'
import { ModalProps } from 'antd/es/modal'
import ReactDOM from 'react-dom/client'
import { FormProps, FormItemProps } from 'antd/es/form'

interface ModalConfirmAction {
  onClose: () => void
}

interface FieldModel<T> {
  name: FormItemProps['name']
  value?: any
  label?: FormItemProps['label']
  rules?: FormItemProps['rules']
  type?: 'select' | 'input' | 'date-picker'
  mode?: SelectProps<T>['mode']
  options?: SelectProps<T>['options']
}

interface ModalConfirmProps<T = any> extends Omit<ModalProps, 'visible' | 'onCancel'> {
  fields?: FieldModel<T>[]
  initialValues?: FormProps['initialValues']
  actionRef?: MutableRefObject<ModalConfirmAction | undefined>
  onSubmit?: (formData: any) => void
  onCancel?: () => void
  onClose?: () => void
}

const ModalConfirm = ({
  fields,
  onSubmit,
  onCancel,
  actionRef,
  initialValues,
  children,
  ...args
}: ModalConfirmProps) => {
  const [visibleState, setVisibleState] = useState(true)

  const [confirmLoadingState, setConfirmLoadingState] = useState(false)

  const [form] = Form.useForm()

  const action = {
    onClose() {
      setVisibleState(false)
    }
  }

  if (actionRef) {
    actionRef.current = action
  }

  const onClose = () => {
    setVisibleState(false)
  }

  const onCancelHandler = () => {
    onCancel?.()
    onClose()
  }

  const renderInput = ({ type, mode, options }: FieldModel<any>) => {
    switch (type) {
      case 'select':
        return <Select options={options} mode={mode} />
      case 'date-picker':
        return <DatePicker showTime />
      default:
        return <Input />
    }
  }

  return (
    <Modal
      open={visibleState}
      confirmLoading={confirmLoadingState}
      okText="提交"
      onOk={async () => {
        const formData = await form.validateFields()
        setConfirmLoadingState(true)
        try {
          await onSubmit?.(formData)
        } finally {
          setConfirmLoadingState(false)
          onClose()
        }
      }}
      onCancel={onCancelHandler}
      {...args}
    >
      {children}
      <Form form={form} initialValues={initialValues}>
        {fields?.map(field => {
          const { name, label, rules } = field
          return (
            <Form.Item key={name} name={name} label={label} rules={rules}>
              {renderInput(field)}
            </Form.Item>
          )
        })}
      </Form>
    </Modal>
  )
}

const showModal = <T,>({ onSubmit, ...props }: ModalConfirmProps): Promise<T> => {
  return new Promise((resolve, reject) => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    const handleSubmit = async (formData: any) => {
      if (onSubmit) {
        await onSubmit(formData)
        resolve(formData)
      }
      resolve(formData)
    }

    const onCancel = () => {
      reject()
      setTimeout(() => {
        document.body.contains(div) && document.body.removeChild(div)
      }, 100)
    }

    ReactDOM.createRoot(div).render(<ModalConfirm onCancel={onCancel} onSubmit={handleSubmit} {...props} />)
  })
}

export function useModalConfirm(props?: ModalConfirmProps) {
  const actionRef = useRef<ModalConfirmAction>()

  const show = <T,>(modalProps?: ModalConfirmProps) => {
    return showModal<T>({ ...props, ...modalProps })
  }
  const close = () => {
    actionRef.current?.onClose()
  }

  return [show, close] as const
}
