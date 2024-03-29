import {h,reactive,resolveComponent} from 'vue'
import { parsePath, withoutTrailingSlash } from 'ufo'
<% utilsImports = [
  ...(features.asyncData || features.fetch) ? [
    'getMatchedComponentsInstances',
    'getChildrenComponentInstancesUsingFetch',
    'promisify',
    'globalHandleError',
    'urlJoin'
  ] : []
] %>
<% if (utilsImports.length) { %>import { <%= utilsImports.join(', ') %> } from './utils'<% } %>
import NuxtError from '<%= components.ErrorPage ? components.ErrorPage : "./components/nuxt-error.vue" %>'
<% if (loading) { %>import NuxtLoading from '<%= (typeof loading === "string" ? loading : "./components/nuxt-loading.vue") %>'<% } %>
<% if (buildIndicator) { %>import NuxtBuildIndicator from './components/nuxt-build-indicator'<% } %>
<% css.forEach((c) => { %>
import '<%= relativeToBuild(resolvePath(c.src || c, { isStyle: true })) %>'
<% }) %>

<% if (features.layouts) { %>
<%= Object.keys(layouts).map((key) => {
  if (splitChunks.layouts) {
    return `const _${hash(key)} = () => import('${layouts[key]}'  /* webpackChunkName: "${wChunk('layouts/' + key)}" */).then(m => m.default || m)`
  } else {
    return `import _${hash(key)} from '${layouts[key]}'`
  }
}).join('\n') %>

<% if (splitChunks.layouts) { %>
let resolvedLayouts = {}
const layouts = { <%= Object.keys(layouts).map(key => `"_${key}": _${hash(key)}`).join(',') %> }<%= isTest ? '// eslint-disable-line' : '' %>
<% } else { %>
const layouts = { <%= Object.keys(layouts).map(key => `"_${key}": _${hash(key)}`).join(',') %> }<%= isTest ? '// eslint-disable-line' : '' %>
<% } %>

<% } %>

