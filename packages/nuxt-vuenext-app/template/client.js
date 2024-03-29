import {createApp,nextTick,unref} from 'vue'

<% if (fetch.client) { %>import fetch from 'unfetch'<% } %>
<% if (features.middleware) { %>import middleware from './middleware.js'<% } %>
import {
  <% if (features.asyncData) { %>applyAsyncData,
  promisify,<% } %>
  <% if (features.middleware) { %>middlewareSeries,<% } %>
  resolveRouteComponents,
  getMatchedComponents,
  getMatchedComponentsInstances,
  flatMapComponents,
  setContext,
  <% if ( features.asyncData || features.fetch) { %>getLocation,<% } %>
  compile,
  getQueryDiff,
  globalHandleError,
  isSamePath,
  urlJoin
} from './utils.js'

import { createNuxtApp,registerComponents<% if (features.layouts) { %>, NuxtError<% } %> } from './index.js'

<% if (features.fetch) { %>import fetchMixin from './mixins/fetch.client'<% } %>
import NuxtLink from './components/nuxt-link.<%= features.clientPrefetch ? "client" : "server" %>.js' // should be included after ./index.js
<% if (isFullStatic) { %>import { installJsonp } from './jsonp'<% } %>

<% if (isFullStatic) { %>installJsonp()<% } %>




<% if (fetch.client) { %>if (!global.fetch) { global.fetch = fetch }<% } %>

// Global shared references
let _lastPaths = []<%= isTest ? '// eslint-disable-line no-unused-vars' : '' %>
let app
let router
<% if (store) { %>let store<%= isTest ? '// eslint-disable-line no-unused-vars' : '' %><% } %>

// Try to rehydrate SSR data from window
const NUXT = window.<%= globals.context %> || {}

const $config = NUXT.config || {}
if ($config.app) {
  __webpack_public_path__ = urlJoin($config.app.cdnURL || '/', $config.app.assetsPath)
}

// TODO 设置全局config
const setVueConfig = function setVueConfig(app){
  Object.assign(app.config, <%= serialize(vue.config) %>)<%= isTest ? '// eslint-disable-line' : '' %>
}

<% if (nuxtOptions.render.ssrLog) { %>
const logs = NUXT.logs || []
  if (logs.length > 0) {
  const ssrLogStyle = 'background: #2E495E;border-radius: 0.5em;color: white;font-weight: bold;padding: 2px 0.5em;'
  console.group && console.group<%= nuxtOptions.render.ssrLog === 'collapsed' ? 'Collapsed' : '' %> ('%cNuxt SSR', ssrLogStyle)
  logs.forEach(logObj => (console[logObj.type] || console.log)(...logObj.args))
  delete NUXT.logs
  console.groupEnd && console.groupEnd()
}
<% } %>


const setVueGlobalError = function setVueGlobalError(app){
// TODO 这块逻辑都要改，先不动，后续回头再改
<% if (debug) { %>
  // Setup global Vue error handler
  console.log(999999);
  if (!app.config.$nuxt) {
    const defaultErrorHandler = app.config.errorHandler
    app.config.errorHandler = async (err, vm, info, ...rest) => {
      // Call other handler if exist
      let handled = null
      if (typeof defaultErrorHandler === 'function') {
        handled = defaultErrorHandler(err, vm, info, ...rest)
      }
      if (handled === true) {
        return handled
      }
  
      if (vm && vm.$root) {
        const nuxtApp = Object.keys(app.config.$nuxt)
          .find(nuxtInstance => vm.$root[nuxtInstance])
  
        // Show Nuxt Error Page
        if (nuxtApp && vm.$root[nuxtApp].error && info !== 'render function') {
          const currentApp = vm.$root[nuxtApp]
          <% if (features.layouts) { %>
          // Load error layout
          let layout = (NuxtError.options || NuxtError).layout
          if (typeof layout === 'function') {
            layout = layout(currentApp.context)
          }
          if (layout) {
            await currentApp.loadLayout(layout).catch(() => {})
          }
          currentApp.setLayout(layout)
          <% } %>
          currentApp.error(err)
        }
      }
  
      if (typeof defaultErrorHandler === 'function') {
        return handled
      }
  
      // Log to console
      if (process.env.NODE_ENV !== 'production') {
        console.error(err)
      } else {
        console.error(err.message || err)
      }
    }
    app.config.$nuxt = {}
  }
  app.config.$nuxt.<%= globals.nuxt %> = true
  <% } %>
}



