import Login from "@tzfe/tz-login";

const mutations = {
  SET_MENUS: (state, { accessedRoutes }) => {
    state.menus = accessedRoutes.concat();
  },
  SET_ROUTE: (state, routes) => {
    state.asyncRoutes = routes;
  },
  <% if(options.rbacUrl) {%>
  SET_AUTH: (state, { listPerm }) => {
    state.listPerm = listPerm;
  },
  <% }%>
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo;
  }
};

const actions = {
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      this.$axios
        .$post(
        '<%= options.userInfoUrl %>'
        )
        .then(result => {
          // 如果数据中没有 userDetail
          if (!result) {
            // eslint-disable-next-line
            reject("Verification failed, please Login again.");
          }
          commit("SET_USERINFO", result);
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      if (!Login.getToken(Login.getTokenKey("<%=options.TZ_ENV%>"))) {
        resolve();
      } else {
        this.$axios
          .$post('<%= options.udbOrigin %>/udb/login/logout')
          .then(() => {
            Login.removeToken(Login.getTokenKey("<%=options.TZ_ENV%>"));
            window.location.href = '<%=options.loginOrigin%>'
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  },
  setAsyncRouter({ commit }, routes) {
    return new Promise(resolve => {
      commit("SET_ROUTE", routes);
      resolve(routes);
    });
  },
  <% if(options.rbacUrl) {%>
  getAsyncAuth({ commit, state }) {
    // 获取用户的权限和角色
    return new Promise((resolve, reject) => {
      // 如果已经有了，就不再获取
      if (state.menu && state.menu.length) {
        resolve({ menu: state.menu, roles: state.roles });
        return;
      }
      this.$axios
        .$get("<%=options.rbacUrl%>")
        .then(data => {
          if (!data) {
            // eslint-disable-next-line
            reject("Verification failed, please Login again.");
          }
          const { listPerm } = data;
          commit("SET_AUTH", { listPerm });
          resolve({ listPerm });
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  <% } %>
};

export default {
  namespaced: true,
  state: () => ({
    menus: [],
    asyncRoutes: [],
    userInfo: {},
    //以下3个是最普通的鉴权数据
    menu: [],
    roles: [],
    roleIds: [],
  }),
  mutations,
  actions
};
