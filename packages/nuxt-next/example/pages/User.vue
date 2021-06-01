<template>
  <div>User Page</div>
  <div class="clickButton" @click="goBack">点击返回上一页</div>
  <img alt="Vue logo" src="../assets/logo.png" />
</template>

<script>
export default {
  name: "User",
  data() {
    return {
      name: "User",
    };
  },
  created() {
    console.log("home this =====");
  },
  methods: {
    goBack() {
      this.$router.back();
    },
  },
};
</script>
<style>
.clickButton {
  cursor: pointer;
}
</style>