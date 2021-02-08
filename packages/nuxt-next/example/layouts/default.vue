<template>
  <div>
    <div>header</div>
    <div class="content">
      <Nuxt />
    </div>
    <div>footer</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
    };
  },
  head: {
    title: 'Nuxt Vuetify Starter',
  },
};
</script>

<style scoped>
</style>