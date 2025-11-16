import {
  Form,
  Table,
  InputProps,
  SelectProps,
  DatePickerProps,
  Card,
  FormItemProps,
  Affix,
  AffixProps,
  message
} from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useState, useRef, useContext, useMemo, RefObject, useEffect } from 'react'
import { FormInstance, FormProps, RuleObject } from 'antd/es/form'
import { ColumnProps, TableProps, TablePaginationConfig } from 'antd/es/table'
import TableContext from '../context/TableContext'
import SearchForm, { SearchFormProps } from '../SearchForm'
import ValueTypeSupport, { ValueType, RenderFormItem } from '../ValueType'
import { ClassPrefix, dateFormat, getScroller } from '../utils'
import DraggableRow, { DragData, DraggableDomClass, DraggableRowProps } from './DraggableRow'
import { ColumnSettingConfig } from '../TableToolBar/ColumnSetting'
import TableToolBar, { TableToolBarProps, defaultOptions } from '../TableToolBar'
import { PageParam, PageResult as PageResultDto } from '../../../types/Page'
import './index.scss'
import { useLocalStorageState } from 'ahooks'
import pick from 'lodash/pick'
import EditableCell, { EditableCellProps } from './EditableCell'
import omit from 'lodash/omit'
import { ImportProps } from '../ImportDialog/ImportTable'
import ExcelUtils from '../excel/ExcelUtils'
import ImportDialog from '../ImportDialog'

const TABLE_COLUMN_SETTING_CACHE_PREFIX = 'FAST_TABLE_COLUMN_CACHE_'

export type Store<T = any> = { [key: string]: T }

export type PageResult<T> = Partial<PageResultDto<T>>

export interface FastColumnProps<T = any> extends ColumnProps<T> {
  title: React.ReactNode
  /**
   * 是否显示在搜索表单中
   * @default defaultShowInSearch
   */
  showInSearch?: boolean
  /**
   * 是否在表格中隐藏此列（通常用于构建搜索）
   */
  hiddenInTable?: boolean
  /**
   * 值类型，不同类型会有不同的渲染效果以及表单组件
   * @default 'text'
   */
  valueType?: ValueType
  /**
   * 表格数据会自动渲染为枚举值
   *
   * 搜索表单会使用 `Select` 组件
   */
  valueEnum?: { [key: string]: string | number }
  /**
   * 搜索/编辑表单提交时的属性名，默认使用 dataIndex 的值
   */
  formItemName?: string | string[]
  /** 表单自定义组件渲染 */
  formItemRender?: RenderFormItem<T>
  /** 表单组件属性 */
  formItemFieldProps?: InputProps | SelectProps<T> | DatePickerProps | Store
  /** FormItem 属性 */
  formItemProps?: FormItemProps
  /** 是否是 NamesFormItem */
  isNamesFormItem?: boolean
  /** 表单组件占比大小 */
  formItemColSize?: number
  /**
   * 显示 tooltip
   */
  showTooltip?: boolean
  /**
   * 是否可编辑
   * 当此属性为 `true` 时，必须有 dataIndex 或者 formItemName 属性
   */
  editable?: boolean | ((record: T) => boolean)
  /**
   * 是否显示编辑按钮，在 editable 为 `true` 时有效
   * @default true
   */
  showEditButton?: boolean
  /** editable 保存时数据校验规则，和 `Form` 组件的 `rules` 属性一致 */
  rules?: RuleObject[] | ((row: T, index?: number) => RuleObject[])
  /**
   * 编辑确认
   * @return
   * 如果返回值为空时，合并当前表单到 row；
   * 如果返回值不为空，合并返回值到 row；
   * 返回 false 则不做任何处理
   */
  onEditConfirm?: (values: any, record: T) => Promise<T | undefined | void | false>
  /** 导出时忽略此字段 */
  exportIgnore?: boolean
  /** 导入时忽略此字段 */
  importIgnore?: boolean
  /** 导入时处理值 */
  importValue?:
    | {
        /** 显示值 */
        display?: (value: any, row: T, index: number) => any
        /** 导入值 */
        value?: (value: any, row: T, index: number) => any
      }
    | ((value: any, row: T, index: number) => any)
}

