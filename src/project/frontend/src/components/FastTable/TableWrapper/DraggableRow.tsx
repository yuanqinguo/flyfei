import { RefObject, useState } from 'react'
import { ClassPrefix } from '../utils'

export type DragData<T> = {
  /** 开始拖动的行数据 */
  source: T
  /** 开始拖动的行下标 */
  sourceIndex?: number
  /** 拖动至目标的行数据 */
  target?: T
  /** 拖动至目标的行下标 */
  targetIndex?: number
}

export interface DraggableRowProps<T> {
  record: T
  rowIndex?: number
  className?: string
  canDrag?: boolean
  dragRef: RefObject<DragData<T> | null>
  dragEndHandle(dragData: Required<DragData<T>>): void
}

export const DraggableDomClass = ClassPrefix + '-draggable-col'

function DraggableRow<T>({ record, dragRef, rowIndex, dragEndHandle, canDrag, ...rest }: DraggableRowProps<T>) {
  const [beginDrag, setBeginDraw] = useState(false)
  return canDrag ? (
    <tr
      {...rest}
      draggable
      onMouseDown={event => {
        let currentElement = event.target as Element
        while (currentElement) {
          const hasClass = currentElement?.classList.contains(DraggableDomClass)
          if (hasClass) {
            setBeginDraw(true)
            break
          } else {
            currentElement = currentElement.parentElement as Element
          }
        }
      }}
      onDragStart={event => {
        if (!beginDrag) {
          event.preventDefault()
          return
        }
        ;(dragRef as any).current = { source: record, sourceIndex: rowIndex }
      }}
      onDragOver={() => {
        if (dragRef.current) {
          dragRef.current.target = record
          dragRef.current.targetIndex = rowIndex
        }
      }}
      onDragEnd={() => {
        if (dragRef.current) {
          const { source, sourceIndex, target, targetIndex } = dragRef.current
          if (target && source !== target) {
            dragEndHandle({
              source,
              sourceIndex: sourceIndex!,
              target,
              targetIndex: targetIndex!
            })
          }
        }
      }}
    />
  ) : (
    <tr {...rest} />
  )
}

export default DraggableRow
