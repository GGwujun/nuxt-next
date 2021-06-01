<template>
  <NuxtLink to="/user">Click History vueRouter ==== Home page goto User Page</NuxtLink>
  <div class="vuexButton" @click="init">
    vuex state , 点击更改状态==== {{ isVirgin }}
  </div>
  <img alt="Vue logo" src="../assets/logo.png" />
  <HelloWorld msg="Welcome to Your Vue.js App" />
</template>

<script>
import HelloWorld from '../components/HelloWorld.vue';

export default {
  name: 'App',
  inject: ['layoutName'],
  components: {
    HelloWorld,
  },
  data() {
    return {
      name: 'home',
    };
  },
  created() {
    console.log('home this =====', this);
    console.log('layoutName', this.layoutName);
  },
  computed: {
    isVirgin() {
      return this.$store.state.user.isVirgin;
    },
  },
  methods: {
    init() {
      this.$store.dispatch('user/init');
    },
  },
};
</script>

<style>
.vuexButton {
  cursor: pointer;
}
</style>