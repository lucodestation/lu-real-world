<template>
  <ul class="nav navbar-nav pull-xs-right">
    <!-- 
      Vue Router 的首页路由链接默认一直有激活链接
      的类名，除非为其添加 exact 属性 
    -->

    <!-- 这里你需要给激活的路由链接添加 active 类名 -->
    <!-- 首页 -->
    <li class="nav-item">
      <router-link to="/" exact class="nav-link">首页</router-link>
    </li>

    <!-- 创建文章 -->
    <li class="nav-item">
      <router-link to="/editor" class="nav-link">
        <i class="ion-compose"></i>
        创建文章
      </router-link>
    </li>

    <!-- 设置 -->
    <li class="nav-item">
      <router-link to="/settings" class="nav-link">
        <i class="ion-gear-a"></i>
        设置
      </router-link>
    </li>

    <!-- 用户名/用户信息 -->
    <li class="nav-item">
      <router-link
        class="nav-link"
        :to="`/profile/${$store.state.currentUser.username}`"
      >
        <img class="user-pic" :src="$store.state.currentUser.image" />
        {{ $store.state.currentUser.username }}
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'NavUser'
};
</script>
