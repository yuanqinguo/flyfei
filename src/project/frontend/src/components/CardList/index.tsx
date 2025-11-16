import { PageParam, PageResult as PageResultDto } from '@/model/dto/Page'
import {
  Affix,
  AffixProps,
  Button,
  ButtonProps,
  Card,
  Checkbox,
  CheckboxProps,
  Empty,
  Flex,
  message,
  Pagination,
  Space,
  type FormInstance,
  type FormProps,
  type TablePaginationConfig
} from 'antd'
import React, { isValidElement, MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { FastColumnProps } from '@/components/FastTable'
import SearchForm from '@/components/FastTable'
import { AnyObject } from 'antd/lib/_util/type'
import Authorization from '@/utils/authorization/Authorization'
import { ConfirmButton, ConfirmButtonProps, ConfirmLinkButtonProps } from '@/components/ConfirmButton'
import { useLocalStorageState, useUpdateEffect } from 'ahooks'
import pick from 'lodash/pick'
import { omit } from 'lodash'
import { getScroller } from '@/utils/dom'

export type PageResult<T> = Partial<PageResultDto<T>>

export interface CardListAction<T> {
  /** 回到第一页重新加载数据 */
  search(params?: any): Promise<void> | void
  /** 重新加载数据 */
  /**
   * 重新加载数据
   * @param params 重新加载数据时传递的参数
   * @param resetSelection 是否重置已选择项
   */
  reload(params?: any, resetSelection?: boolean): Promise<void> | void
  /** 获取列表数据 */
  getList(): T[]
  /** 获取列表已选择项的数据 */
  getSelection(): T[]
  /** 设置已选项 */
  setSelection(selection: T[]): void
  /** 获取表单 */
  getForm(): FormInstance
  /** 设置列表数据 */
  setCardList(list: T[]): void
}

export interface ToolbarAction {
  label: string
  buttonProps?: ButtonProps
  confirmButtonProps?: ConfirmButtonProps | ConfirmLinkButtonProps
}

export interface RenderItemProps<T> {
  row: T
  index: number
  checked: boolean
  onSelect: () => void
  reload?: () => void
  selection?: T[]
  maxSelections?: number
}

export interface CardListProps<T> {
  /** 默认选择项 */
  defaultSelection?: T[]
  /** 最大选择数 */
  maxSelections?: number
  /** 全选文案 */
  checkedAllText?: string
  /** 是否显示全选 */
  showCheckedAll?: boolean
  /** 是否单选 */
  singleSelect?: boolean
  /** 是否显示筛选搜索 */
  search?: boolean
  /** dataSource 的主键，默认为 id */
  rowKey?: string | (() => string)
  /**
   * 数据源
   */
  dataSource?: T[]
  /**
   * 分页配置
   */
  pagination?: false | TablePaginationConfig
  /**
   * 是否渲染完成自动触发 request
   * @default true
   */
  requestImmediate?: boolean
  /**
   * 可以自定义Action事件
   */
  action?: Partial<CardListAction<T>> | ((action: CardListAction<T>) => Partial<CardListAction<T>>)
  /**
   * 可以获取当前组件的 Action
   */
  actionRef?: MutableRefObject<CardListAction<T> | undefined>
  /**
   * 初始化搜索条件
   */
  initialValues?: any | (() => any)
  /**
   * 搜索表单 Form props
   */
  formProps?: FormProps
  /**
   * 搜索表单搜索项配置
   */
  formColumns?: FastColumnProps[]
  /**
   * 接口请求数据
   * @param form 搜索表单以及分页数据
   */
  request?: (form: PageParam) => Promise<PageResult<T | any>> | PageResult<T | any>
  /**
   * request 接口提交之前调用，会以返回值作为搜索条件参数
   * @param param 当前搜索表单数据
   * @param lastParam 上一次的搜索参数
   */
  beforeRequest?(param: PageParam, lastParam?: PageParam): any
  /** 当请求失败时调用 */
  onRequestFailed?: (e: any) => void
  /** Item 组件渲染方法 */
  renderItem: ({
    row,
    index,
    onSelect,
    checked,
    reload,
    selection,
    maxSelections
  }: RenderItemProps<T>) => React.ReactNode
  /** 列表左侧渲染方法 */
  renderListLeft?: React.ReactNode | (() => React.ReactNode)
  /** Toolbar 组件渲染方法  */
  renderToolbar?: React.ReactNode | ((data: { selection: any[] }) => React.ReactNode)
  /** Toolbar Action 会根据传入的数据渲染按钮 */
  toolbarActions?: (ToolbarAction | React.ReactNode)[]
  /** 缓存表单的 key */
  formCache?: boolean | string
  /**
   * 缓存排除的字段
   * @default ['subject_id', 'stage_id']
   */
  formCacheOmitNames?: string[]
  searchAffixProps?: Partial<AffixProps>
  /**
   * 是否显示加载动画
   * @default true
   */
  showLoading?: boolean | ((loading: boolean) => boolean)
  selection?: T[]
  onSelectionChange?: (selection: T[]) => void
}

const defaultProps = {
  rowKey: 'id',
  dataSource: [],
  showCheckedAll: true,
  singleSelect: false,
  requestImmediate: true,
  formCache: true,
  formCacheOmitNames: ['stage_id', 'subject_id'],
  showLoading: true
}

const CardList = <T extends AnyObject>(props: CardListProps<T>) => {
  const {
    rowKey,
    action,
    search,
    formProps,
    actionRef,
    dataSource,
    pagination,
    formColumns,
    initialValues,
    renderToolbar,
    toolbarActions,
    showCheckedAll,
    singleSelect,
    requestImmediate,
    renderListLeft,
    formCache,
    formCacheOmitNames,
    checkedAllText,
    maxSelections,
    searchAffixProps,
    showLoading,
    defaultSelection,
    selection: selectionValue,
    onSelectionChange,
    request,
    renderItem,
    beforeRequest,
    onRequestFailed
  } = { ...defaultProps, ...props }
  const key = typeof rowKey === 'function' ? rowKey() : rowKey

  const rootRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [selection, setSelection] = useState<T[]>(selectionValue || defaultSelection || [])
  const [cardList, setCardList] = useState<T[]>(dataSource || [])
  const [pageResult, setPageResult] = useState<PageResult<T>>({ list: dataSource, total: dataSource?.length })
  const oldValueRef = useRef<any>()
  const formRef = useRef<FormInstance>()

  const [formCacheData, setFormCacheData] = useLocalStorageState(
    `__FAST_TABLE_FORM_${typeof formCache === 'string' ? formCache : location.pathname}__`
  )

  const defaultPaginationProps = useMemo(() => {
    return pagination === false ? {} : pagination || (formCache && pick<any>(formCacheData, ['limit', 'page'])) || {}
  }, [])
  const [pageParam, setPageParam] = useState<PageParam>({
    limit: defaultPaginationProps.pageSize || 10,
    page: defaultPaginationProps.current || 1
  })
  /** 初始化查询参数 */
  const defaultParams = useMemo(() => {
    const defaultValues = {}
    if (formCache) {
      Object.assign(defaultValues, formCacheData)
    }
    return Object.assign(defaultValues, (typeof initialValues === 'function' ? initialValues() : initialValues) || {})
  }, [])

  /** 分页组件参数 */
  const extendPagination = useMemo(() => {
    if (pagination === false) {
      return false
    }
    return {
      pageSize: pageParam.limit,
      current: pageParam.page,
      total: pageResult.total,
      style: {
        marginBottom: 0
      },
      showTotal: total => `共${total}条`,
      onChange(current, limit) {
        sizeOrPageChanged(current, limit)
        if (rootRef.current) {
          getScroller(rootRef.current)?.scrollTo({ top: 0 })
        }
      },
      ...pagination
    } as TablePaginationConfig
  }, [pagination, pageParam, pageResult.total])

  // 当前页是否全选
  const checkAll = useMemo(() => {
    return cardList.every(card => selection.find(item => item[key] === card[key]))
  }, [cardList, selection, key])

  // 当前页是否有部分被选中
  const indeterminate = useMemo(() => {
    const currentPageCheckedList = cardList.filter(card => selection.find(item => item[key] === card[key]))
    return selection.length > 0 && currentPageCheckedList.length < cardList.length
  }, [selection, cardList, key])

  // 点击全选
  const onCheckAllChange: CheckboxProps['onChange'] = e => {
    if (e.target.checked) {
      if (selection.length) {
        const needsToAddList = cardList.filter(card => !selection.find(item => item[key] === card[key]))
        selectionChange([...selection, ...needsToAddList])
      } else {
        selectionChange([...cardList])
      }
    } else {
      // 剩余的选中项
      const restCheckedList = selection.filter(item => !cardList.find(card => card[key] === item[key]))
      selectionChange([...restCheckedList])
    }
  }

  const selectionChange = (selection: T[]) => {
    onSelectionChange?.(selection)
    setSelection(selection)
  }

  const sizeOrPageChanged = (page: number, limit = pageParam.limit) => {
    const newPageParam = { page, limit }
    searchData(undefined, newPageParam).then(() => setPageParam(newPageParam))
  }

  const fetchData = async (formParams = formRef.current?.getFieldsValue(), page = pageParam) => {
    const pageSearchData = { ...page, ...formParams }
    const finalParams = beforeRequest ? beforeRequest(pageSearchData, oldValueRef.current) : pageSearchData
    oldValueRef.current = finalParams
    if (formCache) {
      setFormCacheData(omit(finalParams, formCacheOmitNames))
    }
    return request?.(finalParams)
  }

  const searchData = async (formParams = formRef.current?.getFieldsValue(), page = pageParam) => {
    if (request) {
      setLoading(true)
      try {
        const pageResult = await fetchData(formParams, page)
        setPageResult(pageResult || {})
        setCardList((pageResult && pageResult.list) || [])
        setPageParam({ ...pageParam, page: pageResult?.page || 1 })
      } catch (e) {
        if (onRequestFailed) {
          onRequestFailed(e)
        } else {
          throw e
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const searchFormColumns: FastColumnProps<T>[] = useMemo(() => {
    if (!formColumns) return []
    return formColumns?.filter(c => (c.dataIndex || c.formItemName) && (c.showInSearch ?? search))
  }, [formColumns, search])

  /** item 组件点击选择框 */
  const onItemSelect = (row: T) => {
    const isChecked = selection.find(item => item[key] === row[key])
    if (isChecked) {
      const restCheckedList = selection.filter(item => item[key] !== row[key])
      selectionChange([...restCheckedList])
    } else {
      if (singleSelect) {
        // 单选模式：直接替换当前选择
        selectionChange([row])
      } else {
        if (maxSelections && selection.length >= maxSelections) {
          message.warning('最多只能选择' + maxSelections + '个')
          return
        }
        // 多选模式：添加到已选列表
        selectionChange([...selection, row])
      }
    }
  }

  let cardListAction: CardListAction<T> = {
    reload(params) {
      return new Promise(resolve => {
        setTimeout(() => {
          const formData = formRef.current?.getFieldsValue()
          resolve(searchData({ ...formData, ...params }))
        })
      })
    },
    search(params) {
      return new Promise(resolve => {
        setTimeout(() => {
          const formData = formRef.current?.getFieldsValue()
          resolve(searchData({ ...formData, page: 1, ...params }))
        })
      })
    },
    getSelection() {
      return selection
    },
    setSelection(newSelection: T[]) {
      selectionChange(newSelection)
    },
    getList() {
      return cardList
    },
    getForm() {
      return formRef.current as FormInstance
    },
    setCardList
  }
  if (action) {
    if (typeof action === 'function') {
      cardListAction = { ...cardListAction, ...action(cardListAction) }
    } else {
      cardListAction = { ...cardListAction, ...action }
    }
  }
  if (actionRef) {
    actionRef.current = cardListAction
  }

  useUpdateEffect(() => {
    setSelection(selectionValue || [])
  }, [selectionValue])
  useEffect(() => {
    if (requestImmediate) {
      searchData(defaultParams)
    }
  }, [])
  useEffect(() => {
    if (dataSource) {
      setCardList([...dataSource])
    }
  }, [dataSource])

  const showSearch = useMemo(() => {
    return search !== false && searchFormColumns.length > 0
  }, [search, searchFormColumns])

  return (
    <div ref={rootRef}>
      {useMemo(() => {
        return (
          showSearch && (
            <Affix offsetTop={56} style={{ zIndex: 101 }} {...searchAffixProps}>
              <Card styles={{ body: { paddingBottom: 0 } }}>
                <SearchForm
                  formRef={formRef}
                  formColumns={searchFormColumns}
                  formProps={{
                    labelCol: { span: 3 },
                    ...formProps,
                    initialValues: defaultParams
                  }}
                  onSubmit={value => {
                    return searchData(value, { ...pageParam, page: 1 })
                  }}
                />
              </Card>
            </Affix>
          )
        )
      }, [formProps, formColumns, pageParam])}

      <Flex style={{ gap: '10px', marginTop: showSearch ? '16px' : '0' }}>
        {renderListLeft && (typeof renderListLeft === 'function' ? renderListLeft() : renderListLeft)}
        <Card
          loading={typeof showLoading === 'function' ? showLoading(loading) : showLoading ? loading : false}
          style={{ flex: 1, width: '100%' }}
        >
          <Flex vertical gap={'middle'}>
            <Flex justify={'space-between'} align={'center'} style={{ flex: 1 }}>
              {showCheckedAll && cardList.length > 0 ? (
                <Checkbox
                  style={{ padding: '0 10px' }}
                  indeterminate={indeterminate}
                  onChange={onCheckAllChange}
                  checked={checkAll}
                >
                  {checkedAllText || '全选'}
                </Checkbox>
              ) : (
                // 占位
                <div />
              )}
              {useMemo(() => {
                if (renderToolbar) {
                  return typeof renderToolbar === 'function' ? renderToolbar({ selection }) : renderToolbar
                }
                if (toolbarActions) {
                  return (
                    <Space>
                      {toolbarActions.map((item: any) => {
                        if (isValidElement(item)) {
                          return item
                        }
                        if (item?.buttonProps) {
                          return (
                            <Authorization key={item.label}>
                              <Button {...item.buttonProps}>{item.label}</Button>
                            </Authorization>
                          )
                        }
                        if (item?.confirmButtonProps) {
                          return (
                            <Authorization key={item.label}>
                              <ConfirmButton {...item.confirmButtonProps}>{item.label}</ConfirmButton>
                            </Authorization>
                          )
                        }
                        return null
                      })}
                    </Space>
                  )
                }
              }, [renderToolbar, toolbarActions])}
            </Flex>
            <Flex vertical gap={'middle'}>
              {cardList.length > 0 ? (
                cardList.map((row, index) => {
                  const checked = selection.some(item => item[key] === row[key])
                  return (
                    <div key={row[key]}>
                      {renderItem({
                        row,
                        index,
                        checked,
                        selection,
                        maxSelections,
                        onSelect: () => onItemSelect(row),
                        reload: cardListAction.reload
                      })}
                    </div>
                  )
                })
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Flex>
            {cardList.length > 0 && extendPagination && (
              <Flex justify={'flex-end'}>
                <Pagination {...extendPagination} />
              </Flex>
            )}
          </Flex>
        </Card>
      </Flex>
    </div>
  )
}

export default CardList
