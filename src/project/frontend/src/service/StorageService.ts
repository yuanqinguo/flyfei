import StorageResource from '@/model/StorageResource'
import RequestClient from './request/RequestClient'
import { PageParam, PageResult } from '@/model/dto/Page'

const client = new RequestClient('admin/v1/storage')

export interface UploadResponse {
  upload_url: string
  start_time: number
  bucket: string
  expired_time: number
  key: string
  region: string
  secret_id: string
  secret_key: string
  security_token: string
  file_url: string
}
export interface UploadParams {
  /**
   * 原文件名-全名，包含后缀
   */
  file_name: string
  /**
   * 文件大小，字节数
   */
  file_size: number
  /**
   * 文件类型，即文件后缀
   */
  file_type: string
  /**
   * 场景编码，applet:小程序资源 app:app的资源
   */
  scene: string
}

export default {
  /** 资源列表 */
  resourceList(param?: { terminal?: string } & PageParam) {
    return client.get<PageResult<StorageResource>>('resource/list', param)
  },
  /** 前端资源上传腾讯云存储url获取 */
  resourceGetTempSecret(param?: UploadParams) {
    return client.post<UploadResponse>('resource/get_temp_secret', param)
  },
  /** 业务文件上传腾讯云存储url获取 */
  getTempSecret(param: UploadParams) {
    return client.post<UploadResponse>('get_temp_secret', param)
  },
  /** 获取文件名 */
  resourceGetFileInfo(param: { urls: string[]; file_keys?: string[] }) {
    return client.post<PageResult<{ file_key: string; file_name: string; url: string }>>(
      'resource/get_file_info',
      param
    )
  },
  /** 云存储拷贝文件 */
  copyFiles(param: string[]) {
    return client.post<{ origin_url: string; copied_url: string; copied_key: string }[]>('copy_files', param)
  }
}
