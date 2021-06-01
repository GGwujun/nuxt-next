<template>
  <div>
    <h1>应用运行异常</h1>
    <p>{{error.message}}</p>
    <p>{{error.statusCode}}</p>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      default: () => ({}),
      type: Object,
    },
  },
  created(){
    console.log(this.error);
  }
};
</script>
