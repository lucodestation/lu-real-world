<template>
  <ul class="nav navbar-nav pull-xs-right">
    <!-- 
      Vue Router 的首页路由链接默认一直有激活链接
      的类名，除非为其添加 exact 属性 
    -->

    <!-- 这里你需要给激活的路由链接添加 active 类名 -->
    <!-- 首页 -->
    <li class="nav-item">
      <!-- exact 用于去掉 vue-router 给根路由 / 的非激活状态的 active 类名 -->
      <router-link to="/" exact class="nav-link">首页</router-link>
    </li>

    <!-- 登录 -->
    <li class="nav-item">
      <router-link to="/login" class="nav-link">登录</router-link>
    </li>

    <!-- 注册 -->
    <li class="nav-item">
      <router-link to="/register" class="nav-link">注册</router-link>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'NavTourist'
};
</script>
