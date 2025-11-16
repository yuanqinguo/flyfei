import { Button, ButtonProps } from 'antd'
import { ExcelUtils } from '../index'
import { ColumnType } from '../excel/ExcelUtils'

let tempInputElement: HTMLInputElement | null

function selectFile(onFileChanged: (file: File) => any) {
  if (tempInputElement) {
    tempInputElement.remove()
    tempInputElement = null
  }
  const inputElement: HTMLInputElement = document.createElement('input')
  inputElement.type = 'file'
  inputElement.hidden = true
  inputElement.setAttribute('accept', '.xlsx,.xls')
  inputElement.onchange = () => {
    const selectFile = inputElement.files?.[0]
    selectFile && onFileChanged(selectFile)
    inputElement.remove()
    tempInputElement = null
  }
  document.body.append(inputElement)
  inputElement.click()
  tempInputElement = inputElement
}

export interface SelectFileButtonProps extends ButtonProps {
  onFileSelect(file: File): void
  ref?: React.RefObject<any>
}

const SelectFileButton = ({ onFileSelect, onClick, ref, ...props }: SelectFileButtonProps) => {
  return (
    <Button
      {...props}
      ref={ref}
      onClick={e => {
        onClick?.(e)
        selectFile(onFileSelect)
      }}
    />
  )
}

export interface ExcelImportButtonProps<T> extends ButtonProps {
  onDataResolveFailed?(e: Error): void
  onDataResolve(data: T[]): void | Promise<void>
  columns: ColumnType<T>[]
}

export function ExcelImportButton<T>({
  columns,
  onDataResolve,
  onDataResolveFailed,
  ...props
}: ExcelImportButtonProps<T>) {
  return (
    <SelectFileButton
      {...props}
      onFileSelect={async file => {
        try {
          const bufferData = await ExcelUtils.copyFileToArrayBuffer(file)
          const data = await ExcelUtils.excelToObject(bufferData, columns)
          onDataResolve(data)
        } catch (e) {
          onDataResolveFailed?.(e as Error)
        }
      }}
    />
  )
}

export default SelectFileButton
