<template>
  <AuthPage :mode="'register'" />
</template>

<script>
export default {
  name: 'AuthRegister',
  components: {
    AuthPage: () => import('@/components/AuthPage.vue')
  },
  mounted() {
    this.$store.commit('changeErrorArray', []);
  }
};
</script>
