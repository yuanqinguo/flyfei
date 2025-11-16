import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { CopyOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Image, message } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import Upload, { FileInfo, IUploadProps } from '../Upload'
import { UploadResponse } from '@/service/StorageService'
import { getClipboardImageFile } from '@/utils/file'
import { uploadFile } from '@/utils/upload'
import { uuid } from '@/utils'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface UploadImageProps extends IUploadProps {
  uploadButtonText?: string
  /**文件名是否可以重复 */
  canRepeat?: boolean
  /**是否支持粘贴文件 */
  pastable?: boolean
  /**是否可以上传多个文件 */
  multiple?: boolean
  sortable?: boolean
  scene: string
  /**初始化文件列表 */
  initialFileList?: UploadFile[]
  /**文件key变化 onChange时触发 */
  onFileListChange?: (file_list: { file_key: string; file_url: string; origin_name: string }[]) => void
}

export type UploadImageRef = {
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>
}

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>
  file: UploadFile<any>
}

const DraggableUploadListItem = ({ originNode, file }: DraggableUploadListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
    transition: { duration: 200, easing: 'linear' }
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
    height: '100%'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      // prevent preview event when drag end
      className={isDragging ? 'is-dragging' : ''}
      {...attributes}
      {...listeners}
    >
      {/* hide error tooltip when dragging */}
      {file.status === 'error' && isDragging ? originNode.props.children : originNode}
    </div>
  )
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

const UploadImage = forwardRef<UploadImageRef, UploadImageProps>((props, ref) => {
  const {
    maxCount = 1,
    multiple = false,
    pastable = true,
    sortable,
    uploadButtonText = '上传图片',
    scene,
    initialFileList = [],
    onFileListChange,
    canRepeat,
    onFileChange,
    ...restProps
  } = props
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>(initialFileList)

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 }
  })

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!sortable) return
    if (active.id !== over?.id) {
      const activeIndex = fileList.findIndex(i => i.uid === active.id)
      const overIndex = fileList.findIndex(i => i.uid === over?.id)
      const newFileList = arrayMove(fileList, activeIndex, overIndex)
      setFileList(newFileList)
      onFileListChange?.(newFileList as any[])
    }
  }

  const handlePreview = async (file: any) => {
    setPreviewImage(file.url || file.fileUrl || file.thumbUrl || '')
    setPreviewOpen(true)
  }

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    if (!canRepeat) {
      const file_list = newFileList.filter(
        (item, index, self) => item.status && index === self.findIndex(t => t.name === item.name)
      )
      setFileList(file_list)
    } else {
      setFileList(newFileList)
    }
  }

  const handleFileChange = (info: FileInfo, uploadResponse?: UploadResponse) => {
    let fileList = info.fileList
    if (!canRepeat) {
      fileList = fileList.filter((item, index, self) => index === self.findIndex(t => t.name === item.name))
    }
    const file_list = fileList
      .map(item => ({
        // @ts-ignore
        file_key: item.fileKey,
        // @ts-ignore
        file_url: item.fileUrl || item.url,
        origin_name: item.name
      }))
      .filter(item => item.file_key || item.file_url)
    onFileListChange?.(file_list)
    onFileChange?.(info, uploadResponse)
  }

  const handlePaste = async () => {
    // 1. 获取剪贴板内容
    const file = await getClipboardImageFile()
    if (!file) return
    // @ts-ignore
    file.status = 'uploading'
    // @ts-ignore
    file.uid = uuid()
    const newFileList = [...fileList, file]
    const info: any = {
      file,
      fileList: newFileList
    }
    handleChange(info)
    const { tempSecret } = await uploadFile(file, { scene, uploadType: 'business' })
    // @ts-ignore
    info.file.fileKey = tempSecret.key
    // @ts-ignore
    info.file.fileUrl = tempSecret.file_url
    info.file.status = 'done'
    info.file.thumbUrl = tempSecret.file_url

    handleChange(info)
    handleFileChange(info, tempSecret)
  }

  useImperativeHandle(ref, () => ({
    setFileList
  }))

  const uploadButton = pastable ? (
    <button className="flex flex-col items-center border-none bg-transparent" type="button">
      <span className="flex items-center gap-2 rounded-md px-4 py-1 hover:bg-[#0000000f]">
        <PlusOutlined />
        <span>上传</span>
      </span>
      <Button
        type="text"
        icon={<CopyOutlined />}
        onClick={e => {
          e.stopPropagation()
          handlePaste()
        }}
        style={{ marginTop: 8 }}
      >
        粘贴
      </Button>
    </button>
  ) : (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{uploadButtonText}</div>
    </button>
  )

  return (
    <>
      <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
        <SortableContext items={fileList.map(i => i.uid)} strategy={verticalListSortingStrategy}>
          <Upload
            scene={scene}
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            onFileChange={handleFileChange}
            maxCount={maxCount}
            multiple={multiple}
            accept="image/*"
            {...restProps}
            itemRender={
              sortable
                ? (originNode, file) => <DraggableUploadListItem originNode={originNode} file={file} />
                : undefined
            }
          >
            {fileList.length >= maxCount ? null : uploadButton}
          </Upload>
        </SortableContext>
      </DndContext>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: visible => setPreviewOpen(visible),
            afterOpenChange: visible => !visible && setPreviewImage('')
          }}
          src={previewImage}
        />
      )}
    </>
  )
})

export default UploadImage
