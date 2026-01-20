import { useRoutes } from 'react-router-dom'
import { lazy } from 'react'
import path from 'src/constants/path'
import LazyLoader from './components/LazyLoader'

const Swap = lazy(() => import('./pages/Swap'))

export function useRouteElements() {
  const routeElements = useRoutes([
    {
      path: '/',
      index: true,
      element: (
        <LazyLoader>
          <Swap />
        </LazyLoader>
      )
    },
    {
      path: path.swap,
      element: (
        <LazyLoader>
          <Swap />
        </LazyLoader>
      )
    },
  ])
  return routeElements
}
