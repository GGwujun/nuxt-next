export const state = () => ({});

export const getters = {
  roles: (state) => state.permission.roles,
  roleIds: (state) => state.permission.roleIds,
  permission_routes: (state) => state.permission.routes,
  authRoles: (state) => state.permission.authRoles,
};