export type ImportColumnProps<T> = Pick<
  FastColumnProps<T>,
  'title' | 'dataIndex' | 'rules' | 'importIgnore' | 'valueEnum' | 'width' | 'importValue'
>

export interface TableAction {
  /** 获取当前搜索表单数据 */
  getFormData(): Record<string, any>
  /** 重新加载数据, 分页到第一页 */
  search(params?: any): Promise<void> | void
  /** 重新加载数据 */
  reload(params?: any): Promise<void> | void

  /**
   * 重新加载数据，并且默认值会保存到搜索表单中
   */
  reloadWithDefaultParams(params?: any): Promise<void> | void

  /** 全屏 */
  fullscreen(): void

  /** 退出全屏 */
  exitFullscreen(): void

  /** 打开导入 Dialog */
  import(): void

  /** 导出 Excel */
  export(): Promise<void> | void

  /** 修改列设置
   * @param columnSettings 修改列设置
   */
  columnSetting(columnSettings?: ColumnSettingConfig[]): void
}

export interface FastTableProps<T extends object> extends TableProps<T> {
  dataSource?: T[]
  columns: FastColumnProps<T>[]
  /**
   * 可以自定义TableAction事件
   */
  action?: Partial<TableAction> | ((action: TableAction) => Partial<TableAction>)
  /**
   * 可以获取当前Table的 TableAction
   */
  actionRef?: RefObject<TableAction | null | undefined>
  /**
   * 可以获取当前Table的 EditAction
   */
  editRef?: RefObject<EditAction<T> | null | undefined>
  /**
   * 接口请求数据
   * @param form 搜索表单以及分页数据
   */
  request?: (form: PageParam) => Promise<PageResult<T>> | PageResult<T>
  /**
   * 是否渲染完成自动触发 request
   * @default true
   */
  requestImmediate?: boolean
  /**
   * 搜索表单配置, 为 false 时，不显示搜索表单
   */
  search?:
    | {
        /**
         * 默认是否显示在搜索表单中
         *
         * @default true
         */
        defaultShowInSearch?: boolean
        /**
         * 搜索表单默认展开
         *
         * @default false
         */
        defaultCollapsed?: boolean
      }
    | false
  /**
   * 搜索表单 Form props
   */
  formProps?: FormProps
  /**
   * 初始化搜索条件
   */
  initialValues?: any | (() => any)
  /** 当请求失败时调用 */
  onRequestFailed?: (e: any) => void
  /**
   * request 接口提交之前调用，会以返回值作为搜索条件参数
   * @param param 当前搜索表单数据
   * @param lastParam 上一次的搜索参数
   */
  beforeRequest?(param: PageParam, lastParam?: PageParam): any
  /**
   * 搜索表单提交前调用，会以返回值作为搜索条件参数
   * @param param 当前搜索表单数据
   */
  beforeSearchSubmit?(param: PageParam): Record<string, any>
  /**
   * 启用行拖拽, 继承 column 属性
   * @param onRowDragEnd 拖拽结束事件
   * @param enable  启动滚动，默认true
   * @param canDrag 是否可以滚动
   */
  enableRowDrag?: FastColumnProps<T> & {
    /**
     * 是否启动
     * @default false
     */
    enable?: boolean
    /**
     * 行拖拽事件 DragData 对象提供了拖拽前后的元数据
     * 此方法如果返回一个数组，table 会根据返回值重新渲染
     * @param dragData 拖动完成后的元数据
     * @param dragAfterData 拖拽后的数组(会自动根据拖拽动作排序)
     * @param dragSourceData 拖拽前的数组
     */
    onRowDragEnd?(
      dragData: Required<DragData<T>>,
      dragAfterData: T[],
      dragSourceData: T[]
    ): T[] | void | Promise<T[] | void>
    /** 是否可以滚动 */
    canDrag?(data: T): boolean
  }

