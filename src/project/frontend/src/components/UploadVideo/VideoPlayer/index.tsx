import { CloseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import './index.scss'
import ReactDOM from 'react-dom/client'
import classNames from 'classnames'

interface VideoPlayerProps {
  src?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  className?: string
}

export const VideoPlayerModal = ({
  open,
  src,
  extra,
  startPosition,
  onClose
}: {
  open?: boolean
  src?: string
  extra?: React.ReactNode
  startPosition?: number
  onClose: () => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    console.log('startPosition', startPosition)
    setTimeout(() => {
      if (typeof startPosition === 'number') {
        if (videoRef.current) {
          videoRef.current.currentTime = startPosition
        }
      }
    })
  }, [])
  if (!open) return null
  return (
    <div className="video-player-modal">
      <div className="video-player-modal-mask"></div>
      <video src={src} ref={videoRef} controls>
        {/* <source src={src} type="video/mp4" /> */}
        Your browser does not support the video tag.
      </video>
      {extra}

      <CloseCircleOutlined size={24} className="video-player-modal-close" onClick={() => onClose()} />
    </div>
  )
}

export const openVideoPlayer = ({
  src,
  extra,
  startPosition
}: {
  src?: string
  extra?: React.ReactNode
  startPosition?: number
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    const onClose = () => {
      resolve()
      setTimeout(() => {
        document.body.contains(div) && document.body.removeChild(div)
      }, 100)
    }

    ReactDOM.createRoot(div).render(
      <VideoPlayerModal startPosition={startPosition} open onClose={onClose} src={src} extra={extra} />
    )
  })
}

export default ({ src, style, className, children }: VideoPlayerProps) => {
  return (
    <div className={classNames('video-player', className)} style={style} onClick={e => e.stopPropagation()}>
      <div onClick={() => openVideoPlayer({ src })} className="h-full w-full cursor-pointer">
        {children || (
          <>
            <video src={src}>
              {/* <source src={src} type="video/mp4" /> */}
              Your browser does not support the video tag.
            </video>

            <div className="video-player-mask">
              <PlayCircleOutlined style={{ fontSize: '20px' }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
