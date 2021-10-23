<template>
  <nav class="navbar navbar-light">
    <div class="container">
      <!-- 左上角 logo -->
      <router-link to="/" class="navbar-brand"> conduit </router-link>

      <NavTourist v-if="!$store.state.isLoggedIn" />
      <NavUser v-if="$store.state.isLoggedIn" />
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppHeader',
  components: {
    NavTourist: () => import('@/components/NavTourist.vue'),
    NavUser: () => import('@/components/NavUser.vue')
  }
};
</script>
