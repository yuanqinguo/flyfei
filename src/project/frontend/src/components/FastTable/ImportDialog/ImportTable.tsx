import { Alert, Button, Flex, Modal, Progress, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react'
import throttle from 'lodash/throttle'
import { ColumnProps } from 'antd/es/table'
import { validateRules } from 'rc-field-form/es/utils/validateUtil'
import { ValidateOptions } from 'rc-field-form/es/interface'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  PauseCircleOutlined,
  RightCircleOutlined,
  UploadOutlined
} from '@ant-design/icons'
import PromisePool from './PromisePool'
import ExcelUtils from '../excel/ExcelUtils'
import { ImportColumnProps } from '../TableWrapper'
import {LoadingButton} from '@/components/LoadingButton'
import SelectFileButton from '../SelectFileButton'
import FileDrop from './FileDrop'

const { Text } = Typography

const statusEnum = {
  default: '就绪',
  processing: '处理中',
  success: '成功',
  error: '失败'
}

type RequestResult = { code: number; msg?: string } | boolean | void
enum RequestResultCode {
  SUCCESS = 200
}

interface ImportResult<T> {
  data: T
  sourceRow: any
  status: ImportStatus
  message?: string
}

export interface ImportAction<T> {
  cancel(): Promise<void>

  resetTable(): void

  beginImport(): Promise<void>

  getResolveData(): T[]
}

export interface ImportProps<T = any> {
  importColumns: ImportColumnProps<T>[]
  /**
   * 是否选择文件后自动开始导入
   */
  autoImport?: boolean
  /**
   * 导入请求
   * @param form
   */
  importRequest?: (form: T) => any
  batchImportRequest?: (form: T[]) => any
  /**
   * 请求的并发数量， 默认 1
   */
  requestConcurrency?: number
  actionRef?: RefObject<ImportAction<T> | null | undefined>
  /** 模板名称 */
  templateName?: string
  /** 自定义下载模板事件 */
  downloadTemplate?(): void
  /**
   * 导入完成后回调
   * @param verifiedValues 校验通过的数据
   * @param results 包含导入状态的结果
   * @param importFile 导入的文件对象
   */
  completed?: (verifiedValues: T[], results: ImportResult<T>[], importFile: File) => void

  /**
   * 导入前的执行，如果返回false，不执行导入
   */
  beforeImport?(): Promise<boolean>

  /**
   * 选择文件后面的区域自定义
   * @param importState 当前状态和暂停方法
   */
  toolRender?(importState: { begin: boolean; doPause(): void; clearCurrentData(): void }): ReactNode
  /**
   * 导入时处理值
   * @param value 当前值
   * @param row 当前行
   * @param index 当前索引
   */
  importValue?: (value: any, row: any[], index: number) => any
  /**
   * 导入时数据校验规则，仅对单个校验有效
   * @param row 当前行
   * @param index 当前索引
   * @param importData 导入的数据列表
   * @returns 如果返回 true，则导入失败
   */
  validateRowError?: (
    row: any,
    index: number,
    importData: any[]
  ) => Promise<string | boolean | void> | string | boolean | void

  /** 下载按钮 ref */
  downloadTemplateBtnRef?: React.RefObject<any>
  /** 上传按钮 ref */
  uploadBtnRef?: React.RefObject<any>
}

type ImportStatus = 'default' | 'processing' | 'success' | 'error'

/**
 * 将导入的数据解析为json
 * @param dataArray 导入的数据行
 * @param importColumns 导入数据定义
 */
type ResolveResult<T> = { data: T; error?: string[] }