// Create and mount App
createNuxtApp(null, NUXT.config).then(mountApp).catch(console.error)



async function loadAsyncComponents (to, from, next) {
  // Check if route changed (this._routeChanged), only if the page is not an error (for validate())
  this._routeChanged = Boolean(app.nuxt.err) || from.name !== to.name
  this._paramChanged = !this._routeChanged && from.path !== to.path
  this._queryChanged = !this._paramChanged && from.fullPath !== to.fullPath
  this._diffQuery = (this._queryChanged ? getQueryDiff(to.query, from.query) : [])

  <% if (loading) { %>
  if ((this._routeChanged || this._paramChanged) && this.$loading.start && !this.$loading.manual) {
    this.$loading.start()
  }
  <% } %>

  try {
    if (this._queryChanged) {
      const Components = await resolveRouteComponents(
        to,
        (Component, instance) => ({ Component, instance })
      )
      // Add a marker on each component that it needs to refresh or not
      const startLoader = Components.some(({ Component, instance }) => {
        const watchQuery = Component.watchQuery
        if (watchQuery === true) {
          return true
        }
        if (Array.isArray(watchQuery)) {
          return watchQuery.some(key => this._diffQuery[key])
        }
        if (typeof watchQuery === 'function') {
          return watchQuery.apply(instance, [to.query, from.query])
        }
        return false
      })
      <% if (loading) { %>
      if (startLoader && this.$loading.start && !this.$loading.manual) {
        this.$loading.start()
      }
      <% } %>
    }
    // Call next()
    next()
  } catch (error) {
    const err = error || {}
    const statusCode = err.statusCode || err.status || (err.response && err.response.status) || 500
    const message = err.message || ''

    // Handle chunk loading errors
    // This may be due to a new deployment or a network problem
    if (/^Loading( CSS)? chunk (\d)+ failed\./.test(message)) {
      window.location.reload(true /* skip cache */)
      return // prevent error page blinking for user
    }

    this.error({ statusCode, message })
    this.<%= globals.nuxt %>.$emit('routeChanged', to, from, err)
    next()
  }
}

<% if ( features.asyncData || features.fetch) { %>
function applySSRData (Component, ssrData) {
  <% if (features.asyncData) { %>
  if (NUXT.serverRendered && ssrData) {
    applyAsyncData(Component, ssrData)
  }
  <% } %>
  Component._Ctor = Component
  return Component
}

// Get matched components
function resolveComponents (router) {
  const path = getLocation(router);
  return flatMapComponents(router.resolve(path), async (Component, _, match, key, index) => {
    // If component is not resolved yet, resolve it
    if (typeof Component === 'function') {
      Component = await Component()
    }
    // Sanitize it and save it
    const _Component = applySSRData(Component, NUXT.data ? NUXT.data[index] : null)
    match.components[key] = _Component
    return _Component
  })
}
<% } %>

<% if (features.middleware) { %>
function callMiddleware (Components, context, layout) {
  let midd = <%= devalue(router.middleware) %><%= isTest ? '// eslint-disable-line' : '' %>
  let unknownMiddleware = false

  <% if (features.layouts) { %>
  // If layout is undefined, only call global middleware
  if (typeof layout !== 'undefined') {
    midd = [] // Exclude global middleware if layout defined (already called before)
    if (layout.options.middleware) {
      midd = midd.concat(layout.options.middleware)
    }
    Components.forEach((Component) => {
      if (Component.middleware) {
        midd = midd.concat(Component.middleware)
      }
    })
  }
  <% } %>

  midd = midd.map((name) => {
    if (typeof name === 'function') {
      return name
    }
    if (typeof middleware[name] !== 'function') {
      unknownMiddleware = true
      this.error({ statusCode: 500, message: 'Unknown middleware ' + name })
    }
    return middleware[name]
  })

  if (unknownMiddleware) {
    return
  }
  return middlewareSeries(midd, context)
}
<% } else if (isDev) {
// This is a placeholder function mainly so we dont have to
// refactor the promise chain in addHotReload()
%>
function callMiddleware () {
  return Promise.resolve(true)
}
<% } %>