  /** 默认列设置，可以控制列隐藏，显示，浮动，排序 */
  defaultColumnSettings?: ColumnSettingConfig[]
  /** 当列设置发生改变时 */
  onColumnSettingChange?: (columnSettings: ColumnSettingConfig[]) => void
  /** 列设置缓存名称，如果设置了此属性，用户在修改表格列设置后，会缓存列状态至本地localStorage */
  columnSettingCacheKey?: string
  /** 表格标题 */
  headerTitle?: React.ReactNode
  /**
   * 工具栏选项,为 `false` 时不显示工具栏
   * @default `{
   *  reload: true,
   *  fullscreen: true,
   *  import: false,
   *  export: false,
   *  columnSetting: true
   * }`
   */
  options?: TableToolBarProps['options']
  /**
   * 工具栏渲染方法，此属性传入的组件，会用分隔符分隔在工具栏左边
   */
  toolBarRender?: React.ReactNode[] | ((action: TableAction) => React.ReactNode[])
  /** 点击搜索的回调 */
  onSearch?: (params: T) => void
  /**
   * 是否显示卡片样式
   * @default true
   */
  isCard?: boolean
  /**
   * 缓存表单的 key
   */
  formCache?: boolean | string
  /**
   * 缓存排除的字段
   * @default `['subject_id', 'stage_id']`
   */
  formCacheOmitNames?: string[]
  /**
   * 清空筛选条件时排除的字段
   * @default []
   */
  formClearOmitNames?: string[]
  /**
   * 是否启用搜索表单的 Affix
   */
  enableSearchAffix?: boolean
  /**
   * Affix 属性
   */
  affixProps?: Omit<AffixProps, 'children'>
  /** 导入选项 */
  importOptions?: Partial<Omit<ImportProps<T>, 'actionRef' | 'uploadBtnRef' | 'downloadTemplateBtnRef'>>
  /**
   * 导出选项
   */
  exportOptions?: {
    /** 导出文件名，默认使用 `headerTitle + 'YYYYMMDDHHmmss'.xlsx` */
    exportRequest?: (form: PageParam & Record<string, any>) => Promise<PageResult<T> | false>
    /** 不传时，使用 onRequestFailed 属性 */
    onExportRequestFailed?: (e: any) => void
    /** 是否可以导出的前置判断，返回 `false` 时不能导出 */
    canExport?: (dataSource: T[]) => boolean
    /**
     * 没有数据可以导出时的提示信息
     * @default '当前没有数据可以导出'
     */
    cannotExportMessage?: string
    /** 导出文件名 */
    exportFileName?: string | (() => string)
    /** 导出columns 如果没有则使用当前table存在的 */
    exportColumns?: FastColumnProps<T>[]
  }
  /** 自定义筛选数量统计 */
  filterCount?: SearchFormProps<T>['filterCount']
}

export interface EditAction<T> {
  /**
   * 创建新一行
   */
  create(defaultValue?: T): T

  /**
   * 让某一行处于编辑状态
   * @param row 需要编辑的行
   * @param defaultValue 表单默认值，如果不传使用 `row` 的值
   */
  edit(row: T, defaultValue?: T): void

  /**
   * 取消当前编辑状态
   */
  cancel(): void

  /**
   * 确认编辑，会将表单数据和row数据合并，并且渲染table，如果不传 fromValue，不会修改数据
   * @param row 当前行
   * @param formValue 编辑的表单数据
   */
  confirm(row: T, formValue?: T): void

  /**
   * 校验表单，校验通过会返回表单数据
   */
  validateFields(): Promise<T>

  /** 获取当前编辑的行 */
  getCurrentEditRow(): T | undefined
}

