import katex, { KatexOptions } from 'katex'
import 'katex/contrib/mhchem'
import { isKeyHotkey } from 'is-hotkey'
import dayjs from 'dayjs'

/** 是启用状态 */
export const isEnableStatus = (status?: number) => status === 1

/** katex 渲染 */
export const katexRender = (
  str: string,
  elem: HTMLElement,
  options: KatexOptions = {
    throwOnError: false
  }
) => {
  katex.render(`\\displaystyle ${str || ''}`, elem, options)
}

export const IS_MAC = typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent)

interface HotkeyProps {
  /** mac 快捷键 */
  mac?: string | string[]
  /** windows 快捷键 */
  windows?: string | string[]
  /** 通用快捷键 */
  generic?: string | string[]
}

export const createHotkey = ({ mac, windows, generic }: HotkeyProps) => {
  const isGeneric = generic && isKeyHotkey(generic)
  const isMac = mac && isKeyHotkey(mac)
  const isWindows = windows && isKeyHotkey(windows)

  return (event: KeyboardEvent) => {
    if (isGeneric && isGeneric(event)) return true
    if (IS_MAC && isMac && isMac(event)) return true
    if (!IS_MAC && isWindows && isWindows(event)) return true
    return false
  }
}


/**
 * 将元转换为分（避免浮点精度丢失，截断多余小数位）
 * @param yuan 元单位金额
 * @returns 分单位金额（整数）
 */
export function yuanToFen(yuan: number): number {
  if (!yuan) return 0
  // 处理输入为字符串的情况
  const strValue = yuan.toString()

  // 验证输入是否为有效数字
  if (!/^-?\d*(\.\d*)?$/.test(strValue)) {
    throw new Error('输入必须是有效的数字格式')
  }

  // 处理空字符串
  if (strValue === '' || strValue === '.') {
    throw new Error('输入不能为空')
  }

  const isNegative = strValue.startsWith('-')
  // 移除负号以便处理，最后再加回去
  const absoluteValue = isNegative ? strValue.substring(1) : strValue

  // 分割整数和小数部分
  const [integerPart, decimalPart = ''] = absoluteValue.split('.')

  // 处理小数部分：只取前两位，多余部分舍去
  const truncatedDecimal = decimalPart.length > 2 ? decimalPart.substring(0, 2) : decimalPart
  const paddedDecimal = truncatedDecimal.padEnd(2, '0') // 不足两位补零

  // 将整数和小数部分合并为分
  const totalCents = BigInt(integerPart + paddedDecimal)

  // 应用符号
  const result = isNegative ? -totalCents : totalCents

  // 检查是否在安全整数范围内
  if (result > BigInt(Number.MAX_SAFE_INTEGER) || result < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error('超出安全整数范围')
  }

  return Number(result)
}

/**
 * 将分转换为元（避免浮点精度丢失）
 * @param fen 分单位金额（整数）
 * @param showDecimal 是否显示小数
 * @returns 元单位金额（保留两位小数）
 */
export function fenToYuan(fen: number): number
export function fenToYuan(fen: number, showDecimal: false): number
export function fenToYuan(fen: number, showDecimal: true): string
export function fenToYuan(fen: number, showDecimal?: boolean) {
  fen = Math.trunc(fen)
  // 处理符号
  const sign = fen < 0 ? '-' : ''
  const absFen = Math.abs(fen)

  // 转换为字符串并补零
  let fenStr = absFen.toString()
  while (fenStr.length < 3) {
    fenStr = '0' + fenStr // 确保至少有3位数字
  }

  // 分割整数和小数部分
  const integerPart = fenStr.slice(0, -2) || '0'
  const decimalPart = fenStr.slice(-2)

  // 组合结果
  const yuanStr = `${sign}${integerPart}.${decimalPart}`
  return showDecimal ? yuanStr : parseFloat(yuanStr)
}

// 将数字转成千分位
export const toThousands = (num: number) => {
  return num.toLocaleString()
}


