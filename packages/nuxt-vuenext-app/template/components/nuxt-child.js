<%= isTest ? '// @vue/component' : '' %>
import {h,resolveComponent} from 'vue'
export default {
  name: 'NuxtChild',
  functional: true,
  props: {
    nuxtChildKey: {
      type: String,
      default: ''
    },
    keepAlive: Boolean,
    keepAliveProps: {
      type: Object,
      default: undefined
    }
  },
  render () {
    return  h(resolveComponent('routerView'), this.data)
  }
}