function fastColumnToColumn<T>(props: FastColumnProps<T>, editAction: EditAction<T>) {
  const { valueType, valueEnum, showTooltip, editable, formItemName, ...rest } = props
  const innerRender: FastColumnProps<T>['render'] = (text, row, index) => {
    let render = ValueTypeSupport.default
    if (valueEnum) {
      render = ValueTypeSupport.enum
    } else if (valueType) {
      render = ValueTypeSupport[valueType]
    }
    return (render?.renderNode || render?.renderText)?.(text, row, index, props) ?? text
  }
  const hasCellKey = rest.dataIndex || formItemName
  if (editable && !hasCellKey) {
    console.warn('editable column required `dataIndex` or `formItemName` prop')
  }
  const onCell: ColumnProps<T>['onCell'] | undefined =
    editable && hasCellKey
      ? (record, index) => {
          const cellProps: EditableCellProps<T> = {
            editable,
            columnProps: props,
            editing: record === editAction.getCurrentEditRow(),
            record,
            rowIndex: index,
            editAction
          }
          return cellProps
        }
      : undefined

  return {
    onCell,
    render(text, item, t) {
      return innerRender(text, item, t)
    },
    ...rest
  } as ColumnProps<T>
}

function isColumnSettings(x: any): x is ColumnSettingConfig[] {
  return Array.isArray(x) && x.every(x => x.sort !== undefined)
}

function buildSettingCacheKey(cacheKey: string) {
  return `${TABLE_COLUMN_SETTING_CACHE_PREFIX}${cacheKey}`
}

/**
 * 将列设置放入缓存中
 */
function cacheColumnSetting(cacheKey: string, columnSettings: ColumnSettingConfig[]) {
  localStorage.setItem(buildSettingCacheKey(cacheKey), JSON.stringify(columnSettings))
}

function getCacheColumnSetting(cacheKey?: string) {
  if (cacheKey) {
    const cacheData = localStorage.getItem(buildSettingCacheKey(cacheKey))
    if (cacheData) {
      const columnSettings = JSON.parse(cacheData)
      if (isColumnSettings(columnSettings)) {
        return columnSettings
      }
    }
  }
}

const fillChildren = (data: any[], allWithChildren: any[] = []) => {
  data.forEach(item => {
    allWithChildren.push(item)
    if (Array.isArray(item?.children)) {
      fillChildren(item.children, allWithChildren)
    }
  })
  return allWithChildren
}

