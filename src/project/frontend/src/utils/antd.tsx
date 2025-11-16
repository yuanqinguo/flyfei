import { message, App, Modal, notification } from 'antd'

function AntdAppInject() {
  const staticFunction = App.useApp()
  console.log('AntdAppInject')

  // message
  message.destroy = staticFunction.message.destroy
  message.loading = staticFunction.message.loading
  message.success = staticFunction.message.success
  message.warning = staticFunction.message.warning
  message.error = staticFunction.message.error
  message.info = staticFunction.message.info
  message.open = staticFunction.message.open

  // modal
  Modal.confirm = staticFunction.modal.confirm
  Modal.error = staticFunction.modal.error
  Modal.info = staticFunction.modal.info
  Modal.warning = staticFunction.modal.warning
  Modal.success = staticFunction.modal.success

  // notification
  notification.error = staticFunction.notification.error
  notification.info = staticFunction.notification.info
  notification.success = staticFunction.notification.success
  notification.warning = staticFunction.notification.warning
  notification.destroy = staticFunction.notification.destroy
  notification.open = staticFunction.notification.open
  return null
}

export function AntdApp({ children }: { children: React.ReactNode }) {
  return (
    <App>
      <AntdAppInject />
      {children}
    </App>
  )
}
