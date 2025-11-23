import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { worker } from './mocks/browser.ts'

import './styles.css'

await worker.start({
  waitUntilReady: true, // ⬅️ Fix cold start
  onUnhandledRequest: 'bypass'
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position='top-center' />
  </StrictMode>
)