async function render (to, from, next) {
  if (this._routeChanged === false && this._paramChanged === false && this._queryChanged === false) {
    return next()
  }
  // Handle first render on SPA mode
  let spaFallback = false
  if (to === from) {
    _lastPaths = []
    spaFallback = true
  } else {
    const fromMatches = []
    _lastPaths = getMatchedComponents(from, fromMatches).map((Component, i) => {
      return compile(from.matched[fromMatches[i]].path)(from.params)
    })
  }

  // nextCalled is true when redirected
  let nextCalled = false
  const _next = (path) => {
    <% if (loading) { %>
    if (from.path === path.path && this.$loading.finish) {
      this.$loading.finish()
    }
    <% } %>
    <% if (loading) { %>
    if (from.path !== path.path && this.$loading.pause) {
      this.$loading.pause()
    }
    <% } %>
    if (nextCalled) {
      return
    }

    nextCalled = true
    next(path)
  }

  // Update context
  await setContext(app, {
    route: to,
    from,
    next: _next.bind(this)
  })
  this._dateLastError = app.nuxt.dateErr
  this._hadError = Boolean(app.nuxt.err)

  // Get route's matched components
  const matches = []
  const Components = getMatchedComponents(to, matches)

  console.log('Components',to,Components);

  // If no Components matched, generate 404
  if (!Components.length) {
    <% if (features.middleware) { %>
    // Default layout
    await callMiddleware.call(this, Components, app.context)
    if (nextCalled) {
      return
    }
    <% } %>

    <% if (features.layouts) { %>
    // Load layout for error page
    const errorLayout = (NuxtError.options || NuxtError).layout
    // TODO 需要后续再思考
    const layout = undefined
    // const layout = await this.loadLayout(
    //   typeof errorLayout === 'function'
    //     ? errorLayout.call(NuxtError, app.context)
    //     : errorLayout
    // )
    <% } %>

    <% if (features.middleware) { %>
    await callMiddleware.call(this, Components, app.context, layout)
    if (nextCalled) {
      return
    }
    <% } %>

    // Show error page
    app.context.error({ statusCode: 404, message: '<%= messages.error_404 %>' })
    return next()
  }

  <% if (features.asyncData || features.fetch) { %>
  // Update ._data and other properties if hot reloaded
  Components.forEach((Component) => {
    if (Component._Ctor) {
      <% if (features.asyncData) { %>Component.asyncData = Component._Ctor.asyncData<% } %>
      <% if (features.fetch) { %>Component.fetch = Component._Ctor.fetch<% } %>
    }
  })
  <% } %>


  try {
    <% if (features.middleware) { %>
    // Call middleware
    await callMiddleware.call(this, Components, app.context)
    if (nextCalled) {
      return
    }
    if (app.context._errored) {
       next()
       return false
    }
    <% } %>

    <% if (features.layouts) { %>
    // Set layout
    let layout = Components[0].options.layout
    if (typeof layout === 'function') {
      layout = layout(app.context)
    }
    // layout = await this.loadLayout(layout)
    <% } %>

    <% if (features.middleware) { %>
    // Call middleware for layout
    await callMiddleware.call(this, Components, app.context, layout)
    if (nextCalled) {
      return
    }
    if (app.context._errored) {
       next()
       return false
    }
    <% } %>


    <% if (features.validate) { %>
    // Call .validate()
    let isValid = true
    try {
      for (const Component of Components) {
        if (typeof Component.validate !== 'function') {
          continue
        }

        isValid = await Component.validate(app.context)

        if (!isValid) {
          break
        }
      }
    } catch (validationError) {
      // ...If .validate() threw an error
      this.error({
        statusCode: validationError.statusCode || '500',
        message: validationError.message
      })
       next()
       return false
    }

    // ...If .validate() returned false
    if (!isValid) {
      this.error({ statusCode: 404, message: '<%= messages.error_404 %>' })
       next()
       return false
    }
    <% } %>

    <% if (features.asyncData || features.fetch) { %>
    let instances
    // Call asyncData & fetch hooks on components matched by the route.
    await Promise.all(Components.map(async (Component, i) => {
      // Check if only children route changed
      Component._path = compile(to.matched[matches[i]].path)(to.params)
      Component._dataRefresh = false
      const childPathChanged = Component._path !== _lastPaths[i]
      // Refresh component (call asyncData & fetch) when:
      // Route path changed part includes current component
      // Or route param changed part includes current component and watchParam is not `false`
      // Or route query is changed and watchQuery returns `true`
      if (this._routeChanged && childPathChanged) {
        Component._dataRefresh = true
      } else if (this._paramChanged && childPathChanged) {
        const watchParam = Component.watchParam
        Component._dataRefresh = watchParam !== false
      } else if (this._queryChanged) {
        const watchQuery = Component.watchQuery
        if (watchQuery === true) {
          Component._dataRefresh = true
        } else if (Array.isArray(watchQuery)) {
          Component._dataRefresh = watchQuery.some(key => this._diffQuery[key])
        } else if (typeof watchQuery === 'function') {
          if (!instances) {
            instances = getMatchedComponentsInstances(to)
          }
          Component._dataRefresh = watchQuery.apply(instances[i], [to.query, from.query])
        }
      }
      if (!this._hadError && this._isMounted && !Component._dataRefresh) {
        return
      }

      const promises = []

      <% if (features.asyncData) { %>
      const hasAsyncData = (
        Component.asyncData &&
        typeof Component.asyncData === 'function'
      )
      <% } else { %>
      const hasAsyncData = false
      <% } %>

      <% if (features.fetch) { %>
      const hasFetch = Boolean(Component.fetch) && Component.fetch.length
      <% } else { %>
      const hasFetch = false
      <% } %>

      <% if (loading) { %>
      const loadingIncrease = (hasAsyncData && hasFetch) ? 30 : 45
      <% } %>

      <% if (features.asyncData) { %>
      // Call asyncData(context)
      if (hasAsyncData) {
        <% if (isFullStatic) { %>
          let promise

          if (this.isPreview || spaFallback) {
            promise = promisify(Component.asyncData, app.context)
          } else {
              promise = this.fetchPayload(to.path)
                .then(payload => payload.data[i])
                .catch(_err => promisify(Component.asyncData, app.context)) // Fallback
          }
        <% } else { %>
        const promise = promisify(Component.asyncData, app.context)
        <% } %>
        promise.then((asyncDataResult) => {
          applyAsyncData(Component, asyncDataResult)
          <% if (loading) { %>
          if (this.$loading.increase) {
            this.$loading.increase(loadingIncrease)
          }
          <% } %>
        })
        promises.push(promise)
      }
      <% } %>

      <% if (isFullStatic && store) { %>
      if (!this.isPreview && !spaFallback) {
        // Replay store mutations, catching to avoid error page on SPA fallback
        promises.push(this.fetchPayload(to.path).then(payload => {
          payload.mutations.forEach(m => { this.$store.commit(m[0], m[1]) })
        }).catch(err => null))
      }
      <% } %>

      // Check disabled page loading
      this.$loading.manual = Component.loading === false

      <% if (features.fetch) { %>
        <% if (isFullStatic) { %>
        if (!this.isPreview && !spaFallback) {
          // Catching the error here for letting the SPA fallback and normal fetch behaviour
          promises.push(this.fetchPayload(to.path).catch(err => null))
        }
      <% } %>
      // Call fetch(context)
      if (hasFetch) {
        let p = Component.fetch(app.context)
        if (!p || (!(p instanceof Promise) && (typeof p.then !== 'function'))) {
          p = Promise.resolve(p)
        }
        p.then((fetchResult) => {
          <% if (loading) { %>
          if (this.$loading.increase) {
            this.$loading.increase(loadingIncrease)
          }
          <% } %>
        })
        promises.push(p)
      }
      <% } %>

      return Promise.all(promises)
    }))
    <% } %>

    // If not redirected
    if (!nextCalled) {
      <% if (loading) { %>
      if (this.$loading.finish && !this.$loading.manual) {
        this.$loading.finish()
      }
      <% } %>
      next()
      return true
    }

  } catch (err) {
    const error = err || {}
    if (error.message === 'ERR_REDIRECT') {
      return this.<%= globals.nuxt %>.$emit('routeChanged', to, from, error)
    }
    _lastPaths = []

    globalHandleError(error)

    <% if (features.layouts) { %>
    // Load error layout
    let layout = (NuxtError.options || NuxtError).layout
    if (typeof layout === 'function') {
      layout = layout(app.context)
    }
    // await this.loadLayout(layout)
    <% } %>

    this._component.nuxt.error(error)
    // this.<%= globals.nuxt %>.$emit('routeChanged', to, from, error)
    next()
    return false
  }
}

