import {h,reactive,resolveComponent} from 'vue'
import { compile } from '../utils'

<% if (components.ErrorPage) { %>
  <% if (('~@').includes(components.ErrorPage.charAt(0))) { %>
import NuxtError from '<%= components.ErrorPage %>'
  <% } else { %>
import NuxtError from '<%= "../" + components.ErrorPage %>'
  <% } %>
<% } else { %>
import NuxtError from './nuxt-error.vue'
<% } /* components */ %>
import NuxtChild from './nuxt-child'

<%= isTest ? '// @vue/component' : '' %>
export default {
  name: 'Nuxt',
  components: {
    NuxtChild,
    NuxtError
  },
  props: {
    nuxtChildKey: {
      type: String,
      default: undefined
    },
    keepAlive: Boolean,
    keepAliveProps: {
      type: Object,
      default: undefined
    },
    name: {
      type: String,
      default: 'default'
    }
  },
  data(){
    return {
      errorFromNuxtError:null
    }
  },
  errorCaptured (error) {
    // if we receive and error while showing the NuxtError component
    // capture the error and force an immediate update so we re-render
    // without the NuxtError component
    if (this.displayingNuxtError) {
      this.errorFromNuxtError = error
      this.$forceUpdate()
    }
  },
  computed: {
    routerViewKey () {
      // If nuxtChildKey prop is given or current route has children
      if (typeof this.nuxtChildKey !== 'undefined' || this.$route.matched.length > 1) {
        return this.nuxtChildKey || compile(this.$route.matched[0].path)(this.$route.params)
      }

      const [matchedRoute] = this.$route.matched

      if (!matchedRoute) {
        return this.$route.path
      }

      const Component = matchedRoute.components.default

      if (Component && Component.options) {
        const { options } = Component

        if (options.key) {
          return (typeof options.key === 'function' ? options.key(this.$route) : options.key)
        }
      }

      const strict = /\/$/.test(matchedRoute.path)
      return strict ? this.$route.path : this.$route.path.replace(/\/$/, '')
    }
  },
  beforeCreate () {
    this.nuxt = reactive(this.$root.$options.nuxt)
  },
  render () {
   
    // if there is no error
    if (!this.nuxt.err) {
      // Directly return nuxt child
      return h(resolveComponent('NuxtChild'), {
        key: this.routerViewKey,
        props: this.$props
      })
    }

    // if an error occurred within NuxtError show a simple
    // error message instead to prevent looping
    if (this.errorFromNuxtError) {
      this.$nextTick(() => (this.errorFromNuxtError = false))

      return h('div', {}, [
        h('h2', 'An error occurred while showing the error page'),
        h('p', 'Unfortunately an error occurred and while showing the error page another error occurred'),
        h('p', `Error details: ${this.errorFromNuxtError.toString()}`),
        h('nuxt-link', { props: { to: '/' } }, 'Go back to home')
      ])
    }

    // track if we are showing the NuxtError component
    this.displayingNuxtError = true
    this.$nextTick(() => (this.displayingNuxtError = false))

    return h(NuxtError, { error: this.nuxt.err})
  }
}
