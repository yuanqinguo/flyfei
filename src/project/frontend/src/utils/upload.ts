import COS from 'cos-js-sdk-v5'
import { getFileExtension } from '.'
import StorageService from '@/service/StorageService'

const cosUploadFile = ({ cos, params }: any) =>
  new Promise((resolve, reject) => {
    // https://cloud.tencent.com/document/product/436/64991
    cos.uploadFile(
      {
        ...params,
        SliceSize: 1024 * 1024 * 5,
        onTaskReady: function (taskId: any) {
          console.log(taskId)
        },
        onProgress: function (progressData: any) {
          console.log(JSON.stringify(progressData))
        }
      },
      (err: any, data: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      }
    )
  })

export type UploadType = 'business' | 'resource'

export const uploadFile = async (
  file: any,
  options?: {
    scene: string
    /**
     * 上传接口类型
     * @default `business`
     */
    uploadType?: UploadType
    /** 获取 secret 参数 */
    params?: any
  }
) => {
  const { uploadType = 'business', params, scene } = options || {}
  const res = await (uploadType === 'business' ? StorageService.getTempSecret : StorageService.resourceGetTempSecret)({
    scene,
    file_name: file.name,
    file_size: file.size,
    file_type: getFileExtension(file.name),
    ...params
  })
  const cos = new COS({
    SecretId: res.secret_id, // sts服务下发的临时 secretId
    SecretKey: res.secret_key, // sts服务下发的临时 secretKey
    SecurityToken: res.security_token, // sts服务下发的临时 SessionToken
    StartTime: res.start_time, // 建议传入服务端时间，可避免客户端时间不准导致的签名错误
    ExpiredTime: res.expired_time // 临时密钥过期时间
  })
  const data = await cosUploadFile({
    cos,
    params: {
      Bucket: res.bucket, // 填入您自己的存储桶，必须字段
      Region: res.region, // 存储桶所在地域，例如ap-beijing，必须字段
      Key: res.key, // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
      Body: file // 必须，上传文件对象，可以是input[type="file"]标签选择本地文件后得到的file对象
    }
  })
  return {
    data,
    tempSecret: res
  }
}