// Fix components format in matched, it's due to code-splitting of vue-router
function normalizeComponents (to, ___) {
  flatMapComponents(to, (Component, _, match, key) => {
    if (typeof Component === 'object') {
      Component._Ctor = Component
      match.components[key] = Component
    }
    return Component
  })
}

<% if (features.layouts) { %>
<% if (splitChunks.layouts) { %>async <% } %>function setLayoutForNextPage (to) {
  return
  // TOTO 后续思考
  // Set layout
  let hasError = Boolean(this.$options.nuxt.err)
  if (this._hadError && this._dateLastError === this.$options.nuxt.dateErr) {
    hasError = false
  }
  let layout = hasError
    ? (NuxtError.options || NuxtError).layout
    : to.matched[0].components.default.options.layout

  if (typeof layout === 'function') {
    layout = layout(app.context)
  }
  <% if (splitChunks.layouts) { %>
  // await this.loadLayout(layout)
  <% } %>
  this.setLayout(layout)
}
<% } %>

function checkForErrors (app) {
  // Hide error component if no error
  if (app._hadError && app._dateLastError === app._component.nuxt.dateErr) {
    app.error()
  }
}

// When navigating on a different route but the same component is used, Vue.js
// Will not update the instance data, so we have to update $data ourselves
function fixPrepatch (to, ___) {
  if (this._routeChanged === false && this._paramChanged === false && this._queryChanged === false) {
    return
  }

  const instances = getMatchedComponentsInstances(to)
  const Components = getMatchedComponents(to)

  let triggerScroll = true

  nextTick(() => {
    instances.forEach((instance, i) => {
      if (!instance || instance._isDestroyed) {
        return
      }

      if (
        instance.constructor._dataRefresh &&
        Components[i] === instance.constructor &&
        instance.$vnode.data.keepAlive !== true &&
        typeof instance.constructor.options.data === 'function'
      ) {
        const newData = instance.constructor.options.data.call(instance)
        for (const key in newData) {
          // TODO 这个后续优化
          // Vue.set(instance.$data, key, newData[key])
        }

        triggerScroll = true
      }
    })

    if (triggerScroll) {
      // Ensure to trigger scroll event after calling scrollBehavior
      window.<%= globals.nuxt %>.$nextTick(() => {
        // window.<%= globals.nuxt %>.$emit('triggerScroll')
      })
    }

    checkForErrors(this)
    <% if (isDev) { %>
    // Hot reloading
    // setTimeout(() => hotReloadAPI(this), 100)
    <% } %>
  })
}