const TableWrapper = <T extends object>(props: FastTableProps<T>) => {
  const defaultProps = useContext(TableContext)
  const {
    dataSource,
    columns,
    pagination,
    requestImmediate = true,
    search,
    formProps,
    initialValues,
    actionRef,
    editRef,
    action,
    enableRowDrag = { enable: false, onRowDragEnd: () => {}, canDrag: () => false },
    bordered = false,
    isCard = true,
    size = 'small',
    enableSearchAffix,
    affixProps,
    exportOptions,
    importOptions,
    rowSelection,
    beforeRequest,
    request,
    onRequestFailed,
    beforeSearchSubmit,

    columnSettingCacheKey,
    onColumnSettingChange,
    defaultColumnSettings = getCacheColumnSetting(columnSettingCacheKey),

    options = defaultOptions,
    headerTitle,
    toolBarRender,
    formCache = true,
    formCacheOmitNames = ['stage_id', 'subject_id'],
    formClearOmitNames,
    filterCount,
    ...rest
  } = { ...defaultProps, ...props }

  const [tableData, setTableData] = useState<T[]>(dataSource || [])
  const tableDataRef = useRef<T[]>(tableData)
  const [columnSettings, setColumnSettings] = useState(defaultColumnSettings)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<FormInstance>(null)
  const [importDialogShow, setImportDialogShow] = useState(false)
  const [form] = Form.useForm()
  const oldValueRef = useRef<any>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragData<T>>(null)
  const { enable: isEnableRowDrag = true, onRowDragEnd, canDrag } = enableRowDrag
  const [formCacheData, setFormCacheData] = useLocalStorageState(
    `__FAST_TABLE_FORM_${typeof formCache === 'string' ? formCache : location.pathname}__`
  )
  const [currentEditRow, setCurrentEditRow] = useState<{
    row?: T
    isCreate?: boolean
  }>()

  let tableAction: TableAction = {
    getFormData() {
      return formRef.current?.getFieldsValue()
    },
    search(params) {
      return new Promise(resolve => {
        setTimeout(() => {
          const formData = formRef.current?.getFieldsValue()
          resolve(searchData({ ...formData, page: 1, ...params }))
        })
      })
    },
    reload(params) {
      return new Promise(resolve => {
        setTimeout(() => {
          const formData = formRef.current?.getFieldsValue()
          resolve(searchData({ ...formData, ...params }))
        })
      })
    },
    reloadWithDefaultParams(params) {
      return new Promise(resolve => {
        setTimeout(() => {
          const formData = formRef.current?.getFieldsValue()
          formRef.current?.setFieldsValue(params)
          resolve(searchData({ ...formData, ...params }))
        })
      })
    },
    fullscreen() {
      document.documentElement.requestFullscreen()
    },
    exitFullscreen() {
      document.exitFullscreen()
    },
    columnSetting(columnSettings?: ColumnSettingConfig[]) {
      if (columnSettings) {
        setColumnSettings(columnSettings)
        onColumnSettingChange?.(columnSettings)
        columnSettingCacheKey && cacheColumnSetting(columnSettingCacheKey, columnSettings)
      }
    },
    import() {
      setImportDialogShow(true)
    },
    async export() {
      const canExport = exportOptions?.canExport
        ? exportOptions.canExport(tableDataRef.current)
        : !!tableDataRef.current.length
      if (!canExport) {
        message.warning(exportOptions?.cannotExportMessage || '当前没有数据可以导出')
        return
      }
      const fetchDataFunction =
        exportOptions?.exportRequest ||
        (request && (async (form: any) => await fetchData(form))) ||
        (() => ({ list: tableDataRef.current }))
      try {
        const data = await fetchDataFunction({ ...pageParam, ...formRef.current?.getFieldsValue(), queryAll: true })
        if (data && Array.isArray(data.list)) {
          const { list } = data
          let fileName
          if (typeof exportOptions?.exportFileName === 'function') {
            fileName = exportOptions.exportFileName()
          } else {
            fileName =
              exportOptions?.exportFileName ||
              (headerTitle ? headerTitle + '-' : '' + dateFormat(new Date(), 'YYYYMMDDHHmmss'))
          }
          const columns = exportOptions?.exportColumns ?? showInTableColumns.filter(c => !c.exportIgnore && c.dataIndex)
          await ExcelUtils.objectToExcel(fillChildren(list), columns, {
            fileName
          })
        }
      } catch (e) {
        ;(exportOptions?.onExportRequestFailed || onRequestFailed)?.(e)
      }
    }
  }
  if (action) {
    if (typeof action === 'function') {
      tableAction = { ...tableAction, ...action(tableAction) }
    } else {
      tableAction = { ...tableAction, ...action }
    }
  }

  if (actionRef) {
    ;(actionRef as any).current = tableAction
  }

  const editAction: EditAction<T> = {
    create(defaultValue) {
      const row = { ...defaultValue } as T
      form.resetFields()
      form.setFieldsValue(row)
      setCurrentEditRow({ row, isCreate: true })
      return row
    },
    getCurrentEditRow() {
      return currentEditRow?.row
    },
    edit(row, defaultValue = row) {
      if (currentEditRow?.row === row) {
        return
      }
      form.setFieldsValue(defaultValue)
      setCurrentEditRow({ row })
    },
    confirm(row, formValue) {
      if (formValue) {
        if (currentEditRow?.isCreate) {
          setTableData([formValue, ...tableData])
        } else {
          const rowIndex = tableData.indexOf(row)
          Object.assign(tableData[rowIndex], formValue)
          setTableData([...tableData])
        }
      }
      editAction.cancel()
    },
    cancel() {
      setCurrentEditRow(undefined)
    },
    validateFields() {
      return form.validateFields() as Promise<T>
    }
  }

  if (editRef) {
    ;(editRef as any).current = editAction
  }

  const tableDataWithCreate = useMemo(() => {
    if (currentEditRow?.isCreate && currentEditRow.row) {
      return [currentEditRow.row, ...tableData]
    }
    return tableData
  }, [tableData, currentEditRow])

  const showInTableColumns = useMemo(() => {
    return columns?.filter(c => !c.hiddenInTable)
  }, [columns])
  const columnsUseSetting = useMemo(() => {
    if (columnSettings?.length) {
      const sortColumns =
        showInTableColumns
          .map((column, index) => ({ column, setting: columnSettings[index] }))
          .filter(columnAndSetting => !columnAndSetting.setting?.hidden)
          .sort((a, b) => a.setting?.sort - b.setting?.sort) || []

      const fixedOnLeftColumns = sortColumns.filter(({ setting }) => setting?.fixed === 'left')
      const notFixedColumns = sortColumns.filter(({ setting }) => !setting?.fixed)
      const fixedOnRightColumns = sortColumns.filter(({ setting }) => setting?.fixed === 'right')
      return [...fixedOnLeftColumns, ...notFixedColumns, ...fixedOnRightColumns].map(columnAndSetting => {
        const { column } = columnAndSetting
        const ellipsis = column.showTooltip && !column.ellipsis ? { showTitle: false } : column.ellipsis
        return {
          ...column,
          ellipsis,
          fixed: columnAndSetting.setting?.fixed ?? column.fixed
        } as FastColumnProps<T>
      })
    }
    return showInTableColumns
  }, [showInTableColumns, columnSettings])

  const searchFormColumns: FastColumnProps<T>[] = useMemo(
    () =>
      columns.filter(
        c =>
          (c.dataIndex || c.formItemName) &&
          (c.showInSearch ?? (search === false ? false : search?.defaultShowInSearch))
      ),
    [columns, search]
  )

  const defaultPaginationProps = useMemo(() => {
    return pagination === false ? {} : pagination || (formCache && pick<any>(formCacheData, ['limit', 'page'])) || {}
  }, [])
  const [pageParam, setPageParam] = useState<PageParam>({
    limit: defaultPaginationProps.pageSize || 10,
    page: defaultPaginationProps.current || 1
  })

  const [pageResult, setPageResult] = useState<PageResult<T>>({ list: dataSource, total: dataSource?.length })

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
    props.onSearch?.(formParams)
    if (request) {
      setLoading(true)
      try {
        const pageResult = await fetchData(formParams, page)
        setPageResult(pageResult || {})
        setTableData(pageResult?.list || [])
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

  function sizeOrPageChanged(current: number, limit = pageParam.limit) {
    const newPageParam = { page: current, limit }
    searchData(undefined, newPageParam).then(() => setPageParam(newPageParam))
  }

  const extendPagination = useMemo(() => {
    if (pagination === false) {
      return false
    }

    return {
      limit: pageParam.limit,
      current: pageParam.page,
      total: pageResult.total,
      showSizeChanger: true,
      showTotal: total => `共${total}条`,
      style: {
        marginBottom: 0
      },
      onChange(current, limit) {
        sizeOrPageChanged(current, limit)
        if (divRef.current) {
          getScroller(divRef.current)?.scrollTo({ top: 0 })
        }
      },
      ...pagination
    } as TablePaginationConfig
  }, [pagination, pageParam, pageResult.total])

  const onRow: TableProps<T>['onRow'] | undefined = isEnableRowDrag
    ? (r, index) => {
        const rowProps: DraggableRowProps<T> = {
          async dragEndHandle(dragData) {
            const currentData = tableData
            const dragAfterData = [...currentData]
            const { source, sourceIndex, targetIndex } = dragData
            dragAfterData.splice(sourceIndex, 1)
            dragAfterData.splice(targetIndex, 0, source)
            const result = (await onRowDragEnd?.(dragData, dragAfterData, currentData)) || dragAfterData
            if (result) {
              setTableData([...result])
            }
          },
          dragRef,
          canDrag: canDrag ? canDrag(r) : true,
          record: r,
          rowIndex: index
        }
        return rowProps
      }
    : undefined

  const defaultParams = useMemo(() => {
    const defaultValues = {}
    if (formCache) {
      Object.assign(defaultValues, formCacheData)
    }
    return Object.assign(defaultValues, (typeof initialValues === 'function' ? initialValues() : initialValues) || {})
  }, [])
  useEffect(() => {
    if (requestImmediate) {
      searchData(defaultParams)
    }
  }, [])

  useEffect(() => {
    if (dataSource) {
      setTableData([...dataSource])
    }
  }, [dataSource])

  useEffect(() => {
    tableDataRef.current = tableData
  }, [tableData])
  useEffect(() => {
    setPageResult({ list: dataSource, total: dataSource?.length })
  }, [dataSource])

  let tableColumns = useMemo(
    () => columnsUseSetting.map(col => fastColumnToColumn(col, editAction)),
    [columnsUseSetting, editAction]
  )
  const importProps: ImportProps<T> = useMemo(
    () => ({
      importColumns: columns.filter(c => !c.importIgnore && c.dataIndex),
      ...importOptions
    }),
    [columns, importOptions]
  )

  const tableComponents: TableProps<T>['components'] = {
    body: {
      cell: EditableCell,
      row: isEnableRowDrag ? DraggableRow : undefined
    }
  }

  if (isEnableRowDrag) {
    tableColumns = [
      {
        width: '120px',
        render() {
          return <MenuOutlined className={DraggableDomClass} />
        },
        ...enableRowDrag
      },
      ...tableColumns
    ]
  }

  const TableWrapper = (
    <>
      {useMemo(
        () => (
          <TableToolBar
            title={headerTitle}
            options={options}
            columns={showInTableColumns}
            selectedCount={rowSelection?.selectedRowKeys?.length}
            doAction={(actionType, payload) => tableAction[actionType]?.(payload)}
            defaultColumnSettings={defaultColumnSettings}
            toolBarRender={typeof toolBarRender === 'function' ? toolBarRender(tableAction) : toolBarRender}
          />
        ),
        [options, headerTitle, toolBarRender, showInTableColumns, rowSelection, pageParam]
      )}
      <Form form={form} component={false}>
        <Table<T>
          dataSource={tableDataWithCreate}
          columns={tableColumns}
          loading={loading}
          pagination={extendPagination}
          onRow={onRow}
          rowSelection={rowSelection}
          size={size}
          components={tableComponents}
          bordered={bordered}
          {...rest}
        />
      </Form>
    </>
  )

  const SearchWrapper = useMemo(() => {
    if (search !== false && searchFormColumns.length > 0) {
      const SearchWrapper = (
        <SearchForm
          formRef={formRef}
          formProps={{
            labelCol: { span: 3 },
            ...formProps,
            initialValues: defaultParams || formProps?.initialValues
          }}
          formColumns={searchFormColumns}
          formClearOmitNames={formClearOmitNames}
          defaultCollapsed={search?.defaultCollapsed}
          onSubmit={value => {
            const params = beforeSearchSubmit?.(value) || value
            return searchData(params, { ...pageParam, page: 1 })
          }}
          filterCount={filterCount}
        />
      )
      return isCard ? (
        <Card styles={{ body: { paddingBottom: 0 } }} style={{ marginBottom: '16px' }}>
          {SearchWrapper}
        </Card>
      ) : (
        SearchWrapper
      )
    }
  }, [columns, isCard, formProps, search, filterCount, pageParam])

  const ImportDialogWrapper = useMemo(
    () => (
      <ImportDialog
        getContainer={false}
        importProps={importProps}
        title={headerTitle}
        open={importDialogShow}
        onCancel={() => {
          setImportDialogShow(false)
          tableAction.search()
        }}
        width={'80%'}
      />
    ),
    [importDialogShow, headerTitle, importProps]
  )

  return (
    <div className={ClassPrefix + '-container'} ref={divRef}>
      {enableSearchAffix ? <Affix {...affixProps}>{SearchWrapper}</Affix> : SearchWrapper}
      {isCard ? <Card>{TableWrapper}</Card> : TableWrapper}
      {ImportDialogWrapper}
    </div>
  )
}

export default TableWrapper
