import * as options from "./options";

if (process.client) {
  window.<%= options.loginCallBack %>Cbs = []
}

function checkUri(content,auths){
  if ([true, undefined].includes(auths) || auths?.length === 0) return true
  if (Array.isArray(auths)) {
    return auths.some((auth) =>  typeof auth.uri === 'undefined' || content.store.state?.permission?.listPerm.includes(auth.uri))
  }
  if (auths && typeof auths === 'object') {
    return typeof auths.uri === 'undefined' || content.store.state?.permission?.listPerm.includes(auths.uri)
  }
  if(auths && typeof auths === 'string'){
    return content.store.state?.permission?.listPerm.includes(auths)
  }
  return false
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
export function hasPermission (content, access) {
  // 路由中有 meta，并且配置了 auth 且该用户拥有 auth
  <% if (options.access) { %>
    <%if (options.rbacUrl) {%>
      return checkUri(content, access) && callMiddleware(content, access)
    <% } else {%>
      return callMiddleware(content, access)
    <% } %>
  <% } else if (options.rbacUrl) { %>
    return checkUri(content, access);
  <% } else {%>
    return true
  <%}%>
}

function sortMenu(muneData) {
  // 根据 menu 里的配置 meta.sortKey 排序
  return muneData
    .concat()
    .sort(
      ({ meta: { sortkey: pre = 999 } }, { meta: { sortkey: next = 999 } }) =>
        Number(pre) - Number(next)
    );
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 * @return {Array}
 */
export  function filterAsyncRoutes(content,routes) {
  const res = [];

  sortMenu(routes.filter(route => route.meta && !route.meta.hide && route.meta.title)).forEach(route => {
    const tmp = { ...route };

    if(hasPermission(content,tmp.meta['<%= options.accessField %>'])){
      if (tmp.children) {
        // 当前节点根据路由配置属于非叶子节点
        tmp.children = filterAsyncRoutes(content, tmp.children);

        if (!tmp.children.length) {
          // 无子节点
          if (!(tmp.meta?.showIfNoChild)) {
            // 设置 meta.showIfNoChild true 强制显示，否则默认隐藏菜单
            return
          }

          // 没有需要显示的子路由，统一手动删除 children
          // 避免 element-ui el-submenu 显示下级箭头
          Reflect.deleteProperty(tmp, 'children')
        }
      }

      res.push(tmp)
    }
  })

  return res
}

export function promisify(fn, ...rest) {
  let promise= fn(...rest);
  if (
    promise &&
    promise instanceof Promise &&
    typeof promise.then === "function"
  ) {
    return promise;
  }
  return Promise.resolve(promise);
}

export function middlewareSeries(promises, context) {
  if (!promises.length) {
    return Promise.resolve();
  }
  return promisify(promises[0], context).then(() => {
    return middlewareSeries(promises.slice(1), context);
  });
}

export  function authSeries(promises, context,access) {
  if (!promises.length) {
    return true;
  }
  let result = true;
  for (const iterator of promises) {
    const ref =  iterator(context,access)
    if(!ref){
      result = false
      break;
    }
  }
  return result
}

<% if (options.access) { %>
export function callMiddleware (content,access) {
    let midd = <%= devalue(options.access.map(plugin=>plugin.name.split('.')[0])) %>
    let unknownMiddleware = false
    midd = midd.map((plugin) => {
      unknownMiddleware=true
      return options[plugin]
    })
    if (!unknownMiddleware) {
      return
    }

    return authSeries(midd, content,access)
  }
  <% } %>
