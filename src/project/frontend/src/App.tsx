import './index.css'
import { ConfigProvider } from 'antd'
import { AntdApp } from './utils/antd'
import AntdLocaleCN from 'antd/es/locale/zh_CN'
import { Provider as ReduxProvider } from 'react-redux'
import store from '@/store'
import { MainRouter } from '@/router'
import '@/assets/styles/reset.scss'
import '@/assets/styles/antd.scss'

function App() {
  return (
    <ConfigProvider
      locale={AntdLocaleCN}
      theme={{
        token: {
          colorPrimary: '#f2a16b',
          colorLink: '#f2a16b'
        }
      }}
    >
      <AntdApp>
        <ReduxProvider store={store}>
          <MainRouter />
        </ReduxProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
