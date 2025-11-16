import { DatePicker, DatePickerProps, Input, Select, TimePicker, Tooltip } from 'antd'
import React from 'react'
import { anyToDayjs, dateFormat } from './utils'
import { FastColumnProps } from './TableWrapper'
import { SelectProps } from 'antd/es/select'
import { InputProps } from 'antd/es/input'
import { RangePickerProps } from 'antd/lib/date-picker'
import dayjs from 'dayjs'
import Price from './Price'

const RANGE_JOIN_STRING = '~'

export type RenderFormItem<T> = (
  props: { value?: any; onChange?: (value: any | any[]) => void; record?: T },
  column: FastColumnProps
) => React.ReactNode
export interface ValueTypeRender<T = any> {
  renderText(value: any, row: T, index: number, column: FastColumnProps): React.ReactNode

  renderNode?(value: any, row: T, index: number, column: FastColumnProps): React.ReactNode

  renderFormItem?: RenderFormItem<T>
}

const TextRender: ValueTypeRender = {
  renderText(v, row, index, column) {
    if (column.showTooltip) {
      return (
        <Tooltip placement="topLeft" title={v}>
          {v}
        </Tooltip>
      )
    }
    return v
  },
  renderFormItem(props, column) {
    return <Input placeholder="请输入" {...(column.formItemFieldProps as InputProps)} {...props} />
  }
}

const DATE_FORMAT_STRING = 'YYYY-MM-DD'
const TIME_FORMAT_STRING = 'HH:mm:ss'
const DATE_TIME_FORMAT_STRING = `${DATE_FORMAT_STRING} ${TIME_FORMAT_STRING}`

function getDatePickerRender(showTime?: boolean): ValueTypeRender {
  const format = showTime ? DATE_TIME_FORMAT_STRING : DATE_FORMAT_STRING
  return {
    renderText(v) {
      if (!v) return ''
      return dateFormat(v, format)
    },
    renderFormItem({ onChange, value }, column) {
      return (
        <DatePicker
          {...(column.formItemFieldProps as DatePickerProps)}
          showTime={showTime}
          value={anyToDayjs(value)}
          placeholder="请选择"
          onChange={v => onChange?.(anyToDayjs(v)?.valueOf())}
        />
      )
    }
  }
}

function getDateRangePickerRender(showTime?: boolean): ValueTypeRender {
  return {
    renderText(value: any) {
      if (!value) return ''
      const formatString = showTime ? DATE_TIME_FORMAT_STRING : DATE_FORMAT_STRING
      if (Array.isArray(value)) {
        return value
          .filter(v => v)
          .map(item => dateFormat(item, formatString))
          .join(RANGE_JOIN_STRING)
      }
      return dateFormat(value, formatString)
    },
    renderFormItem({ onChange, value }, column) {
      const formItemFieldProps = column.formItemFieldProps as RangePickerProps
      if (Array.isArray(value)) {
        value = value.map(v => anyToDayjs(v))
      } else {
        value = []
      }
      return (
        <DatePicker.RangePicker
          value={value}
          style={{ width: '100%' }}
          placeholder={showTime ? ['开始时间', '结束时间'] : ['开始日期', '结束日期']}
          onChange={changeValue => {
            const [start, end] = changeValue || []
            if (start && end) {
              const values = [anyToDayjs(start).startOf('day').valueOf(), anyToDayjs(end).endOf('day').valueOf()]
              return onChange?.(values)
            }
            return onChange?.(changeValue || [])
          }}
          presets={[
            { label: '近一周', value: [dayjs().add(-7, 'd'), dayjs()] },
            { label: '近两周', value: [dayjs().add(-14, 'd'), dayjs()] },
            { label: '近一月', value: [dayjs().add(-1, 'month'), dayjs()] },
            { label: '近三月', value: [dayjs().add(-3, 'month'), dayjs()] },
            { label: '近半年', value: [dayjs().add(-6, 'month'), dayjs()] },
            { label: '近一年', value: [dayjs().add(-1, 'year'), dayjs()] }
          ]}
          {...formItemFieldProps}
          showTime={formItemFieldProps?.showTime ?? showTime}
        />
      )
    }
  }
}

