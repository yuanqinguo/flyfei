import React, { useEffect, useState } from 'react'
import './index.scss'
import Icon, {
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LoadingOutlined,
  SyncOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { Button, Divider, Space, Tooltip } from 'antd'
import ColumnSetting, { ColumnSettingConfig } from './ColumnSetting'
import { ClassPrefix } from '../utils'
import { TableAction, FastColumnProps } from '../TableWrapper'

const ToolBarClassName = `${ClassPrefix}-toolbar`
export type ActionType = keyof Omit<TableAction, 'getFormData'>
type OptionType = keyof Omit<TableAction, 'exitFullscreen' | 'reloadWithDefaultParams' | 'search' | 'getFormData'>

interface OptionActionProps {
  doAction?(actionName: ActionType, payload?: any): void | Promise<void>
  columns?: FastColumnProps[]
  defaultColumnSettings?: ColumnSettingConfig[]
}

export function getParentElement(trigger: HTMLElement) {
  return trigger.parentElement || document.body
}

export const defaultOptions = {
  reload: true,
  fullscreen: true,
  import: false,
  export: false,
  columnSetting: true
} as const

interface ActionIconProps {
  IconElement: typeof Icon
  title: string
  actionName: ActionType
  doAction: OptionActionProps['doAction']
}

const ActionIcon = (props: ActionIconProps) => {
  const { title, actionName, doAction, IconElement } = props

  const [loading, setLoading] = useState(false)

  return (
    <Tooltip title={title}>
      {loading ? (
        <LoadingOutlined spin />
      ) : (
        <IconElement
          onClick={() => {
            if (!loading) {
              setLoading(true)
              const res = doAction?.(actionName)
              if (res?.finally) {
                res.finally(() => {
                  setLoading(false)
                })
              } else {
                setLoading(false)
              }
            }
          }}
        />
      )}
    </Tooltip>
  )
}

const OptionsDefine: { [key in OptionType]: React.FC<OptionActionProps> } = {
  fullscreen: ({ doAction }) => {
    // eslint-disable-next-line
    const [isFullScreen, setFullScreen] = useState(false)
    // eslint-disable-next-line
    useEffect(() => {
      const onFullScreenChanged = () => {
        setFullScreen(!!document.fullscreenElement)
      }
      document.addEventListener('fullscreenchange', onFullScreenChanged)
      return () => {
        document.removeEventListener('fullscreenchange', onFullScreenChanged)
      }
    }, [])
    return (
      <Tooltip title={isFullScreen ? '退出全屏' : '全屏'} getPopupContainer={getParentElement}>
        {isFullScreen ? (
          <FullscreenExitOutlined
            onClick={() => {
              doAction?.('exitFullscreen')
            }}
          />
        ) : (
          <FullscreenOutlined
            onClick={() => {
              doAction?.('fullscreen')
            }}
          />
        )}
      </Tooltip>
    )
  },
  reload: ({ doAction }) => {
    return <ActionIcon actionName={'reload'} title="刷新" doAction={doAction} IconElement={SyncOutlined} />
  },
  import: ({ doAction }) => {
    return <ActionIcon actionName={'import'} title="导入" doAction={doAction} IconElement={UploadOutlined} />
  },
  export: ({ doAction }) => {
    return <ActionIcon actionName={'export'} title="导出" doAction={doAction} IconElement={DownloadOutlined} />
  },
  columnSetting: ({ doAction, columns, defaultColumnSettings }) => {
    return (
      <ColumnSetting
        parentElement={getParentElement}
        columns={columns}
        defaultColumnSettings={defaultColumnSettings}
        onSettingChange={columnSettings => {
          doAction?.('columnSetting', columnSettings)
        }}
      />
    )
  }
}

export interface TableToolBarProps {
  title?: React.ReactNode
  /**
   * k 继承于 OptionType, 控制相应某个按钮的可见性
   * hideAll 控制全部按钮的可见性, 但是权重小于具体某个按钮的k
   * eg: { hideAll: true, export: true } 仅仅显示导出按钮。
   */
  options?: false | { [k in OptionType | 'hideAll']?: boolean | OptionActionProps['doAction'] }
  doAction?(actionName: ActionType, payload?: any): void | Promise<void>
  toolBarRender?: React.ReactNode[]
  columns?: FastColumnProps[]
  defaultColumnSettings?: ColumnSettingConfig[]
  selectedCount?: number
}

const TableToolBar = ({
  title,
  options,
  selectedCount,
  doAction,
  toolBarRender,
  columns,
  defaultColumnSettings
}: TableToolBarProps) => {
  const defineKeys = Object.keys(OptionsDefine) as OptionType[]
  const filterOptions =
    options === false
      ? []
      : defineKeys
          .filter(k => (!options ? true : options.hideAll ? options[k] : options[k] ?? defaultOptions[k]))
          .map(k => {
            const OptionItemRender = OptionsDefine[k]
            const optionsValue = options?.[k]
            const innerDoAction = typeof optionsValue === 'function' ? optionsValue : doAction
            return (
              <OptionItemRender
                key={k}
                doAction={innerDoAction}
                columns={columns}
                defaultColumnSettings={defaultColumnSettings}
              />
            )
          })
  const hasOptions = filterOptions.length > 0
  const toolbarIsNotEmpty = !!title || !!toolBarRender || !!hasOptions

  return toolbarIsNotEmpty ? (
    <div className={ToolBarClassName}>
      <div className={`${ToolBarClassName}-title`}>
        {selectedCount ? (
          <span className={`${ToolBarClassName}-title-selected`}>
            已选
            <span className={`${ToolBarClassName}-title-selected-count`}> {selectedCount} </span>条
          </span>
        ) : (
          title
        )}
      </div>
      <div className={`${ToolBarClassName}-actions`}>
        {toolBarRender && <Space>{toolBarRender}</Space>}
        {toolBarRender && hasOptions && <Divider type={'vertical'} />}
        {hasOptions && (
          <Space size={'middle'} className={`${ToolBarClassName}-options`}>
            {filterOptions}
          </Space>
        )}
      </div>
    </div>
  ) : null
}

export default TableToolBar
