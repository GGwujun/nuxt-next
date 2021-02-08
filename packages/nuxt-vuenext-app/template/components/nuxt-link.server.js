import { h, resolveComponent } from "vue";

<%= isTest ? '// @vue/component' : '' %>
export default {
  name: 'NuxtLink',
  extends: resolveComponent('RouterLink'),
  props: {
    prefetch: {
      type: Boolean,
      default: <%= router.prefetchLinks ? 'true' : 'false' %>
    },
    noPrefetch: {
      type: Boolean,
      default: false
    }
  }
}
