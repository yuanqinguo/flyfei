import { Space, Button } from 'antd'
import React from 'react'

export interface TableActionProps {
  children?: React.ReactNode
}

export const TableAction: React.FC<TableActionProps> = ({ children }) => {
  return <Space>{children}</Space>
}