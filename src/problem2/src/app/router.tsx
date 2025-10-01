import { paths } from '@/config/path';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convert = () => (m: any) => {
  const { default: Component, ...rest } = m;
  return {
    ...rest,
    Component,
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.home.path,
      lazy: () => import('./routes/home').then(convert()),
    },
    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert()),
    },
  ]);
  
export const AppRouter = () => {

  const router = useMemo(() => createAppRouter( ), []);

  return <RouterProvider router={router} />;
};