const TimePickerRender: ValueTypeRender = {
  renderText(value) {
    if (!value) return ''
    return dateFormat(value, TIME_FORMAT_STRING)
  },
  renderFormItem({ onChange, value }) {
    return (
      <TimePicker
        placeholder="请选择"
        value={anyToDayjs(value, TIME_FORMAT_STRING)}
        onChange={v => onChange?.(anyToDayjs(v).valueOf())}
      />
    )
  }
}

const TimeRangePickerRender: ValueTypeRender = {
  renderText(value) {
    if (!value) return ''
    if (Array.isArray(value)) {
      return value
        .filter(v => v)
        .map(v => dateFormat(v, TIME_FORMAT_STRING))
        .join(RANGE_JOIN_STRING)
    }
    return dateFormat(value, TIME_FORMAT_STRING)
  },
  renderFormItem({ onChange, value }) {
    if (Array.isArray(value)) {
      value = value.map(v => anyToDayjs(v, TIME_FORMAT_STRING))
    } else {
      value = []
    }
    return (
      <TimePicker.RangePicker
        value={value}
        placeholder={['开始时间', '结束时间']}
        style={{ width: '100%' }}
        onChange={changeValue => {
          const values = (changeValue || []).map(v => anyToDayjs(v).valueOf())
          return onChange?.(values)
        }}
      />
    )
  }
}

const EnumRender: ValueTypeRender = {
  renderText(v, row, index, column) {
    if ((column.formItemFieldProps as SelectProps<any>)?.mode === 'multiple') {
      if (typeof v === 'string') {
        return v
          .split(',')
          .map(item => column.valueEnum?.[item] || item)
          .join(',')
      }
    }
    return column.valueEnum?.[v] ?? v
  },
  renderNode(v, row, index, column) {
    const text = EnumRender.renderText(v, row, index, column)
    return text
  },
  renderFormItem(props, column) {
    const valueEnum = column.valueEnum
    if (valueEnum) {
      return (
        <Select
          showSearch
          optionFilterProp={'label'}
          allowClear
          placeholder="请选择"
          options={
            Object.keys(valueEnum).map(k => ({
              value: /\d/g.test(String(k)) ? Number(k) : k,
              label: valueEnum[k] || k
            })) as any
          }
          getPopupContainer={triggerNode => triggerNode.parentElement}
          {...(column.formItemFieldProps as SelectProps<any>)}
          {...props}
        />
      )
    }
    return TextRender.renderFormItem!(props, column)
  }
}

const ValueTypeSupport = {
  /**
   * 索引类型
   */
  index: {
    renderText(v, row, index: number) {
      return index + 1
    }
  } as ValueTypeRender,
  /**
   * 文本类型
   */
  text: TextRender,
  /**
   * 默认类型（文本类型）
   */
  default: TextRender,
  /**
   * 金额类型
   */
  money: {
    renderText(v) {
      return <Price value={v} />
    },
    renderFormItem: TextRender.renderFormItem
  } as ValueTypeRender,
  /**
   * 日期类型
   */
  date: getDatePickerRender(),
  /**
   * 日期时间类型
   */
  datetime: getDatePickerRender(true),
  /**
   * 时间类型
   */
  time: TimePickerRender,
  /**
   * 日期范围类型
   */
  dateRange: getDateRangePickerRender(),
  /**
   * 日期时间范围类型
   */
  datetimeRange: getDateRangePickerRender(true),
  /**
   * 时间范围类型
   */
  timeRange: TimeRangePickerRender,
  /**
   * 枚举类型
   */
  enum: EnumRender
}

export type ValueType = keyof Omit<typeof ValueTypeSupport, 'enum' | 'default'>

export default ValueTypeSupport