function nuxtReady (_app) {
  window.<%= globals.readyCallback %>Cbs.forEach((cb) => {
    if (typeof cb === 'function') {
      cb(_app)
    }
  })
  // Special JSDOM
  if (typeof window.<%= globals.loadedCallback %> === 'function') {
    window.<%= globals.loadedCallback %>(_app)
  }
  // Add router hooks
  router.afterEach((to, from) => {
    // Wait for fixPrepatch + $data updates
    // nextTick(() => _app.<%= globals.nuxt %>.$emit('routeChanged', to, from))
  })
}

<% if (isDev) { %>
const noopData = () => { return {} }
const noopFetch = () => {}

// Special hot reload with asyncData(context)
function getNuxtChildComponents ($parent, $components = []) {
  Object.keys($parent.$refs).forEach(($child) => {
    $child = $parent.$refs[$child]
    if ($child.__vueParentComponent && $child.__vueParentComponent.data.nuxtChild && !$components.find(c =>(c.__file === $child.__file))) {
      $components.push($child)
    }
    if ($child.$children && $child.$refs.length) {
      getNuxtChildComponents($child, $components)
    }
  })

  return $components
}

function hotReloadAPI(_app) {
  if (!module.hot) return

  let $components = getNuxtChildComponents(_app.<%= globals.nuxt %>, [])

  $components.forEach(addHotReload.bind(_app))
}

function addHotReload ($component, depth) {
  if ($component.$vnode.data._hasHotReload) return
  $component.$vnode.data._hasHotReload = true

  var _forceUpdate = $component.$forceUpdate.bind($component.$parent)

  $component.$vnode.context.$forceUpdate = async () => {
    let Components = getMatchedComponents(router.currentRoute)
    let Component = Components[depth]
    if (!Component) {
      return _forceUpdate()
    }
    if (typeof Component === 'object') {
      Component._Ctor = Component
    }
    this.error()
    let promises = []
    const next = function (path) {
      <%= (loading ? 'this.$loading.finish && this.$loading.finish()' : '') %>
      router.push(path)
    }
    await setContext(app, {
      route: router.currentRoute,
      isHMR: true,
      next: next.bind(this)
    })
    const context = app.context

    <% if (loading) { %>
    if (this.$loading.start && !this.$loading.manual) {
      this.$loading.start()
    }
    <% } %>

    callMiddleware.call(this, Components, context)
    .then(() => {
      <% if (features.layouts) { %>
      // If layout changed
      if (depth !== 0) {
        return
      }

      let layout = Component.layout || 'default'
      if (typeof layout === 'function') {
        layout = layout(context)
      }
      if (this.layoutName === layout) {
        return
      }
      let promise = Promise.resolve()
      // this.loadLayout(layout)
      promise.then(() => {
        // this.setLayout(layout)
        // nextTick(() => hotReloadAPI(this))
      })
      return promise
      <% } else { %>
      return
      <% } %>
    })
    <% if (features.layouts) { %>
    .then(() => {
      return callMiddleware.call(this, Components, context, this.layout)
    })
    <% } %>
    .then(() => {
      <% if (features.asyncData) { %>
      // Call asyncData(context)
      let pAsyncData = promisify(Component.asyncData || noopData, context)
      pAsyncData.then((asyncDataResult) => {
        applyAsyncData(Component, asyncDataResult)
        <%= (loading ? 'this.$loading.increase && this.$loading.increase(30)' : '') %>
      })
      promises.push(pAsyncData)
      <% } %>

      <% if (features.fetch) { %>
      // Call fetch()
      Component.fetch = Component.fetch || noopFetch
      let pFetch = Component.fetch.length && Component.fetch(context)
      if (!pFetch || (!(pFetch instanceof Promise) && (typeof pFetch.then !== 'function'))) { pFetch = Promise.resolve(pFetch) }
      <%= (loading ? 'pFetch.then(() => this.$loading.increase && this.$loading.increase(30))' : '') %>
      promises.push(pFetch)
      <% } %>
      return Promise.all(promises)
    })
    .then(() => {
      <%= (loading ? 'this.$loading.finish && this.$loading.finish()' : '') %>
      _forceUpdate()
      // setTimeout(() => hotReloadAPI(this), 100)
    })
  }
}
<% } %>

