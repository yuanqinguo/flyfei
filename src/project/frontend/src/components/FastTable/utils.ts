import { ColumnType } from './excel/ExcelUtils'
import { ColumnProps } from 'antd/es/table'
import ValueTypeSupport from './ValueType'
import { FastColumnProps } from './TableWrapper'
import dayjs from 'dayjs'
import { fenToYuan } from './Price'

export function isFastColumnProps<T>(columnProps: ColumnType<T>): columnProps is FastColumnProps<T> {
  const props = columnProps as FastColumnProps<T>
  return !!(props.valueType || props.valueEnum)
}

export function getValue(row: any, dataIndex?: ColumnProps<any>['dataIndex']) {
  let value: any | undefined
  if (Array.isArray(dataIndex)) {
    value = row
    dataIndex.forEach(k => {
      value = value && value[k]
    })
  } else if (dataIndex) {
    value = row[dataIndex?.toString()]
  }
  return value
}

export function resolveColumnData<T>(
  { index, row }: { index: number; row: T | any },
  columnMapping: ColumnType<T>
): undefined | number | string | Date {
  let value = getValue(row, columnMapping.dataIndex)
  if (isFastColumnProps(columnMapping)) {
    if (columnMapping.valueType === 'money') {
      value = fenToYuan(value)
    } else if (columnMapping.valueEnum) {
      value = ValueTypeSupport.enum.renderText(value, row, index, columnMapping)
    } else if (columnMapping.valueType) {
      value = ValueTypeSupport[columnMapping.valueType].renderText(value, row, index, columnMapping)
    }
  }
  if (columnMapping.render) {
    const renderValue = columnMapping.render(value, row, index)
    if (['string', 'number'].includes(typeof renderValue)) {
      value = renderValue
    }
  }
  return value
}

export function dataIndexToString(dataIndex?: ColumnProps<any>['dataIndex']) {
  if (Array.isArray(dataIndex)) {
    return dataIndex.join('.')
  }
  return dataIndex?.toString()
}

export const ClassPrefix = 'fast-table'

export function dateFormat(v: any, format: string) {
  return v && dayjs(v).format(format)
}

export function anyToDayjs(v: any, format?: string) {
  return v && dayjs(v, format)
}

export function getScroller(el: Element): Window | Element {
  const overflowScrollReg = /scroll|auto/i
  const target = getTargetParent(el, node => {
    const { overflowY } = window.getComputedStyle(node)
    if (overflowScrollReg.test(overflowY)) {
      return true
    }
    return false
  })

  return target || window
}

export function getTargetParent(el: Element, isTarget: (node: Element) => boolean): Element | null {
  let node: Element | null = el

  while (node && node.tagName !== 'HTML' && node.tagName !== 'BODY' && node.nodeType === 1) {
    if (isTarget(node)) {
      return node
    }
    node = node.parentNode as Element | null
  }

  return null
}
