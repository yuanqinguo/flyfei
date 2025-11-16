import UserService from '@/service/UserService'
import { useRequest } from 'ahooks'
import { Spin } from 'antd'
import GoCaptcha from 'go-captcha-react'
import { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'

interface CaptchaComponentProps {
  onClose: () => void
  onSuccess: (data: any) => void
}

const CaptchaComponent = ({ onClose, onSuccess }: CaptchaComponentProps) => {
  const domRef = useRef<any>(null)
  const { data, refreshAsync } = useRequest(UserService.verifyCaptcha, {
    onError() {
      onClose()
    }
  })
  const [isError, setIsError] = useState(false)

  const handleConfirm = async (point: any) => {
    try {
      const { x, y } = point || {}
      const res = await UserService.verifyCaptchaCheck({
        key: data?.key,
        slide_x: x,
        slide_y: y
      })
      onSuccess(res)
    } catch (error) {
      refreshAsync().finally(() => {
        setTimeout(() => {
          setIsError(false)
        }, 100)
      })
      setIsError(true)
      domRef.current?.reset()
      console.log(error)
    }
  }

  if (!data) return <Spin />

  return (
    <div className="fixed left-0 top-0 z-[3000] h-full w-full" style={{ background: 'rgba(0, 0, 0, 0.45)' }}>
      <div className="go-captcha-default absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white">
        <GoCaptcha.Slide
          config={{
            // @ts-ignore
            title: (
              <span style={isError ? { color: '#f16543' } : {}}>
                {isError ? '这次有点难呢，正在为你更换拼图' : '请拖动滑块完成拼图'}
              </span>
            ),
            height: 220
          }}
          data={{
            thumbX: data.title_x,
            thumbY: data.title_y,
            thumbWidth: data.title_width,
            thumbHeight: data.title_height,
            image: data.image_base64,
            thumb: data.title_image_base64
          }}
          events={{
            close: onClose,
            confirm: handleConfirm,
            refresh: refreshAsync
          }}
          ref={domRef}
        />
      </div>
    </div>
  )
}

export const showCaptcha = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    const onCancel = () => {
      reject()
      setTimeout(() => {
        document.body.contains(div) && document.body.removeChild(div)
      }, 100)
    }

    const onSuccess = (res: any) => {
      resolve(res)
      onCancel()
    }

    ReactDOM.createRoot(div).render(<CaptchaComponent onClose={onCancel} onSuccess={onSuccess} />)
  })
}
