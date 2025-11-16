import ReactDOM from 'react-dom/client'
import { Button } from 'antd'
import { useClickAway } from 'ahooks'
import { useRef } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import './index.scss'

interface CommentConfirmProps {
  style?: React.CSSProperties
  onClose: () => void
  onSelect: (type: string) => void
}

const CommentConfirm = ({ style, onClose, onSelect }: CommentConfirmProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  useClickAway(() => {
    onClose()
  }, rootRef)
  return (
    <div ref={rootRef} style={style} className="comment-confirm">
      <Button type="text" icon={<PlusOutlined />} onClick={() => onSelect('comment')}>
        添加批注
      </Button>
    </div>
  )
}

export const showCommentConfirm = ({ style }: { style: React.CSSProperties }) => {
  return new Promise((resolve, reject) => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    let isDestroy = false

    const onSelect = (type: string) => {
      resolve(type)
      destroy()
    }

    const onCancel = () => {
      reject()
      destroy()
    }

    const destroy = () => {
      setTimeout(() => {
        if (div && !isDestroy) {
          document.body.contains(div) && document.body.removeChild(div)
          isDestroy = true
        }
      }, 50)
    }

    ReactDOM.createRoot(div).render(<CommentConfirm style={style} onClose={onCancel} onSelect={onSelect} />)
  })
}
