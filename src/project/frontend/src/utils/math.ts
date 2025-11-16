import BigNumber from 'bignumber.js'

class MathUtils {
  /** 加法 */
  static add(...values: (number | string)[]): number {
    return values.reduce<number>((sum, val) => new BigNumber(sum).plus(new BigNumber(val)).toNumber(), 0)
  }

  /** 减法 */
  static subtract(...values: (number | string)[]): number {
    if (values.length === 0) return 0 // 无输入返回 0
    return values
      .slice(1)
      .reduce<number>(
        (result, val) => new BigNumber(result).minus(new BigNumber(val)).toNumber(),
        new BigNumber(values[0]).toNumber()
      )
  }

  /** 乘法 */
  static multiply(...values: (number | string)[]): number {
    return values.reduce<number>(
      (product, val) => new BigNumber(product).multipliedBy(new BigNumber(val)).toNumber(),
      1
    )
  }

  /** 除法 */
  static divide(...values: (number | string)[]): number {
    if (values.length === 0) throw new Error('At least one value is required for division')
    return values.slice(1).reduce<number>((result, val) => {
      const divisor = new BigNumber(val)
      if (divisor.isZero()) {
        throw new Error('Division by zero')
      }
      return new BigNumber(result).dividedBy(divisor).toNumber()
    }, new BigNumber(values[0]).toNumber())
  }
}

export default MathUtils
