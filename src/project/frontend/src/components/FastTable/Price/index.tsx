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

interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  value?: number
  prefix?: string
}

const Price = ({ value, prefix = '￥', ...props }: PriceProps) => {
  if (typeof value !== 'number') return ''
  return (
    <span {...props}>
      {prefix}
      {toThousands(fenToYuan(value))}
    </span>
  )
}

export default Price
