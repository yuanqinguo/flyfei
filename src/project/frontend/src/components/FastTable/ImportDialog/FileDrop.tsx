import { message } from 'antd'
import React, { useState, useRef } from 'react'

const FileDrop: React.FC<{ onFileSelect: (file: File) => void }> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('hover')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('hover')
  }

  const handleFileSelect = (fileList: FileList | null) => {
    if (fileList && fileList?.length > 0) {
      const [selectFile] = fileList

      if (
        selectFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectFile.name.endsWith('.xlsx') ||
        selectFile.name.endsWith('.xls')
      ) {
        onFileSelect(selectFile)
      } else {
        message.error('仅支持 xlsx、xls 后缀格式文件，请选择正确的文件')
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('hover')
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <div>
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: '2px dashed #e1e6eb',
          borderRadius: '10px',
          padding: '80px 30px',
          textAlign: 'center',
          color: '#666',
          cursor: 'pointer'
        }}
      >
        将文件拖到此处上传，或点击选择文件
        <br />
        <input
          type="file"
          ref={fileInputRef}
          accept="xls,xlsx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

export default FileDrop
