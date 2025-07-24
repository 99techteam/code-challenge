import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Home from '@/pages/home'
import NotFound from '@/pages/not-found'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '@/components/layout'

import '@radix-ui/themes/styles.css'
import './main.css'
import './reset.css'
import { ThemeProvider } from './context/theme'
import { ToastContainer } from 'react-toastify'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true, // this acts like path: "", but cleaner
        element: <Home />,
      },
    ],
    errorElement: <NotFound />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastContainer />
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
