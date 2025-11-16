import { ModalProps } from 'antd/es/modal'
import { Button, Modal, Tour, GetRef } from 'antd'
import React, { useRef, useState } from 'react'
import ImportTable, { ImportAction, ImportProps } from './ImportTable'

export interface ImportDialogProps<T> extends Omit<ModalProps, 'children'> {
  importProps: Omit<ImportProps<T>, 'actionRef'>
  onFinish?(): void
}

const IMPORT_TOUR_KEY = 'FAST_TABLE_IMPORT_TOUR'

function ImportDialog<T extends object = any>({ title, importProps, onCancel, ...rest }: ImportDialogProps<T>) {
  const [closeLoading, setConfirmLoading] = useState(false)
  const importAction = useRef<ImportAction<T>>(null)

  const downloadTemplateBtnRef = useRef<GetRef<typeof Button>>(null)
  const uploadFileBtnRef = useRef<GetRef<typeof Button>>(null)
  const [tourOpen, setTourOpen] = useState(false)

  const handleCancel = async (e: React.MouseEvent<HTMLElement>) => {
    setConfirmLoading(true)
    try {
      await importAction.current?.cancel()
      onCancel?.(e as React.MouseEvent<HTMLButtonElement>)
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <>
      <Modal
        title={title || '导入'}
        destroyOnClose
        {...rest}
        afterOpenChange={open => {
          if (open && !localStorage.getItem(IMPORT_TOUR_KEY)) {
            setTourOpen(true)
          }
        }}
        footer={[
          <Button loading={closeLoading} key={'close'} onClick={handleCancel}>
            关闭
          </Button>
        ]}
        onCancel={handleCancel}
      >
        <ImportTable
          uploadBtnRef={uploadFileBtnRef}
          downloadTemplateBtnRef={downloadTemplateBtnRef}
          actionRef={importAction}
          {...importProps}
        />
      </Modal>
      <Tour
        open={tourOpen}
        onClose={() => {
          setTourOpen(false)
          localStorage.setItem(IMPORT_TOUR_KEY, '1')
        }}
        steps={[
          {
            title: '1. 下载模板',
            description: '导入文件前先下载导入模板',
            target: () => downloadTemplateBtnRef.current!
          },
          {
            title: '2. 导入文件',
            description: '在模板内维护好数据后导入文件',
            target: () => uploadFileBtnRef.current!
          }
        ]}
      />
    </>
  )
}

export default ImportDialog
