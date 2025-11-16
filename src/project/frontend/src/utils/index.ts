import { v7 as genUuid } from 'uuid'
import { KeyValue } from './CommonTypes'
import dayjs from 'dayjs'

type IdType = string | number | undefined

/**
 * 将数组映射为一个对象
 * @param source 数组
 * @param getKey    获取对象key的方法
 * @param getValue  获取对象值的方法
 */
export function arrayToObject<T, V>(source: T[], getKey: (t: T) => IdType, getValue: (t: T, exists: V) => V) {
  const map: KeyValue<V> = {}
  source.forEach(item => {
    const key = getKey(item)
    if (key !== undefined) {
      map[key] = getValue(item, map[key])
    }
  })
  return map
}

/**
 * 将数组转换为一个树形结构对象
 * @param source  数组
 * @param getId 获取自身 id 的方法
 * @param getParentId 获取父级id的方法
 * @param childrenKey 子节点属性名称
 */
export function arrayToTree<T extends Record<string, any> & { level?: number }>(
  source: T[],
  getId = (t: T) => t.id,
  getParentId = (t: T) => t.parentId,
  option?: {
    childrenKey?: string
    /** 是否设置 level 层级属性 */
    setLevel?: boolean
  }
) {
  const { childrenKey = 'children', setLevel = false } = option || {}
  source = source.map(item => {
    const node = { ...item }
    if (setLevel) {
      node.level = 1
    }
    return node
  })
  const toMap = arrayToObject(source, getId, t => t)
  const finalTree: T[] = []
  source.forEach(item => {
    const parentId = getParentId(item)
    const parent = parentId && (toMap[parentId] as any)
    if (parent) {
      const children = parent[childrenKey] || []
      if (setLevel) {
        item.level = (parent.level || 0) + 1
      }
      children.push(item)
      parent[childrenKey] = children
    } else {
      finalTree.push(item)
    }
  })
  return finalTree
}

/**
 * 将树形结构转换为数组
 * @param tree 树对象
 */
export function treeToArray<T>(tree: T[], childrenKey: string = 'children'): T[] {
  const result: T[] = []

  function traverse(node: any) {
    if (!node) return
    result.push(node)
    if (node[childrenKey]) {
      node[childrenKey].forEach((child: any) => traverse(child))
    }
  }

  tree.map(node => traverse(node))
  return result
}

/**
 * 模糊匹配字符串数组
 * ('key1 key2', ['key1something', 'key2something']) => true
 * ('key1*', ['key1something', 'key2something']) => true
 * ('key2*', ['key1something', 'key2something']) => true
 * ('some key ing', ['key1something', 'key2something']) => true
 * ('someOther', ['key1something', 'key2something']) => false
 * ('key1 key3 key5', ['key1something', 'key2something']) => false
 *
 * @param searchKey   搜索值
 * @param matchTarget 目标值
 * @return 是否匹配
 */
export const wildcardMatchString = (searchKey?: any, ...matchTarget: string[] | any[]) => {
  if (searchKey !== undefined && searchKey !== '' && searchKey !== null) {
    if (matchTarget.includes(searchKey)) {
      return true
    }
    const splitKeyWord = searchKey.toString().split(' ') as string[]
    const matchLength = splitKeyWord.filter(key => {
      return matchTarget.filter(item => item?.toLowerCase().match(key.toLowerCase())).length > 0
    }).length
    return splitKeyWord.length === matchLength
  }
  return true
}

/**
 * 通过 value 数组过滤树
 * @param tree 树
 * @param values value 数组
 * @param filterOptions 过滤选项
 */
export function filterTree<T extends Record<string, any>>(
  tree: T[],
  value: any[],
  filterOptions?: {
    valueKey?: string
    childrenKey?: string
  }
): T[] {
  const { valueKey = 'id', childrenKey = 'children' } = filterOptions || {}
  const valueSet = new Set(value)

  const filterNode = (node: T): T | null => {
    if (valueSet.has(node[valueKey])) {
      if (node[childrenKey]) {
        const filteredChildren = node[childrenKey].map(filterNode).filter(Boolean)
        return { ...node, [childrenKey]: filteredChildren as T[] }
      } else {
        return node
      }
    }
    return null
  }

  return tree.map(filterNode).filter(Boolean) as T[]
}

/** 获取文件 URL 后缀 */
export const getFileExtension = (url: string) => {
  return (url.split('.').pop() || '').split(/#|\?/)[0]
}

/** 生成 uuid */
export const uuid = () => genUuid().replace(/-/g, '')

/** delay promise */
export const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t))

/**
 * 获取树的路径名称
 * getTreePathName([{name:'foo', id: 1, children: [{ name:'bar', id: 2 }}] }], [1, 2]) => 'foo/bar'
 * @param tree
 * @param values
 * @param options
 * @returns
 */
