<template>
  <div @click="clickHandle">Works! {{ name }} {{ state.name }}</div>
</template>

<script>
import { reactive, ref } from 'vue';
export default {
  setup() {
    let name = ref(2);
    const state = reactive({
      name,
    });
    const clickHandle = function () {
      name++;
    };
    return { name, state, clickHandle };
  },
};
</script>
