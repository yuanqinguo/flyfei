import { useRef, useState, useCallback } from 'react'

export interface ModalFormOptions<T = any> {
  defaultForm?: {
    formData?: Partial<T>
  }
  onSubmit?: (form: T) => Promise<void>
}

export interface ModalFormAction<T = any> {
  current: {
    onShow: (data?: Partial<T>) => void
    onHide: () => void
  }
}

export function useModalForm<T = any>(options: ModalFormOptions<T> = {}): [ModalFormOptions<T>, ModalFormAction<T>] {
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState<Partial<T>>(options.defaultForm?.formData || {})

  const actionRef = useRef<ModalFormAction<T>['current']>({
    onShow: (data?: Partial<T>) => {
      setFormData(data || {})
      setVisible(true)
    },
    onHide: () => {
      setVisible(false)
      setFormData({})
    }
  })

  const handleSubmit = useCallback(async (form: T) => {
    if (options.onSubmit) {
      await options.onSubmit(form)
      actionRef.current.onHide()
    }
  }, [options])

  const modalOptions: ModalFormOptions<T> = {
    ...options,
    defaultForm: {
      ...options.defaultForm,
      formData: { ...options.defaultForm?.formData, ...formData }
    }
  }

  return [
    {
      ...modalOptions,
      visible,
      onCancel: () => actionRef.current.onHide(),
      onSubmit: handleSubmit
    },
    actionRef
  ]
}