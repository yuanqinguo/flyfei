import $ from 'jquery'
import { getFileExtension } from '.'
import { message } from 'antd'

/**
 * 选择文件
 */
export const selectFile = (option?: { accept?: string; multiple?: boolean }): Promise<FileList> => {
  const { accept = 'image/*', multiple = false } = option || {}
  return new Promise((resolve, reject) => {
    const $body = $('body')
    const $inputFile = $(`<input type="file" accept="${accept}" ${multiple ? 'multiple' : ''} />`)
    $inputFile.hide()
    $body.append($inputFile)
    $inputFile.click()

    $inputFile.on('change', async () => {
      const files = ($inputFile[0] as HTMLInputElement).files
      if (files && files.length > 0) {
        resolve(files)
      } else {
        reject()
      }
    })
  })
}

export const fileToBase64 = (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = error => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to Base64'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 下载文件
 * @param url
 * @param option 文件名或 option
 */
export const downloadFile = (url: string, option?: string | { fileName?: string; addAttachParams?: boolean }) => {
  const fileName = (typeof option === 'string' ? option : option?.fileName || '').replaceAll('\n', '')
  const addAttachParams = typeof option === 'object' ? option.addAttachParams : url.includes('byboat.cn')
  const a = document.createElement('a')
  a.setAttribute('name', 'downloadFile')
  if (fileName) a.setAttribute('download', fileName)
  a.style.position = 'fixed'
  a.style.left = '-99999px'
  a.target = '_blank'
  document.body.appendChild(a)
  const fileExtension = getFileExtension(url)
  const filename = fileName && !fileName.includes('.') ? `${fileName}.${fileExtension}` : fileName
  const responseParams = `response-content-disposition=${encodeURIComponent(`attachment;${filename ? `filename=${filename}` : ''}`)}`
  a.href = addAttachParams ? `${url}${url?.includes('?') ? '&' : '?'}${responseParams}` : url
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
  }, 10)
}

type Column = {
  /** 导出的标题 */
  title: string
  /** 字段名 */
  name: string
}

/**
 * 导出csv文件
 * @param columns 列
 * @param dataList 数据
 * @param fileName 文件名
 */
export function exportCsv(columns: Column[], dataList: any[], fileName: string) {
  const title = columns.map(item => item.title)
  const keyArray = columns.map(item => item.name)
  const str = []
  str.push(title.join(',') + '\n')

  for (let i = 0; i < dataList.length; i++) {
    const temp = []
    for (let j = 0; j < keyArray.length; j++) {
      const col = dataList[i][keyArray[j]]
      if (typeof col === 'string') {
        temp.push(col.replace(/\n/g, ' '))
      } else {
        temp.push(col)
      }
    }
    str.push(temp.join(',') + '\n')
  }

  const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str.join(''))
  downloadFile(uri, {
    fileName,
    addAttachParams: false
  })
}

export async function getClipboardImageBlob() {
  // 1. 获取剪贴板内容
  const clipboardItems = await navigator.clipboard.read()
  console.log('clipboardItems', clipboardItems)
  // 2. 检查剪贴板内容是否包含图片
  for (const clipboardItem of clipboardItems) {
    for (const type of clipboardItem.types) {
      if (type.startsWith('image/')) {
        // 3. 将图片转换为 Blob 对象
        const blob = await clipboardItem.getType(type)

        return blob
      }
    }
  }
  message.warning('没有识别到剪贴板中的图片')
}

/**
 * 读取剪贴板中的图片，返回 File 对象。
 * 浏览器必须处于安全上下文（https / localhost），且用户触发事件里调用（如点击）。
 */
export async function getClipboardImageFile(): Promise<File | null> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    console.warn('当前浏览器不支持 Clipboard API')
    return null
  }

  try {
    // 读取剪贴板内容
    const items = await navigator.clipboard.read()
    for (const item of items) {
      // 查找 image/* 类型的 blob
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type)

          // 生成文件名（可选：timestamp + 原扩展名）
          const ext = type.split('/')[1] // png / jpeg / gif ...
          const fileName = `clipboard_${Date.now()}.${ext}`

          // Blob -> File
          return new File([blob], fileName, {
            type,
            lastModified: Date.now()
          })
        }
      }
    }
  } catch (err) {
    console.error('读取剪贴板失败:', err)
  }
  message.warning('没有识别到剪贴板中的图片')

  return null // 没有图片
}
