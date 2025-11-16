import { useEffect, useState } from 'react'
import { DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex, message } from 'antd'
import Upload, { IUploadProps } from '@/components/Upload'
import type { GetProp } from 'antd'
import VideoPlayer from './VideoPlayer'

type FileType = Parameters<GetProp<IUploadProps, 'beforeUpload'>>[0]

const beforeUpload = (file: FileType) => {
  const isVideo = (file.type || '').startsWith('video/')
  if (!isVideo) {
    message.error('只能上传视频')
  }
  const isLtLimit = file.size / 1024 / 1024 < 100
  if (!isLtLimit) {
    message.error('最多上传 100MB')
  }
  return isVideo && isLtLimit
}

interface UploadVideoProps {
  value?: string
  src?: string
  scene?: string
  onChange?: (url: string) => void
  onUrlChange?: (url: string) => void
}

export default ({ value, src, scene, onChange, onUrlChange }: UploadVideoProps) => {
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(src || '')
  }, [src])

  const handleChange: IUploadProps['onFileChange'] = (info, res) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      const url = URL.createObjectURL(info.file.originFileObj as any)
      setUrl(url)
      setLoading(false)
      onChange?.(res?.key as string)
      onUrlChange?.(res?.file_url as string)
    }
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传视频</div>
    </button>
  )

  return (
    <Flex align="center" gap="small">
      <Upload
        listType="picture-card"
        accept="video/*"
        showUploadList={false}
        scene={scene || 'question'}
        beforeUpload={beforeUpload}
        onFileChange={handleChange}
      >
        {value && url ? <VideoPlayer src={url} style={{ width: '100%' }} /> : uploadButton}
      </Upload>
      {value && (
        <Button
          icon={<DeleteOutlined />}
          size="small"
          danger
          onClick={() => {
            onChange?.('')
            onUrlChange?.('')
            setUrl('')
          }}
        />
      )}
    </Flex>
  )
}
