import { Spin } from 'antd'
import { useEffect, useRef, useState } from 'react'

interface LarkProps {
  redirectUri?: string
  onSuccess?: (data: { code: string; redirectUri: string }) => void
}

const Lark = ({ redirectUri, onSuccess }: LarkProps) => {
  const QRLoginObj = useRef(null)
  const isOpenWindowRef = useRef(false)
  const redirect = redirectUri || `${location.origin}/lark-callback.html`
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const loadFeishuSDK = () => {
      const script = document.createElement('script')
      script.src =
        'https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js'
      script.async = true
      script.onload = () => {
        initQRCode()
        setLoading(false)
      }
      script.onerror = () => {
        console.error('Failed to load Feishu SDK')
      }
      document.head.appendChild(script)
    }

    loadFeishuSDK()
    const goto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${import.meta.env.VITE_LARK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&state=STATE`

    const initQRCode = () => {
      // @ts-ignore
      QRLoginObj.current = window.QRLogin({
        id: 'feishu_qr_code',
        goto,
        width: '234',
        height: '234',
        style: 'width:300px;height:300px'
      })

      window.addEventListener('message', handleMessage, false)
    }

    const handleCallbackMessage = (event: MessageEvent) => {
      const data = event.data
      if (data.type === 'auth-success') {
        if (data.code) {
          onSuccess?.({
            code: data.code,
            redirectUri: redirect
          })
        }
      }
    }

    const handleMessage = async function (event: { origin: any; data: { tmp_code: any } }) {
      const loginTmpCode = event.data.tmp_code

      if (loginTmpCode) {
        if (isOpenWindowRef.current) return
        isOpenWindowRef.current = true

        const width = 600
        const height = 500
        // @ts-ignore
        const left = (window.screenX || window.screenLeft || 0) + (screen.width - width) / 2
        const top = window.screen.height / 2 - height / 2

        const windowFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`

        window.open(`${goto}&tmp_code=${loginTmpCode}`, '_blank', windowFeatures)

        window.addEventListener('message', handleCallbackMessage)
      }
    }

    return () => {
      window.removeEventListener('message', handleMessage, false)
      window.removeEventListener('message', handleCallbackMessage, false)
    }
  }, [])

  return (
    <div id="login_container" className="flex items-center justify-center">
      <div id="feishu_qr_code" className="relative h-[300px] w-[300px]">
        {loading && <Spin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />}
      </div>
    </div>
  )
}

export default Lark
