import { useRef } from 'react'
import { Upload as AntUpload } from 'antd'
import type { GetProp, UploadProps } from 'antd'
import { UploadResponse } from '@/service/StorageService'
import { uploadFile } from '@/utils/upload'

export type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]
export type FileInfo = Parameters<GetProp<UploadProps, 'onChange'>>[0]

export interface IUploadProps extends UploadProps {
  /**
   * 上传接口类型
   * @default `business`
   */
  uploadType?: 'business' | 'resource'
  /** 上传的参数 scene */
  scene: string
  /** 获取 secret 参数 */
  params?: any
  onChange?: (info: FileInfo) => void
  onFileChange?: (info: FileInfo, uploadResponse?: UploadResponse) => void
  onUploadSuccess?: (data: any) => void
}

export default ({
  scene,
  uploadType = 'business',
  params,
  onChange,
  onUploadSuccess,
  onFileChange,
  ...props
}: IUploadProps) => {
  const uploadResponse = useRef<UploadResponse>()

  const handleChange = (info: FileInfo) => {
    onChange?.(info)
    try {
      onFileChange?.(info, uploadResponse.current)
    } catch (error) {
      console.log('onFileChange error', error)
    }
  }

  return (
    <AntUpload
      method="PUT"
      customRequest={async ({ file, onSuccess, onError }) => {
        try {
          const { data, tempSecret } = await uploadFile(file, { scene, uploadType, params })
          uploadResponse.current = tempSecret
          // @ts-ignore
          file.fileKey = tempSecret.key
          // @ts-ignore
          file.fileUrl = tempSecret.file_url
          // @ts-ignore
          file.url = tempSecret.file_url
          onSuccess?.(data)
          onUploadSuccess?.(data)
        } catch (error) {
          console.log('upload error', error)
          onError?.(error as any)
        }
      }}
      onChange={handleChange}
      {...props}
    />
  )
}