async function importDataResolve<T = any>(
  dataArray: any[],
  importColumns: ImportColumnProps<T>[],
  index: number,
  options?: {
    validateOptions?: ValidateOptions
    importValue?: (value: any, row: any[], index: number) => any
  }
) {
  const { validateOptions, importValue: globalImportValue } = options || {}
  const resolveData: any = {}
  const validateResults: Promise<string[]>[] = []
  importColumns.forEach(({ title, dataIndex, valueEnum, importValue, rules }, currentIndex) => {
    const resolveValue = dataArray[currentIndex]
    let realData = resolveValue
    if (typeof rules === 'function') {
      rules = rules(resolveData, index)
    }

    if (globalImportValue) {
      realData = globalImportValue(realData, resolveData, index)
    }

    if (importValue && (typeof importValue === 'function' || typeof importValue.value === 'function')) {
      const importValueFn = typeof importValue === 'function' ? importValue : importValue.value
      realData = importValueFn?.(realData, resolveData, index)
    } else if (valueEnum) {
      const enumsData = Object.values(valueEnum)
      rules = [...(rules || []), { enum: enumsData, type: 'enum', message: `${title}内容需要为${enumsData}` }]
      Object.keys(valueEnum).some(v => {
        if (valueEnum[v] === resolveValue) {
          realData = v
          return true
        }
        return false
      })
    }

    if (Array.isArray(dataIndex)) {
      if (dataIndex.length === 1) {
        resolveData[dataIndex[0]] = realData
      } else if (dataIndex.length > 1) {
        let tempData: any = {}
        dataIndex.forEach((key, valueIndex) => {
          if (valueIndex === 0) {
            tempData = resolveData[key] ?? {}
            resolveData[key] = tempData
          } else if (valueIndex === dataIndex.length - 1) {
            tempData[key] = realData
          } else {
            tempData[key] = tempData[key] ?? {}
          }
        })
      }
    } else if (dataIndex !== undefined) {
      resolveData[dataIndex as string] = realData
    }

    if (rules?.length && dataIndex) {
      const nameIndex = Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex.toString()
      validateResults.push(
        validateRules([nameIndex], resolveValue, rules, validateOptions || {}, false, {
          label: typeof title === 'string' ? title : nameIndex
        })
          .then(res => {
            return res.map(item => (item?.errors ? item?.errors.join(',') : item))
          })
          .catch(e => e.map((item: any) => item.errors).flat())
      )
    }
  })

  const result: ResolveResult<T> = {
    data: resolveData
  }

  if (validateResults.length) {
    const valueReturn = await Promise.all(validateResults)
    result.error = valueReturn.filter(a => a.length).map(a => a.join('; '))
  }

  return result
}

export function getImportData(arrayData: string[][]) {
  const [firstRow = [], secondRow = []] = arrayData
  const [firstRowCol] = firstRow
  let header = firstRow
  let body = arrayData.slice(1)

  if (firstRow.length && secondRow.length && firstRow.every(col => col === firstRowCol)) {
    header = secondRow
    body = arrayData.slice(2)
  }

  return {
    header,
    body
  }
}

const ResultTag = ({ result }: { result?: ImportResult<any> }) => {
  const { status, message } = result || { status: 'default' }
  return (
    <span>
      <Tag color={status}>{statusEnum[status]}</Tag>
      {typeof message === 'string' ? message : JSON.stringify(message)}
    </span>
  )
}

export function useImportTable<T>() {
  return useRef<ImportAction<T>>(null)
}