export default {
  render () {
    
    <% if (loading) { %>const loadingEl = h('NuxtLoading', { ref: 'loading' })<% } %>
    <% if (features.layouts) { %>
    const layoutEl = h(this.layout || resolveComponent('nuxt'))
    const templateEl = h('div', {
      domProps: {
        id: '__layout'
      },
      key: this.layoutName
    }, [layoutEl])
    <% } else { %>
    const templateEl = h('nuxt')
    <% } %>

    

    return h('div', {
      domProps: {
        id: '<%= globals.id %>'
      }
    }, [
      <% if (loading) { %>loadingEl, <% } %>
      <% if (buildIndicator) { %>h(NuxtBuildIndicator), <% } %>
      templateEl
    ])
  },
  <% if (features.clientOnline || features.layouts) { %>
  data: () => ({
    <% if (features.clientOnline) { %>
    isOnline: true,
    <% } %>
    <% if (features.layouts) { %>
    layout: null,
    layoutName: '',
    <% } %>
    <% if (features.fetch) { %>
    nbFetching: 0
    <% } %>
    }),
  <% } %>
  beforeCreate () {
    /**
     * TODO 要在当前组件，也就是根组件绑定一个nuxt相应式属性，值是app.nuxt
     * 但是其实在创建根组件的时候选项nuxt本身就是相应式的，后续再来看是否要这样做
     */
    this.nuxt = reactive(this.$options.nuxt);
  },
  created () {
    // Add this.$nuxt in child instances
    this.$root.$options.<%= globals.nuxt %> = this
    
    if (process.client) {
      // add to window so we can listen when ready
      window.<%= globals.nuxt %> = <%= (globals.nuxt !== '$nuxt' ? 'window.$nuxt = ' : '') %>this
      <% if (features.clientOnline) { %>
      this.refreshOnlineStatus()
      // Setup the listeners
      window.addEventListener('online', this.refreshOnlineStatus)
      window.addEventListener('offline', this.refreshOnlineStatus)
      <% } %>
    }
    // Add $nuxt.error()
    this.error = this.nuxt.error
    // Add $nuxt.context
    this.context = this.$options.context
  },
  <% if (loading || isFullStatic) { %>
  async mounted () {
    <% if (loading) { %>this.$loading = this.$refs.loading<% } %>
    <% if (isFullStatic) {%>
    if (this.isPreview) {
      if (this.$store && this.$store._actions.nuxtServerInit) {
        <% if (loading) { %>this.$loading.start()<% } %>
        await this.$store.dispatch('nuxtServerInit', this.context)
      }
      await this.refresh()
      <% if (loading) { %>this.$loading.finish()<% } %>
    }
    <% } %>
  },
  <% } %>
  watch: {
    'nuxt.err': 'errorChanged'
  },
  <% if (features.clientOnline) { %>
  computed: {
    isOffline () {
      return !this.isOnline
    },
    <% if (features.fetch) { %>
    isFetching () {
      return this.nbFetching > 0
    },<% } %>
    <% if (nuxtOptions.target === 'static') { %>
    isPreview () {
      return Boolean(this.$options.previewData)
    },<% } %>
  },
  <% } %>
  methods: {
    <%= isTest ? '/* eslint-disable comma-dangle */' : '' %>
    <% if (features.clientOnline) { %>
    refreshOnlineStatus () {
      if (process.client) {
        if (typeof window.navigator.onLine === 'undefined') {
          // If the browser doesn't support connection status reports
          // assume that we are online because most apps' only react
          // when they now that the connection has been interrupted
          this.isOnline = true
        } else {
          this.isOnline = window.navigator.onLine
        }
      }
    },
    <% } %>
    async refresh () {
      <% if (features.asyncData || features.fetch) { %>
      const pages = getMatchedComponentsInstances(this.$route)

      if (!pages.length) {
        return
      }
      <% if (loading) { %>this.$loading.start()<% } %>

      const promises = pages.map((page) => {
        const p = []

        <% if (features.fetch) { %>
        // Old fetch
        if (page.$options.fetch && page.$options.fetch.length) {
          p.push(promisify(page.$options.fetch, this.context))
        }
        if (page.$fetch) {
          p.push(page.$fetch())
        } else {
          // Get all component instance to call $fetch
          for (const component of getChildrenComponentInstancesUsingFetch(page.$vnode.componentInstance)) {
            p.push(component.$fetch())
          }
        }
        <% } %>
        <% if (features.asyncData) { %>
        if (page.$options.asyncData) {
          p.push(
            promisify(page.$options.asyncData, this.context)
              .then((newData) => {
                for (const key in newData) {
                  Vue.set(page.$data, key, newData[key])
                }
              })
          )
        }
        <% } %>
        return Promise.all(p)
      })
      try {
        await Promise.all(promises)
      } catch (error) {
        <% if (loading) { %>this.$loading.fail(error)<% } %>
        globalHandleError(error)
        this.error(error)
      }
      <% if (loading) { %>this.$loading.finish()<% } %>
      <% } %>
    },
    <% if (splitChunks.layouts) { %>async <% } %>errorChanged () {
      if (this.nuxt.err) {
        <% if (loading) { %>
        if (this.$loading) {
          if (this.$loading.fail) {
            this.$loading.fail(this.nuxt.err)
          }
          if (this.$loading.finish) {
            this.$loading.finish()
          }
        }
        <% } %>
        let errorLayout = (NuxtError.options || NuxtError).layout;

        if (typeof errorLayout === 'function') {
          errorLayout = errorLayout(this.context)
        }
        <% if (splitChunks.layouts) { %>
        await this.loadLayout(errorLayout)
        <% } %>
        this.setLayout(errorLayout)
      }
    },
    <% if (features.layouts) { %>
    <% if (splitChunks.layouts) { %>
    setLayout (layout) {
      <% if (debug) { %>
      if(layout && typeof layout !== 'string') {
        throw new Error('[nuxt] Avoid using non-string value as layout property.')
      }
      <% } %>
      if (!layout || !resolvedLayouts['_' + layout]) {
        layout = 'default'
      }
      this.layoutName = layout
      let _layout = '_' + layout
      this.layout = resolvedLayouts[_layout]
      return this.layout
    },
    loadLayout (layout) {
      const undef = !layout
      const nonexistent = !(layouts['_' + layout] || resolvedLayouts['_' + layout])
      let _layout = '_' + ((undef || nonexistent) ? 'default' : layout)
      if (resolvedLayouts[_layout]) {
        return Promise.resolve(resolvedLayouts[_layout])
      }
      return layouts[_layout]()
        .then((Component) => {
          resolvedLayouts[_layout] = Component
          delete layouts[_layout]
          return resolvedLayouts[_layout]
        })
        .catch((e) => {
          if (this.<%= globals.nuxt %>) {
            return this.<%= globals.nuxt %>.error({ statusCode: 500, message: e.message })
          }
        })
    },
    <% } else { %>
    setLayout (layout) {
      <% if (debug) { %>
      if(layout && typeof layout !== 'string') {
        throw new Error('[nuxt] Avoid using non-string value as layout property.')
      }
      <% } %>
      if (!layout || !layouts['_' + layout]) {
        layout = 'default'
      }
      this.layoutName = layout
      this.layout = layouts['_' + layout]
      return this.layout
    },
    loadLayout (layout) {
      if (!layout || !layouts['_' + layout]) {
        layout = 'default'
      }
      return Promise.resolve(layouts['_' + layout])
    },
    <% } /* splitChunks.layouts */ %>
    <% } /* features.layouts */ %>
    <% if (isFullStatic) { %>
    getRouterBase() {
      return withoutTrailingSlash(this.$router.options.base)
    },
    getRoutePath(route = '/') {
      const base = this.getRouterBase()
      if (base && route.startsWith(base)) {
        route = route.substr(base.length)
      }
      let path = parsePath(route).pathname
      <% if (!nuxtOptions.router.trailingSlash) { %>
        path = withoutTrailingSlash(path)
      <% } %>
      return path || '/'
    },
    getStaticAssetsPath(route = '/') {
      const { staticAssetsBase } = window.<%= globals.context %>

      return urlJoin(staticAssetsBase, withoutTrailingSlash(this.getRoutePath(route)))
    },
    <% if (nuxtOptions.generate.manifest) { %>
      async fetchStaticManifest() {
      return window.__NUXT_IMPORT__('manifest.js', encodeURI(urlJoin(this.getStaticAssetsPath(), 'manifest.js')))
    },
    <% } %>
    setPagePayload(payload) {
      this._pagePayload = payload
      this._fetchCounters = {}
    },
    async fetchPayload(route, prefetch) {
      <% if (nuxtOptions.generate.manifest) { %>
      const manifest = await this.fetchStaticManifest()
      const path = this.getRoutePath(route)
      if (!manifest.routes.includes(path)) {
        if (!prefetch) { this.setPagePayload(false) }
        throw new Error(`Route ${path} is not pre-rendered`)
      }
      <% } %>
      const src = urlJoin(this.getStaticAssetsPath(route), 'payload.js')
      try {
        const payload = await window.__NUXT_IMPORT__(decodeURI(route), encodeURI(src))
        if (!prefetch) { this.setPagePayload(payload) }
        return payload
      } catch (err) {
        if (!prefetch) { this.setPagePayload(false) }
        throw err
      }
    }
    <% } %>
  },
  <% if (loading) { %>
  components: {
    NuxtLoading
  }
  <% } %>
  <%= isTest ? '/* eslint-enable comma-dangle */' : '' %>
}
