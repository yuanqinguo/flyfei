import { createContext } from 'react'
import { FastTableProps } from '../index'

interface TableContextProps extends Omit<FastTableProps<any>, 'columns' | 'rowKey'> {}

/**
 * NOTE: rowKey	在 antd 的类型只可以是字符串，这里 any 跟 antd 类型有冲突，实际上 rowKey 也可以定义
 */
const TableContext = createContext<TableContextProps>({})

export const TableProvider = TableContext.Provider
export const TableConsumer = TableContext.Consumer
export default TableContext
