import { useEffect, useMemo, useState } from 'react'
import { Checkbox, Popover, Row, Tooltip, Typography } from 'antd'
import { PushpinOutlined, SettingOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons'
import { getParentElement } from './index'
import { ClassPrefix } from '../utils'
import { FastColumnProps } from '../index'

export type ColumnSettingConfig = {
  /** 是否隐藏 */
  hidden?: boolean
  /** 浮动方向, Table.Column的 `fixed` 属性 */
  fixed?: 'left' | 'right'
  /** 列排序 */
  sort: number
}

interface ColumnSettingProps {
  columns?: FastColumnProps[]
  /**
   * 和 columns 一一对应
   */
  defaultColumnSettings?: ColumnSettingConfig[]

  onSettingChange?(columnSettings: ColumnSettingConfig[]): void

  parentElement?: (trigger: HTMLElement) => HTMLElement
}

type ColumnMateData = {
  // 当前索引值
  key: number
  column: FastColumnProps
}
const ColumnSettingClassPrefix = ClassPrefix + '-column-setting'
const ColumnSetting = ({ columns, defaultColumnSettings, onSettingChange, parentElement }: ColumnSettingProps) => {
  const [columnSetting, setColumnSetting] = useState(defaultColumnSettings || [])

  function flushColumnSetting(settings = [...columnSetting]) {
    setColumnSetting(settings)
  }

  const resetSetting = () => {
    if (columns) {
      const settings: ColumnSettingConfig[] = columns.map((item, index) => ({ sort: index }))
      flushColumnSetting(settings)
    }
  }
  const initSetting = () => {
    if (columns) {
      columns.forEach((col, index) => {
        columnSetting[index] = columnSetting[index] || { sort: index }
      })
      setColumnSetting(columnSetting.splice(0, columns.length))
    } else {
      setColumnSetting([])
    }
  }
  useEffect(() => {
    initSetting()
  }, [columns])

  const sortColumns: ColumnMateData[] = useMemo(() => {
    if (columnSetting.length && columns) {
      return columns
        ?.map((column, index) => {
          return { column, key: index }
        })
        .sort((a, b) => columnSetting[a.key]?.sort - columnSetting[b.key]?.sort)
    }
    return []
  }, [columns, columnSetting])

  const totalNumber = useMemo(() => {
    return columns?.length || 0
  }, [columns])

  const checkedNumber = useMemo(() => {
    const hiddenNumber = columnSetting.filter(c => c.hidden).length
    return totalNumber - hiddenNumber
  }, [columnSetting])

  useEffect(() => {
    onSettingChange?.(columnSetting)
  }, [columnSetting])

  function toggleChecked(checked: boolean) {
    columnSetting.forEach(c => (c.hidden = !checked))
    flushColumnSetting()
  }

  const ColumnContent = ({ sortColumns }: { sortColumns: ColumnMateData[] }) => {
    const { Text } = Typography

    const [currentDrag, setCurrentDrag] = useState<ColumnMateData>()
    const [currentOver, setCurrentOver] = useState<ColumnMateData>()

    function dragEnd() {
      if (currentOver && currentDrag && currentDrag !== currentOver) {
        const sourceIndex = sortColumns.indexOf(currentDrag)
        const targetIndex = sortColumns.indexOf(currentOver)
        sortColumns.splice(sourceIndex, 1)
        sortColumns.splice(targetIndex, 0, currentDrag)
        sortColumns.forEach(({ key }, index) => {
          columnSetting[key].sort = index
        })
        flushColumnSetting()
      }
    }

    const renderColumnSettingItem = (columnMate: ColumnMateData) => {
      const { column, key } = columnMate
      const setting = columnSetting[key]

      function setHidden(hidden?: boolean) {
        columnSetting[key] = { ...setting, hidden }
        flushColumnSetting()
      }

      function setFixed(fixed?: ColumnSettingConfig['fixed']) {
        columnSetting[key] = { ...setting, fixed }
        flushColumnSetting()
      }

      const isFixedOnLeft = setting.fixed === 'left'
      const isFixedOnRight = setting.fixed === 'right'
      return (
        <Row
          key={columnMate.key}
          className={ColumnSettingClassPrefix + '-item-row'}
          justify={'space-between'}
          draggable
          onDragStart={() => {
            setCurrentDrag(columnMate)
          }}
          onDragOver={() => {
            setCurrentOver(columnMate)
          }}
          onDragEnd={dragEnd}
        >
          <Checkbox checked={!setting?.hidden} onChange={({ target: { checked } }) => setHidden(!checked)}>
            {column.title}
          </Checkbox>
          <span className={'column-fixed-setting'}>
            <Tooltip title={isFixedOnLeft ? '取消固定' : '固定在左侧'} getPopupContainer={getParentElement}>
              {isFixedOnLeft ? (
                <VerticalAlignMiddleOutlined onClick={() => setFixed()} />
              ) : (
                <PushpinOutlined rotate={-90} onClick={() => setFixed('left')} />
              )}
            </Tooltip>
            <Tooltip
              placement={'topRight'}
              arrow={{ pointAtCenter: true }}
              title={isFixedOnRight ? '取消固定' : '固定在右侧'}
              getPopupContainer={getParentElement}
            >
              {isFixedOnRight ? (
                <VerticalAlignMiddleOutlined onClick={() => setFixed()} />
              ) : (
                <PushpinOutlined onClick={() => setFixed('right')} />
              )}
            </Tooltip>
          </span>
        </Row>
      )
    }

    const {
      fixedOnLeftColumns,
      notFixedColumns,
      fixedOnRightColumns,
      showFixedLeftText,
      showFixedRightText,
      showNotFixedText
    } = useMemo(() => {
      const fixedOnLeftColumns = sortColumns?.filter(({ key }) => columnSetting[key]?.fixed === 'left')
      const notFixedColumns = sortColumns?.filter(({ key }) => !columnSetting[key]?.fixed)
      const fixedOnRightColumns = sortColumns?.filter(({ key }) => columnSetting[key]?.fixed === 'right')
      const showFixedLeftText = fixedOnLeftColumns?.length > 0
      const showFixedRightText = fixedOnRightColumns?.length > 0
      const showNotFixedText = (showFixedLeftText || showFixedRightText) && notFixedColumns.length > 0
      return {
        fixedOnLeftColumns,
        notFixedColumns,
        fixedOnRightColumns,
        showFixedLeftText,
        showFixedRightText,
        showNotFixedText
      }
    }, [sortColumns])

    return (
      <div className={ColumnSettingClassPrefix + '-content'}>
        {showFixedLeftText && <Text type={'secondary'}>固定在左侧</Text>}
        {fixedOnLeftColumns?.map(renderColumnSettingItem)}
        {showNotFixedText && <Text type={'secondary'}>不在左侧</Text>}
        {notFixedColumns?.map(renderColumnSettingItem)}
        {showFixedRightText && <Text type={'secondary'}>固定在右侧</Text>}
        {fixedOnRightColumns?.map(renderColumnSettingItem)}
      </div>
    )
  }

  const checkAll = totalNumber === checkedNumber
  const indeterminate = !checkAll && checkedNumber > 0
  return (
    <Popover
      arrow={{ pointAtCenter: true }}
      getPopupContainer={parentElement}
      trigger="click"
      placement="bottomRight"
      content={() => <ColumnContent sortColumns={sortColumns} />}
      title={() => {
        return (
          <Row justify={'space-between'} align={'middle'}>
            <Checkbox checked={checkAll} indeterminate={indeterminate} onChange={e => toggleChecked(e.target.checked)}>
              列设置{' '}
            </Checkbox>
            <a onClick={resetSetting}>重置</a>
          </Row>
        )
      }}
    >
      <Tooltip title="列设置" getPopupContainer={getParentElement}>
        <SettingOutlined />
      </Tooltip>
    </Popover>
  )
}

export default ColumnSetting
