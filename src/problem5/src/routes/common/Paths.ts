
export default {
  Base: '/api',
  Users: {
    Base: '/users',
    Search: '/',
    GetOne: '/:id',
    Add: '/',
    Update: '/:id',
    Delete: '/:id',
  },
} as const;
