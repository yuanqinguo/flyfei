import React, { useEffect, useRef, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Flex, Input, Tag, theme } from 'antd'

interface TagItem {
  [key: string]: any
}

interface TagsInputProps {
  maxTagCount?: number
  maxLength?: number
  newTagText?: string
  value?: (string | TagItem)[]
  onChange?: (value: (string | TagItem)[]) => void
  fieldNames?: {
    label: string
    value: string
  }
  isObjectTag?: boolean
  disableUpdate?: boolean
}

const tagInputStyle: React.CSSProperties = {
  width: 100,
  height: 32,
  marginInlineEnd: 8,
  verticalAlign: 'top'
}

const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  maxLength = 10,
  maxTagCount = 10,
  newTagText = '添加标签',
  isObjectTag = false,
  disableUpdate = false,
  fieldNames = {
    label: 'label',
    value: 'value'
  }
}) => {
  const { token } = theme.useToken()
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [editInputIndex, setEditInputIndex] = useState(-1)
  const [editInputValue, setEditInputValue] = useState('')
  const inputRef = useRef<InputRef>(null)
  const editInputRef = useRef<InputRef>(null)
  const { label: labelKey, value: valueKey } = fieldNames

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  useEffect(() => {
    editInputRef.current?.focus()
  }, [editInputValue])

  const getTagLabel = (tag: string | TagItem): string => {
    return typeof tag === 'string' ? tag : tag[labelKey]
  }

  const handleClose = (removedTag: string | TagItem) => {
    const newTags = value.filter(tag =>
      typeof tag === 'string' ? tag !== removedTag : tag[labelKey] !== (removedTag as TagItem)[labelKey]
    )
    onChange?.(newTags)
  }

  const showInput = () => {
    setInputVisible(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (inputValue && !value.some(tag => getTagLabel(tag) === inputValue)) {
      const newTag = isObjectTag ? { [labelKey]: inputValue } : inputValue
      onChange?.([...value, newTag])
    }
    setInputVisible(false)
    setInputValue('')
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value)
  }

  const handleEditInputConfirm = () => {
    const newTags = [...value]
    if (typeof value[editInputIndex] === 'string') {
      newTags[editInputIndex] = editInputValue
    } else {
      newTags[editInputIndex] = {
        ...value[editInputIndex],
        [labelKey]: editInputValue
      }
    }
    onChange?.(newTags)
    setEditInputIndex(-1)
    setEditInputValue('')
  }

  const tagPlusStyle: React.CSSProperties = {
    height: 22,
    background: token.colorBgContainer,
    borderStyle: 'dashed'
  }

  return (
    <Flex gap="4px 0" wrap>
      {value.map<React.ReactNode>((tag, index) => {
        const tagLabel = getTagLabel(tag)
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={typeof tag === 'string' ? tag : tag[valueKey]}
              size="small"
              maxLength={maxLength}
              style={tagInputStyle}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          )
        }
        return (
          <Tag
            key={typeof tag === 'string' ? tag : tag[valueKey]}
            closable
            style={{ userSelect: 'none' }}
            onClose={() => handleClose(tag)}
          >
            <span
              onDoubleClick={e => {
                if (disableUpdate) return
                setEditInputIndex(index)
                setEditInputValue(tagLabel)
                e.preventDefault()
              }}
            >
              {tagLabel}
            </span>
          </Tag>
        )
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          maxLength={maxLength}
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <>
          {value.length < maxTagCount && (
            <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
              {newTagText}
            </Tag>
          )}
        </>
      )}
    </Flex>
  )
}

export default TagsInput
