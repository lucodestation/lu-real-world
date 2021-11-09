<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <!-- 标题 -->
          <h1 class="text-xs-center">
            {{ mode === 'register' ? '注册' : '' }}
            {{ mode === 'login' ? '登录' : '' }}
          </h1>

          <!-- 提示 -->
          <p class="text-xs-center">
            <router-link v-if="mode === 'register'" to="/login">
              已有一个账号？
            </router-link>
            <router-link v-if="mode === 'login'" to="/register">
              需要一个账号？
            </router-link>
          </p>

          <!-- 错误提示 -->
          <ErrorList />

          <form>
            <!-- 用户名 -->
            <fieldset v-if="mode === 'register'" class="form-group">
              <input
                v-model="formData.username"
                class="form-control form-control-lg"
                type="text"
                placeholder="用户名"
                @keyup.enter="enterEvent"
              />
            </fieldset>
            <!-- 邮箱 -->
            <fieldset class="form-group">
              <input
                v-model="formData.email"
                class="form-control form-control-lg"
                type="email"
                placeholder="邮箱"
                @keyup.enter="enterEvent"
              />
            </fieldset>
            <!-- 密码 -->
            <fieldset class="form-group">
              <input
                v-model="formData.password"
                class="form-control form-control-lg"
                type="password"
                placeholder="密码"
                @keyup.enter="enterEvent"
              />
            </fieldset>
            <!-- 注册/登录 -->
            <button
              @click="formSubmit"
              type="button"
              class="btn btn-lg btn-primary pull-xs-right"
              :class="{
                disabled: !canSubmit
              }"
            >
              {{ mode === 'register' ? '注册' : '' }}
              {{ mode === 'login' ? '登录' : '' }}
              <i v-show="loading" class="ion-load-a"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { errorHandle } from '@/utils/index.js';
import api from '@/utils/api.js';

export default {
  name: 'AuthPage',
  props: ['mode'],
  components: {
    ErrorList: () => import('@/components/ErrorList.vue')
  },
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: ''
      },
      loading: false
    };
  },
  methods: {
    async formSubmit() {
      // 清除错误信息
      errorHandle();
      // 显示加载图标
      this.loading = true;

      // 判断是注册还是登录
      const prop = this.mode === 'register' ? 'register' : 'login';

      const user = await api[prop](this.formData);

      if (user) {
        // 将用户信息放到 store 中
        this.$store.commit('changeCurrentUser', user.data);
        // 重定向到首页
        this.$router.push('/');
      }

      // 隐藏加载图标
      this.loading = false;
    },
    enterEvent() {
      this.canSubmit && this.formSubmit();
    }
  },
  computed: {
    canSubmit: function () {
      if (
        this.mode === 'register' &&
        this.formData.username &&
        this.formData.email &&
        this.formData.password
      ) {
        return true;
      }

      if (
        this.mode === 'login' &&
        this.formData.email &&
        this.formData.password
      ) {
        return true;
      }

      return false;
    }
  }
};
</script>
