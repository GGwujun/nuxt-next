import Login from "@tzfe/tz-login";
import middleware from '../middleware'
import * as options from "./options";
import {middlewareSeries,filterAsyncRoutes,hasPermission,<% if(options.access) {%> callMiddleware <% } %>} from './utils'

const whiteList = ["/login", "/auth-redirect"]; // no redirect whitelist

<% if (options.prepare) { %>
  function callPrepare (content) {
    let midd = <%= devalue(options.prepare.map(plugin=>plugin.name.split('.')[0])) %>
    let unknownMiddleware = false

    midd = midd.map((plugin) => {
      unknownMiddleware=true
      return options[plugin]
    })

    if (!unknownMiddleware) {
      return
    }
    return middlewareSeries(midd, content)
  }
  <% } %>



middleware.auth = async (content) => {
  const { query, env, app, store, error,<% if(options.localLogin){%>redirect<% } %> } = content
  const to = content.app.router.to;
  if (query && query.token) {
    Login.setToken(env.TZ_ENV, query.token);
  }
  const hasToken = Login.getToken(Login.getTokenKey(env.TZ_ENV));

  if (hasToken) {
    // 在没有用户信息的时候获取用户信息
    if (!store.state.permission.userInfo.uid){
      await store.dispatch("permission/getInfo");
      // 通知登录成功
      <% if (options.loginCallBack) {%>
      window.<%=options.loginCallBack%>Cbs.forEach((fn) => {
        if (typeof fn === 'function') {
          fn(hasToken);
        }
      })
      <% } %>
    }

    // 在首次调用中间件的时候处理业务侧的自定义逻辑
    // 比如银河会在鉴权之前拿部门或者用户组数据
    <% if (options.prepare) { %>
    if(!window.$nuxt.prepared){
      await callPrepare(content);
      window.$nuxt.prepared=true;
    }
    <% } %>

    // 在没有获取路由和菜单标识的时候获取一次
    if (store.state.permission.asyncRoutes.length === 0) {
      let menu =[];
      <% if(options.rbacUrl){ %>
      const  { menu:menus=[] } = await store.dispatch("permission/getAsyncAuth");
      menu = menus.concat()
      <% } %>
      await store.dispatch(
        "permission/setAsyncRouter",
        app.router.options.routes
      );
      const accessedRoutes =  filterAsyncRoutes(content,app.router.options.routes);
      if(!accessedRoutes||accessedRoutes.length===0){
        error({statusCode:403})
      }
      store.commit("permission/SET_MENUS", { accessedRoutes });
    }
    if (to.path === "/login") {
      Login.removeToken(Login.getTokenKey(env.TZ_ENV));
      return
    }

    if(to.meta && !hasPermission(content,to.meta.auths)){
      // 无权限
      error({ statusCode: 403 });
      return
    }
    return
  }

  if (whiteList.indexOf(to.path) !== -1) {
    // 白名单
    return
  }

  <% if (options.localLogin) {%>
  redirect('<%= options.loginUrl %>')
  <% } else { %>
  window.location.href = '<%=options.loginOrigin%>';
  <% } %>
};
