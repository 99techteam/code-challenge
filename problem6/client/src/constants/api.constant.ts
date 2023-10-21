const PATH_API_V1 = {
  auth: {
    root: "/v1/auth",
    feature: {
      register: "/register",
      login: "/login",
      logout: "/logout",
      resetPassword: "/resetPassword",
    },
  },
  user: {
    root: "/v1/user",
    feature: {
      getAllUsers: "/getAllUsers",
      updatePoint: "/updatePoint",
    },
  },
};

export { PATH_API_V1 };