function ImportTable<T extends object = any>({
  importColumns,
  beforeImport,
  toolRender,
  importRequest,
  batchImportRequest,
  requestConcurrency,
  actionRef,
  templateName,
  downloadTemplate,
  completed,
  autoImport,
  importValue,
  validateRowError,
  downloadTemplateBtnRef,
  uploadBtnRef
}: ImportProps) {
  const [currentData, setCurrentData] = useState<{
    file?: File
    header?: any[]
    dataSource: any[][]
  }>({ dataSource: [] })
  const [importResults, setImportResults] = useState<ImportResult<T>[]>([])
  const [errorMessage, setErrorMessage] = useState<string>()
  const [openFileLoading, setOpenFileLoading] = useState(false)
  const [isBeginImport, setIsBeginImport] = useState(false)

  const promisePool: PromisePool = useMemo(() => {
    return new PromisePool(requestConcurrency || 1)
  }, [])

  useEffect(() => {
    const concurrentCore = requestConcurrency || 1
    if (promisePool) {
      promisePool.setCore(concurrentCore)
    }
  }, [requestConcurrency])

  const progressData = useMemo(() => {
    let successNumber = 0
    let failedNumber = 0
    let processLength = 0
    importResults.forEach(r => {
      if (r) {
        if (r.status === 'success') {
          successNumber++
        } else if (r.status === 'error') {
          failedNumber++
        } else if (r.status) {
          processLength++
        }
      }
    })
    const total = currentData.dataSource.length
    return {
      total,
      successNumber,
      failedNumber,
      successPercent: parseInt((successNumber / total) * 100 + ''),
      percent: parseInt(((successNumber + failedNumber) / total) * 100 + ''),
      isFinish: total - successNumber - failedNumber - processLength === 0 && total > 0,
      allDone: total - successNumber - failedNumber === 0 && total > 0,
      progressTitle: `成功: ${successNumber} / 失败: ${failedNumber}`
    }
  }, [importResults, currentData.dataSource])

  useEffect(() => {
    if (progressData.allDone && completed) {
      const verifyData = importResults.filter(a => a.status === 'success').map(a => a.data)
      completed(verifyData, importResults, currentData.file!)
    }
  }, [progressData.allDone])

  const flushResult = throttle(() => {
    setImportResults([...importResults])
  }, 200)

  const dataResultChange = (index: number, result: ImportResult<T>) => {
    importResults[index] = result
    flushResult()
  }

  const importFinish = () => {
    setIsBeginImport(false)
  }

  const doPause = () => {
    return promisePool.pause().finally(() => importFinish())
  }

  const processResultToImportResult = (result: RequestResult): Pick<ImportResult<T>, 'message' | 'status'> => {
    let message
    if (result && typeof result === 'object') {
      message = result.msg
      result = result.code === RequestResultCode.SUCCESS
    }
    const resultStatus = result === false ? 'error' : 'success'

    return { message, status: resultStatus }
  }

  const beginImport = async () => {
    if (beforeImport) {
      if (!(await beforeImport())) {
        return
      }
    }
    setIsBeginImport(true)
    if (importResults.length > 0) {
      promisePool.resume()?.finally(() => importFinish())
      return
    }
    if (batchImportRequest) {
      const importData = await Promise.all(
        currentData.dataSource.map(async (row, index) => {
          const { data } = await importDataResolve(row, importColumns, index, {
            importValue
          })
          return data
        })
      )

      try {
        const results = await batchImportRequest(importData)
        if (Array.isArray(results)) {
          setImportResults(
            results.map((a, index) => ({
              ...processResultToImportResult(a),
              data: importData[index],
              sourceRow: currentData.dataSource[index]
            }))
          )
        } else {
          setImportResults(
            importData.map((item, index) => ({
              ...processResultToImportResult(results),
              data: item,
              sourceRow: currentData.dataSource[index]
            }))
          )
        }
      } catch (e) {
        importFinish()
      }
    } else {
      const importData = await Promise.all(
        currentData.dataSource.map(async (row, index) => {
          const { data, error } = await importDataResolve(row, importColumns, index, {
            importValue
          })
          return {
            row,
            data,
            error
          }
        })
      )
      importData.forEach((item, index) => {
        promisePool.execute(async () => {
          const { data, error, row } = item
          const validateError = validateRowError?.(data, index, importData)
          const validateMessage = typeof validateError === 'string' ? validateError : validateError ? '重复导入' : ''
          const errorMessage = validateMessage + (error?.join('; ') || '')
          const status = errorMessage ? 'error' : 'processing'
          dataResultChange(index, { status, message: errorMessage, data, sourceRow: row })
          if (status === 'processing') {
            let result: RequestResult
            if (importRequest) {
              try {
                await importRequest(data)
                result = { code: 200 }
              } catch (e) {
                result = { code: -1, msg: (e as any)?.msg || (e as any)?.message || '导入失败' }
              }
            } else {
              result = true
            }
            dataResultChange(index, { ...processResultToImportResult(result), data, sourceRow: row })
          }
        })
      })
    }
    promisePool.getStatusPromise().finally(() => importFinish())
  }

  const downloadTemplateHandle = async () => {
    if (downloadTemplate) {
      downloadTemplate()
    } else {
      await ExcelUtils.objectToExcel([], importColumns, { enableValueEnum: true, fileName: templateName })
    }
  }

  const clearErrorMessage = () => {
    setErrorMessage(undefined)
  }

  useEffect(() => {
    if (autoImport && currentData?.dataSource?.length > 0) {
      beginImport()
    }
  }, [autoImport, currentData])

  const resetImportTable = async () => {
    await promisePool.clear()
    clearErrorMessage()
    setCurrentData({ dataSource: [] })
    importResults.splice(0, importResults.length)
    setImportResults(importResults)
  }

  const fileChangeHandle = async (file: File) => {
    importResults.splice(0, importResults.length)
    setOpenFileLoading(true)
    resetImportTable()
    try {
      const arrayData = await ExcelUtils.excelToArray(await ExcelUtils.copyFileToArrayBuffer(file))
      const { header, body } = getImportData(arrayData)
      const headerMatch =
        importColumns.length === header.length && importColumns.every((c, index) => c.title === header?.[index])
      if (!headerMatch) {
        setErrorMessage(`${file.name} - 表头和模板不匹配`)
      } else if (!arrayData.length) {
        setErrorMessage(`${file.name} - Excel 没有数据`)
      } else {
        const dataSource = body.map((row, index) => {
          return row.map((col, colIndex) => {
            const importColumn = importColumns[colIndex]
            const importValue = importColumn?.importValue
            const importValueFn = typeof importValue === 'function' ? importValue : importValue?.value
            return importValueFn ? importValueFn(col, row, index) : col
          })
        })
        setCurrentData({ file, dataSource, header: header!.slice(0, importColumns.length) })
      }
    } catch (e) {
      setErrorMessage(typeof e === 'string' ? e : '导入失败，请重试')
    } finally {
      setOpenFileLoading(false)
    }
  }

  const downloadFailedOrNotBeginData = async () => {
    const failedData = currentData.dataSource
      .map((data, index) => {
        const importResult = importResults[index]
        if (!importResult || importResult.status === 'error') {
          return [...data, `${statusEnum[importResult?.status || 'default']}`, `${importResult?.message || ''}`]
        }
        return null
      })
      .filter(a => a)
      .map(a => a!)
    const header = [...currentData.header!, '导入状态', '失败原因']
    const fileName = `下载失败数据 - ${currentData.file?.name}`
    await ExcelUtils.arrayToExcel([header, ...failedData], fileName)
  }

  const dataSourceMap = useMemo(() => {
    const map = new Map<any, number>()
    currentData.dataSource.forEach((item, index) => {
      map.set(item, index)
    })
    return map
  }, [currentData.dataSource])
  const columns: ColumnProps<any>[] = useMemo(() => {
    const { header } = currentData
    if (header) {
      return [
        ...header.map((h, index) => {
          return {
            title: h,
            width: importColumns[index]?.width,
            dataIndex: index,
            ellipsis: true
          }
        }),
        {
          title: '导入状态',
          fixed: 'right',
          width: 160,
          render: (v, row) => {
            const result = importResults.filter(a => a?.sourceRow === row)[0]
            return <ResultTag result={result} />
          }
        }
      ]
    } else {
      return []
    }
  }, [dataSourceMap, importResults])

  if (actionRef) {
    ;(actionRef as any).current = {
      getResolveData() {
        return importResults.filter(a => a.status === 'success').map(a => a.data)
      },
      beginImport,
      resetTable: resetImportTable,
      cancel: async () => {
        if (!progressData.isFinish && progressData.total > 0) {
          return new Promise((resolve, reject) => {
            const promise = promisePool.pause()
            Modal.confirm({
              content: '数据还没有导入完成，你确定要关闭吗?',
              onOk() {
                promise.then(resolve)
              },
              onCancel() {
                promisePool.resume()
                reject()
              }
            })
          })
        }
      }
    }
  }

  const { showBeginButton, showPauseButton, isPaused, showDownloadErrorData } = useMemo(() => {
    const showBeginButton = !progressData.isFinish && progressData.total > 0
    const showPauseButton = !progressData.isFinish && progressData.total > 0 && isBeginImport
    const isPaused = !showPauseButton && currentData.dataSource.length > 0 && importResults.length > 0
    const showDownloadErrorData = progressData.isFinish ? progressData.failedNumber > 0 : isPaused
    return {
      showBeginButton,
      showPauseButton,
      isPaused,
      showDownloadErrorData
    }
  }, [progressData, isBeginImport])

  const importDataTable = useMemo(
    () => (
      <Table
        scroll={{ x: '100%' }}
        bordered
        loading={openFileLoading}
        showHeader={currentData.dataSource.length > 0}
        rowKey={(r, i) => i + '-'}
        size={'small'}
        columns={columns}
        dataSource={currentData.dataSource}
      />
    ),
    [columns, currentData, openFileLoading]
  )

  return (
    <div>
      <Space direction={'vertical'} style={{ width: '100%' }}>
        {errorMessage && (
          <Alert showIcon type={'error'} closable={true} message={errorMessage} onClose={clearErrorMessage} />
        )}
        <Flex justify={'end'} gap={8}>
          <Button ref={downloadTemplateBtnRef} onClick={downloadTemplateHandle} icon={<DownloadOutlined />}>
            下载模板
          </Button>
          <Space>
            <SelectFileButton
              ref={uploadBtnRef}
              disabled={isBeginImport}
              loading={openFileLoading}
              icon={<UploadOutlined />}
              type="primary"
              ghost
              onFileSelect={fileChangeHandle}
            >
              {currentData.file?.name || '导入文件'}
            </SelectFileButton>
            {toolRender?.({ begin: isBeginImport, doPause, clearCurrentData: resetImportTable })}
            {showBeginButton && (
              <Button type={'primary'} loading={isBeginImport} onClick={beginImport} icon={<RightCircleOutlined />}>
                {isBeginImport ? '正在导入' : isPaused ? '继续导入' : '开始导入'}
              </Button>
            )}
            {showPauseButton && (
              <LoadingButton danger ghost icon={<PauseCircleOutlined />} onClick={() => doPause()}>
                暂停
              </LoadingButton>
            )}
            {showDownloadErrorData && (
              <Tooltip title={'包括规则校验失败和未处理的数据'}>
                <LoadingButton icon={<DownloadOutlined />} onClick={downloadFailedOrNotBeginData}>
                  下载失败数据
                </LoadingButton>
              </Tooltip>
            )}
          </Space>
        </Flex>
        {currentData.dataSource.length > 0 && (
          <Tooltip title={progressData.progressTitle}>
            <Progress
              strokeColor={'#FF4D4F'}
              percent={progressData.percent}
              success={{
                percent: progressData.successPercent
              }}
              status={isBeginImport ? 'active' : 'normal'}
            />
          </Tooltip>
        )}
        {currentData.file || openFileLoading ? importDataTable : <FileDrop onFileSelect={fileChangeHandle} />}
        {currentData.dataSource.length > 0 && (
          <Text>
            共导入 <Text type="warning">{currentData.dataSource.length}</Text> 条
            {progressData.percent ? (
              <>
                {' '}
                <div>
                  <Text type="success">
                    <CheckCircleOutlined /> {progressData.successNumber}条成功
                  </Text>
                </div>
                <div>
                  <Text type="danger">
                    <CloseCircleOutlined /> {progressData.failedNumber}条失败
                  </Text>
                </div>
              </>
            ) : (
              <Text>准备就绪，请检查后点击开始导入</Text>
            )}
          </Text>
        )}
      </Space>
    </div>
  )
}

export default ImportTable
