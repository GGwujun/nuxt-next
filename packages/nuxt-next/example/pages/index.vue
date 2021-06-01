<template>
  <div @click="clickHandle">
    Works!!! {{ name }} {{ state.name }} : {{ user }}
    <p @click="setName">click set store name</p>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { SET_USER_DATA } from '../store/mutation-type';
console.log(SET_USER_DATA);
export default {
  data() {
    return {};
  },
  computed: {
    user() {
      return this.$store.state.user.name;
    },
  },
  methods: {
    setName() {
      this.$store.commit(`user/${SET_USER_DATA}`, {
        key: 'name',
        value: 'gaowujun',
      });
    },
  },
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
  middleware: ['i18n'],
};
</script>