async function mountApp (__app) {
  // Set global variables
  app = __app.app
  router = __app.router
  <% if (store) { %>store = __app.store<% } %>

  // Create Vue instance
  const _app = createApp(app);

  _app.use(router);
  _app.use(store);

  registerComponents(_app);

  // Component: <NuxtLink>
  _app.component(NuxtLink.name, NuxtLink)
  <% if (features.componentAliases) { %>_app.component('NLink', NuxtLink)<% } %>


  <% if (features.fetch) { %>
  // Fetch mixin
  if (!_app.__nuxt__fetch__mixin__) {
    _app.mixin(fetchMixin)
    _app.__nuxt__fetch__mixin__ = true
  }
  <% } %>


  <% if (isFullStatic) { %>
  // Load page chunk
  if (!NUXT.data && NUXT.serverRendered) {
    try {
      const payload = await _app.fetchPayload(NUXT.routePath || _app.context.route.path)
      Object.assign(NUXT, payload)
    } catch (err) {}
  }
  <% } %>

  <% if (features.layouts && mode !== 'spa') { %>

  // Load layout 这里主要是加载全局的NUXT配置中的布局
  /**
   * 在app无法调用loadLayout，需要找解决方案
   * 为什么不放到app.js中做初始化？这个初始化也只执行一次
   */
  const layout = NUXT.layout || 'default'
  
  await _app.loadLayout(layout)
  _app.setLayout(layout)
  
  <% } %>

  // Mounts Vue app to DOM element
  const mount = () => {
    const rootComponent = _app.mount('#<%= globals.id %>')

    // Add afterEach router hooks
    router.afterEach(normalizeComponents)
    <% if (features.layouts) { %>
    router.afterEach(setLayoutForNextPage.bind(_app))
    <% } %>
    router.afterEach(fixPrepatch.bind(_app))

    // Listen for first Vue update
    nextTick(() => {
      // Call window.{{globals.readyCallback}} callbacks
      nuxtReady(_app)
      <% if (isDev) { %>
      // Enable hot reloading
      // hotReloadAPI(rootComponent)
      <% } %>
    })
  }
    
  // Initialize error handler
  _app.$loading = {} // To avoid error while _app.$nuxt does not exist
  
  if (NUXT.error) {
    // TODO 这个地方也是同理，_app无法拿到实例的方法
    _app.error(NUXT.error)
  }

  // Add beforeEach router hooks
  router.beforeEach(loadAsyncComponents.bind(_app))
  router.beforeEach(render.bind(_app))

  // Fix in static: remove trailing slash to force hydration
  // Full static, if server-rendered: hydrate, to allow custom redirect to generated page
  <% if (isFullStatic) { %>
  if (NUXT.serverRendered) {
    return mount()
  }
  <% } else { %>
  // Fix in static: remove trailing slash to force hydration
  if (NUXT.serverRendered && isSamePath(NUXT.routePath, _app.context.route.path)) {
    return mount()
  }
  <% } %>

  // First render on client-side
  const clientFirstMount = () => {
    normalizeComponents(router.currentRoute, router.currentRoute)
    setLayoutForNextPage.call(_app, router.currentRoute)
    checkForErrors(_app)
    // Don't call fixPrepatch.call(_app, router.currentRoute, router.currentRoute) since it's first render
    mount()
  }

  await router.isReady()

  <%  if (features.asyncData || features.fetch) { %>
  // await router install done
  await Promise.all(resolveComponents(router))
  <% } %>

  render.call(_app, router.currentRoute, router.currentRoute, (path) => {
    // If not redirected
    if (!path) {
      clientFirstMount()
      return
    }

    // Add a one-time afterEach hook to
    // mount the app wait for redirect and route gets resolved
    const unregisterHook = router.afterEach((to, from) => {
      unregisterHook()
      clientFirstMount()
    })

    // Push the path and let route to be resolved
    router.push(path, undefined, (err) => {
      if (err) {
        errorHandler(err)
      }
    })
  })
}