export const getTreePathName = (
  tree: Record<string, any>,
  values: any[],
  options?: {
    valueKey?: string
    labelKey?: string
    childrenKey?: string
    separator?: string
  }
): string | undefined => {
  const { valueKey = 'value', labelKey = 'label', childrenKey = 'children', separator = '/' } = options || {}
  let currentNode: Record<string, any> | undefined = tree
  const path: string[] = []

  for (const value of values) {
    if (!currentNode) return undefined

    path.push(currentNode[labelKey])

    currentNode = currentNode[childrenKey]?.find((child: Record<string, any>) => child[valueKey] === value)
  }

  return currentNode ? path.join(separator) : undefined
}

/**
 * 数组移动单个值移动
 * const arr = [1, 2, 3, 4, 5]
 * arrayMove(3, -1) => [1, 2, 4, 3, 5] // 将索引3的元素前移一位:
 * arrayMove(1, 1) => [1, 3, 2, 4, 5] // 将索引1的元素后移一位:
 */
export const arrayMove = <T>(arr: T[], index: number, steps: number = 1): T[] => {
  const newArr = [...arr]
  if (index < 0 || index >= newArr.length) {
    return newArr
  }

  const targetIndex = index + steps

  if (targetIndex < 0 || targetIndex >= newArr.length) {
    return newArr
  }

  const item = newArr[index]
  newArr.splice(index, 1)
  newArr.splice(targetIndex, 0, item)

  return newArr
}

/**
 * 将文字插入到富文本字符串前后
 * @param htmlString html 字符串
 * @param textToInsert 插入文本
 * @param position 插入位置，不传默认标签前面
 */
export const insertTextToHtmlString = (htmlString: string = '', textToInsert: string, position?: 'start' | 'end') => {
  if (position === 'end') {
    const tagEndRegex = /(<\/[^>]+>)$/
    // 检查字符串的结尾是否是关闭标签
    if (tagEndRegex.test(htmlString)) {
      // 匹配整个字符串，以便在最后一个关闭标签之前插入文本
      const result = htmlString.replace(/(.*)(<\/[^>]+>)$/, (match, content, endTag) => {
        return `${content}${textToInsert}${endTag}`
      })
      return result
    }
    // 如果结尾不是关闭标签，直接在末尾插入文本
    return htmlString + textToInsert
  }

  const tagStartRegex = /^(<[^>]+>)/
  // 检查字符串的结尾是否是标签
  if (tagStartRegex.test(htmlString)) {
    const regex = /^(<\s*[^>]+>)/
    return htmlString.replace(regex, `$1${textToInsert}`)
  }
  // 如果结尾不是标签，直接在前面插入文本
  return textToInsert + htmlString
}

export const formatDate = (time?: string | number, template: string = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return ''
  return dayjs(time).format(template)
}

/** 去除末尾的 <p><br></p> 标签 */
export const removeTrailingBrP = (html: string): string => {
  // 使用正则表达式匹配末尾的 <p><br></p> 标签
  const regex = /<p><br><\/p>$/

  // 循环去除末尾的 <p><br></p> 标签
  while (regex.test(html)) {
    html = html.replace(regex, '')
  }

  return html
}

/**
 * 智能格式化时间
 * @param {string | number | Date | dayjs.Dayjs} time 需要格式化的时间
 * @returns {string} 格式化后的时间文本
 */
export function formatSmartTime(time: string | number | Date | dayjs.Dayjs) {
  const now = dayjs()
  const targetTime = dayjs(time)

  if (targetTime.isSame(now, 'day')) {
    return targetTime.format('HH:mm')
  } else if (targetTime.isSame(now, 'year')) {
    return targetTime.format('MM-DD HH:mm')
  } else {
    return targetTime.format('YYYY-MM-DD HH:mm')
  }
}

/**
 * 把 hex 颜色和透明度转换成带透明度的 8 位 hex
 * @param hex 原始颜色 (#RRGGBB 或 #RGB)
 * @param alpha 透明度 (0~1 或 0~100)
 * @returns #RRGGBBAA
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  // 支持 #RGB 简写
  if (/^#?[0-9a-f]{3}$/i.test(hex)) {
    hex = hex.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i, '#$1$1$2$2$3$3')
  }

  // 去掉前面的 #
  hex = hex.replace(/^#/, '')

  if (!/^([0-9a-f]{6})$/i.test(hex)) {
    return ''
  }

  // 透明度范围：如果大于1，认为是百分比
  if (alpha > 1) alpha = alpha / 100

  // 转换成 0–255
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')

  return `#${hex}${alphaHex}`
}
