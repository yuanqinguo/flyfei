import React, { RefObject, useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Row, Space } from 'antd'
import { FormInstance, FormProps } from 'antd/es/form'
import { DownOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons'
import throttle from 'lodash/throttle'
import DynamicFormItem from './DynamicFormItem'
import { FastColumnProps } from '../index'
import { ClassPrefix, dataIndexToString } from '../utils'

export interface SearchFormProps<T> {
  /**
   * 表单配置
   */
  formColumns: FastColumnProps<T>[]
  formProps?: FormProps
  onReset?: () => void
  onSubmit?: (value: T | any) => void | Promise<void>
  formRef?: RefObject<FormInstance | null | undefined>
  /** 清空操作 */
  formClearOmitNames?: string[]
  defaultShowInSearch?: boolean

  /**
   * 默认是否收起
   */
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  collapseRender?: false | ((collapsed: boolean) => React.ReactNode)
  actionRender?: (
    defaultAction: React.ReactNode[],
    onSubmit: () => Promise<any>,
    onReset: () => void
  ) => React.ReactNode[]
  filterCount?: number | ((formData: any) => number)
}

const FormClassName = `${ClassPrefix}-search-form`

const maxColSize = 24
const minItemWidth = 310

function computedColSize(width?: number, onComputed?: (col: number) => void) {
  if (width) {
    let newColSize = maxColSize
    const passableSize = [4, 6, 8, 12, 24]
    const span = maxColSize / (width / minItemWidth)
    for (let i = 0; i < passableSize.length; i++) {
      const currentSize = passableSize[i]
      if (span < currentSize || i === passableSize.length - 1) {
        newColSize = currentSize
        break
      }
    }
    onComputed?.(newColSize)
  }
}

const computedColSizeDebounce = throttle(computedColSize, 10)

function SearchForm<T>(props: SearchFormProps<T>) {
  const {
    formColumns,
    formProps,
    onSubmit,
    defaultCollapsed = false,
    collapsed,
    collapseRender,
    formRef,
    formClearOmitNames = [],
    filterCount,
    onCollapse,
    actionRender
  } = props
  const { form, ...formPropsRest } = { ...formProps }
  // eslint-disable-next-line
  const formInstance = form || Form.useForm()[0]

  if (formRef) {
    ;(formRef as any).current = formInstance
  }
  const [loading, setLoading] = useState(false)
  const [colSize, setColSize] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? defaultCollapsed)
  const formData = Form.useWatch([], formInstance)

  // 是否需要展开收起按钮 (如果搜索项数量小于需要展开的数量则不需要)
  const needCollapsed = useMemo(() => {
    const maxFormItemColSize = colSize * formColumns.length
    return maxFormItemColSize > maxColSize
  }, [colSize, formColumns])

  const showColLength = useMemo(() => {
    if (isCollapsed || !needCollapsed) {
      return formColumns.length
    } else {
      return Math.max(maxColSize / colSize - 1, 1)
    }
  }, [colSize, formColumns, isCollapsed])

  const actionColSize = useMemo(() => {
    const formItemLength = showColLength * colSize
    if (maxColSize > formItemLength) {
      return maxColSize - formItemLength
    } else {
      return maxColSize - (formItemLength % maxColSize)
    }
  }, [colSize, showColLength, formColumns])

  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resizeChangeColSize = () => {
      computedColSizeDebounce(ref.current?.clientWidth, newColSize => {
        if (newColSize !== colSize) {
          setColSize(newColSize)
        }
      })
    }
    resizeChangeColSize()
    window.addEventListener('resize', resizeChangeColSize)
    return () => {
      window.removeEventListener('resize', resizeChangeColSize)
    }
  }, [])

  useEffect(() => {
    const collapsedValue = collapseRender === false ? false : collapsed ?? defaultCollapsed
    if (isCollapsed !== collapsedValue) {
      setIsCollapsed(collapsedValue)
    }
  }, [collapsed])

  const CollapseComponent = () => {
    if (collapseRender !== false) {
      return (
        collapseRender?.(isCollapsed) || (
          <a
            type={'link'}
            onClick={() => {
              const newCollapse = !isCollapsed
              onCollapse?.(newCollapse)
              collapsed ?? setIsCollapsed(newCollapse)
            }}
          >
            {isCollapsed ? (
              <span>
                收起 <UpOutlined />
              </span>
            ) : (
              <span>
                展开 <DownOutlined />
              </span>
            )}
          </a>
        )
      )
    }
    return <span />
  }

  const filterCountValue = useMemo(() => {
    if (typeof filterCount === 'number') {
      return filterCount
    } else if (typeof filterCount === 'function') {
      return filterCount(formData)
    } else {
      return Object.values(formData || {}).reduce<number>((count, value) => {
        if (value) {
          count++
        }
        return count
      }, 0)
    }
  }, [formData, filterCount])

  const defaultActions: React.ReactNode[] = [
    <Button key={'submit'} htmlType={'submit'} type={'primary'} loading={loading} icon={<SearchOutlined />}>
      搜索
    </Button>,
    <Button
      key={'reset'}
      onClick={() => {
        const fields = formInstance.getFieldsValue(true)
        const keys = Object.keys(fields).filter(key => !formClearOmitNames.includes(key))
        const clearedFields = keys.reduce<any>((acc, key) => {
          acc[key] = undefined
          return acc
        }, {})

        formInstance.setFieldsValue(clearedFields)
      }}
    >
      清空{filterCountValue ? `(${filterCountValue})` : ''}
    </Button>,
    needCollapsed && <CollapseComponent key={'collapse'} />
  ]

  const FormActions = useMemo(
    () =>
      actionRender?.(
        defaultActions,
        () => {
          return formInstance.validateFields()
        },
        () => {
          formInstance.resetFields()
        }
      ) || defaultActions,
    [actionRender, isCollapsed, collapsed, needCollapsed, loading, formData]
  )

  return (
    <div ref={ref} className={FormClassName}>
      <Form
        form={formInstance}
        {...formPropsRest}
        onFinish={async value => {
          if (!loading) {
            try {
              setLoading(true)
              await onSubmit?.(value as T)
            } finally {
              setLoading(false)
            }
          }
        }}
      >
        <Row gutter={16}>
          {formColumns.map((item, index) => {
            let columnSpan = colSize
            const formItemColSize = item.formItemColSize

            if (formItemColSize && formItemColSize > colSize) {
              columnSpan = Math.min(formItemColSize, 24)
            }
            return (
              <Col
                span={columnSpan}
                style={{ display: index < showColLength ? 'block' : 'none' }}
                key={(item.formItemName ?? dataIndexToString(item.dataIndex)!) + index}
              >
                <DynamicFormItem {...item} />
              </Col>
            )
          })}
          <Col span={actionColSize} style={{ textAlign: 'end' }}>
            <Form.Item className={`${FormClassName}-action`} labelAlign="right">
              <Space>{FormActions}</Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default SearchForm
