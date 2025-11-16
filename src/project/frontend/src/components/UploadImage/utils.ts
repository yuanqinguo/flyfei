import { getFileExtension, uuid } from '@/utils'
import type { UploadFile } from 'antd'

/**
 * 从 URL 中提取文件名（含后缀）
 * @param url 完整的 URL 字符串
 * @returns 文件名，若未匹配到则返回空字符串
 */
function extractFileName(url: string): string {
  // 使用正则匹配 URL 路径中最后一个 '/' 之后、'?' 或 '#' 之前的部分
  const match = url.match(/\/([^/?#]+)(?:[?#].*)?$/)
  return match ? match[1] : ''
}

/**
 * 从 byboat 后台图片 URL 中提取
 * “admin/channel/dev/…/xxx.png” 这一段
 * @param url 完整图片地址
 */
export function getFileKey(url: string): string {
  if (!url) return ''

  // 1. 解析 pathname
  const { pathname } = new URL(url) // 例如 /admin/channel/dev/xxx/yyy.png

  // 2. 去掉开头的 "/"，剩下的就是我们要的
  return pathname.startsWith('/') ? pathname.slice(1) : pathname
}

interface IUploadFileType extends UploadFile {
  fileKey: string
}

export const genFileList = (url: string | string[]): UploadFile[] => {
  if (!url) return []
  const genFile = (url: string): IUploadFileType => ({
    uid: uuid(),
    name: extractFileName(url),
    fileKey: getFileKey(url),
    status: 'done',
    url
  })

  return Array.isArray(url) ? url.map(genFile) : [genFile(url)]
}
