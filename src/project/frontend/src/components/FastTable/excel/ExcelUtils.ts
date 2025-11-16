import { ColumnProps } from 'antd/es/table'
import fileSaver from 'file-saver'
import ExcelJS, { CellHyperlinkValue, CellValue } from 'exceljs'
import { dateFormat, isFastColumnProps, resolveColumnData } from '../utils'
import ExcelOperator, { ExportOption } from './ExcelOperator'
import { FastColumnProps } from '../index'
import { Store } from '../TableWrapper'

function getToday() {
  const now = new Date()
  return dateFormat(now, 'YYYYMMDDHHmmss')
}

function getDefaultSheetName() {
  return 'sheet1'
}

function buildOrDefaultFileName(fileName?: string) {
  const suffix = '.xlsx'
  if (fileName && !fileName.endsWith(suffix)) {
    fileName = fileName + suffix
  } else if (!fileName) {
    fileName = `export-${getToday()}${suffix}`
  }
  return fileName
}

function getExcel() {
  return ExcelJS
}

function isCellHyperlinkValue(value: CellValue): value is CellHyperlinkValue {
  return (value as CellHyperlinkValue)?.text !== undefined
}

export type ColumnType<T> = FastColumnProps<T> | ColumnProps<T>

class ExcelOperatorImpl implements ExcelOperator {
  arrayToObject<T>(data: any[][], supportColumnMappingTypes: ColumnType<T>[]): Promise<T[]> {
    if (data.length > 1) {
      data = [...data]
      const header = data.shift() || []
      const indexPropMap: Record<string, any> = {}
      supportColumnMappingTypes.forEach(columnMapping => {
        const labelIndex = header.indexOf(columnMapping.title) as any
        indexPropMap[labelIndex?.toString()] = columnMapping.dataIndex
      })

      return Promise.resolve(
        data.map(row => {
          const obj: Store = {}
          row.forEach((propValue, index) => {
            const propName = indexPropMap[index]
            const propsIndex = Array.isArray(propName) ? propName.join('.') : (propName as string)
            obj[propsIndex] = propValue
          })
          return obj
        }) as T[]
      )
    }
    return Promise.resolve([])
  }

  copyFileToArrayBuffer(file: File) {
    return new Promise<Buffer>(resolve => {
      const reader = new FileReader()
      reader.onload = e => {
        const fileTarget = e.target as FileReader
        resolve(fileTarget.result as unknown as Buffer)
      }
      reader.readAsArrayBuffer(file)
    })
  }

  async arrayToExcel(data: any[][], fileName: string = buildOrDefaultFileName()) {
    const workbook = new (await getExcel()).Workbook()
    const sheet = workbook.addWorksheet(getDefaultSheetName())
    if (data && data.length > 0) {
      sheet.addRows(data)
    }
    const buffer = await workbook.xlsx.writeBuffer()
    fileSaver.saveAs(new Blob([buffer]), fileName)
    return fileName
  }

  async objectToExcel<T>(data: any[], columns: ColumnType<T>[], exportOptions?: ExportOption) {
    const workbook = new (await getExcel()).Workbook()
    const sheet = workbook.addWorksheet(getDefaultSheetName())
    const indexMaxLength: number[] = []
    // 添加一个空行占位，否则数据会在第一行
    sheet.addRow([])
    data.forEach((row, rowIndex) => {
      const rowData = columns.map((c, index) => {
        const data = resolveColumnData(
          {
            row,
            index: rowIndex
          },
          c
        )
        indexMaxLength[index] = Math.max(indexMaxLength[index] || 0, data?.toString().length || 0)
        return data
      })
      sheet.addRow(rowData)
    })

    sheet.columns = columns.map((c, index) => {
      const colWidth = Math.max(4, Math.max(indexMaxLength[index] || 0, (c.title as string).length * 2))
      return {
        header: c.title as string,
        width: Math.min(colWidth + 1.5, 50)
      }
    })

    function getCellName(index: number) {
      const firstCode = (index - (index % 26)) / 26
      const secondCode = index % 26
      const code =
        (firstCode ? String.fromCharCode('A'.charCodeAt(0) + firstCode) : '') +
        String.fromCharCode('A'.charCodeAt(0) + secondCode)
      return code
    }
    function addRowStyle(length: number, row: number) {
      for (let i = 0; i < length; i++) {
        const cell = sheet.getCell(getCellName(i) + row)
        cell.font = { bold: true }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      }
      sheet.getRow(row).height = 20
    }

    addRowStyle(columns.length, 1)

    if (exportOptions?.enableValueEnum) {
      columns.forEach((item, index) => {
        if (isFastColumnProps(item) && item.valueEnum) {
          const cellName = getCellName(index)
          for (let i = 2; i < 100; i++) {
            sheet.getCell(cellName + i).dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [`"${Object.values(item.valueEnum).join(',')}"`]
            }
          }
        }
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const fileName = buildOrDefaultFileName(exportOptions?.fileName)
    fileSaver.saveAs(new Blob([buffer]), fileName)
    return fileName
  }

  objectToArray<T>(data: any[], columns: ColumnType<T>[], exportOptions?: ExportOption): Promise<any[][]> {
    const columnNames = columns.map(item => {
      return item.title
    })
    const excelData: any[] = [columnNames]

    data.forEach((row, rowIndex) => {
      const rowDataArray = columns.map(columnMapping => {
        return resolveColumnData(
          {
            row,
            index: rowIndex
          },
          columnMapping
        )
      })
      excelData.push(rowDataArray)
    })
    return Promise.resolve(excelData)
  }

  async excelToArray(importData: ArrayBuffer | Buffer | null) {
    const data: any[][] = []
    if (importData) {
      const workbook = new (await getExcel()).Workbook()
      await workbook.xlsx.load(importData as any)
      workbook.eachSheet(s => {
        s.eachRow(row => {
          const rowArray: any[] = []
          row.eachCell({ includeEmpty: true }, c => {
            let cellValue = c.value
            if (isCellHyperlinkValue(cellValue)) {
              cellValue = cellValue.text
            }
            rowArray.push(cellValue)
          })
          data.push(rowArray)
        })
      })
    }
    return data
  }

  async excelToObject<T>(importData: Buffer | any[][] | null, columnMapping: ColumnType<T>[]) {
    let excelArrayData: any[][] = []
    if (importData instanceof Buffer || importData instanceof ArrayBuffer) {
      excelArrayData = await this.excelToArray(importData)
    } else if (Array.isArray(importData)) {
      excelArrayData = importData
    }

    return this.arrayToObject<T>(excelArrayData, columnMapping)
  }
}

const ExcelUtils = new ExcelOperatorImpl()
export default ExcelUtils
