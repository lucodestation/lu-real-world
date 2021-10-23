<template>
  <div id="app">
    <app-header />

    <router-view></router-view>

    <app-footer />
  </div>
</template>

<script>
import token from '@/utils/token.js';
import request from '@/utils/request.js';

export default {
  name: 'App',
  components: {
    AppHeader: () => import('@/layouts/AppHeader.vue'),
    AppFooter: () => import('@/layouts/AppFooter.vue')
  },
  async mounted() {
    if (token().length < 150) {
      return;
    }

    // 页面加载时如果有 Token
    // 尝试使用 Token 获取用户信息
    const user = await request({
      url: '/user',
      headers: { Authorization: token() }
    });

    // 将用户信息保存到 store
    user && this.$store.commit('changeCurrentUser', user.data);
  }
};
</script>
