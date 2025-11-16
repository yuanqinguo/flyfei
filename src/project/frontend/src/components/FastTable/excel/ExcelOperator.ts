import { ColumnProps } from 'antd/es/table'

export interface ExportOption {
  /**
   * 导出文件名称
   */
  fileName?: string

  /**
   * 启用该配置后，会使导出文件有枚举类的内容可以下拉
   */
  enableValueEnum?: boolean
}

export default interface ExcelOperator {
  /**
   * 将数组转换为excel
   * @param data 数组数据
   * @param fileName 文件名
   * @return 文件地址
   */
  arrayToExcel(data: any[][], fileName?: string): Promise<string>

  /**
   * 将对象转换为excel
   * @param data 源数据集合
   * @param columnMapping 对象映射转换
   * @param exportOptions? 导出选项
   * @return 文件地址
   */
  objectToExcel<T>(data: any[], columnMapping: ColumnProps<T>[], exportOptions?: ExportOption): Promise<string>

  /**
   * 将对象转换为数组
   * @param data 源数据集合
   * @param columnMapping 对象映射转换
   * @param exportOptions? 导出选项
   */
  objectToArray<T>(data: any[], columnMapping: ColumnProps<T>[], exportOptions?: ExportOption): Promise<any[][]>

  /**
   * 将数组转换为对象数组
   * @param data 数组源
   * @param columnMapping 对象映射
   */
  arrayToObject<T>(data: any[][], columnMapping: ColumnProps<T>[]): Promise<T[]>

  /**
   * 将 excel导出为Array
   * @param importData Excel的Buffer数据
   */
  excelToArray(importData: Buffer | null): Promise<any[][]>

  /**
   * 将 excel 导出为对象
   * @param importData   Excel的Buffer数据
   * @param columnMapping 对象映射转换
   */
  excelToObject<T>(importData: Buffer | any[][] | null, columnMapping: ColumnProps<T>[]): Promise<T[]>

  /**
   * 将文件复制到一个 ArrayBuffer 中
   * @param file 文件对象
   */
  copyFileToArrayBuffer(file: File): Promise<Buffer>
}
