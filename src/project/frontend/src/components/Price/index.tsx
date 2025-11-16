import { fenToYuan, toThousands } from '@/utils/business'

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
