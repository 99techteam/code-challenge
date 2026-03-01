import { ConfigProvider } from 'antd'
import { SwapPage } from './pages/SwapPage'

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          borderRadius: 12,
        },
      }}
    >
      <SwapPage />
    </ConfigProvider>
  )
}
