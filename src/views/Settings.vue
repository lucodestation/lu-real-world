<template>
  <div class="settings-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">设置</h1>

          <!-- 错误提示 -->
          <ErrorList />

          <form>
            <!-- 头像 URL -->
            <fieldset>
              <fieldset class="form-group">
                <input
                  v-model="formData.image"
                  class="form-control"
                  type="text"
                  placeholder="头像图片 URL 地址"
                />
              </fieldset>
              <!-- 用户名 -->
              <fieldset class="form-group">
                <input
                  v-model="formData.username"
                  class="form-control form-control-lg"
                  type="text"
                  placeholder="用户名"
                />
              </fieldset>
              <!-- 个人简介 -->
              <fieldset class="form-group">
                <textarea
                  v-model="formData.bio"
                  class="form-control form-control-lg"
                  rows="8"
                  placeholder="个人简介"
                ></textarea>
              </fieldset>
              <!-- 邮箱 -->
              <fieldset class="form-group">
                <input
                  v-model="formData.email"
                  class="form-control form-control-lg"
                  type="text"
                  placeholder="邮箱"
                />
              </fieldset>
              <!-- 密码 -->
              <fieldset class="form-group">
                <input
                  v-model="formData.password"
                  class="form-control form-control-lg"
                  type="password"
                  placeholder="密码"
                />
              </fieldset>
              <button
                @click="formSubmit"
                type="button"
                class="btn btn-lg btn-primary pull-xs-right"
              >
                保存
                <i v-show="loading" class="ion-load-a"></i>
              </button>
            </fieldset>
          </form>

          <hr />
          <button @click="logoutEvent" class="btn btn-outline-danger">
            退出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js';
import { errorHandle } from '@/utils/index.js';

export default {
  name: 'Settings',
  components: {
    ErrorList: () => import('@/components/ErrorList.vue')
  },
  async created() {
    // 清除错误信息
    errorHandle();

    const user = await api.getCurrentUserInfo();

    if (user) {
      this.formData = {
        image: user.data.image,
        username: user.data.username,
        bio: user.data.bio,
        email: user.data.email
      };
    }
  },
  data() {
    return {
      loading: false,
      formData: {}
    };
  },
  methods: {
    // 退出
    logoutEvent() {
      this.$store.commit('changeCurrentUser', 'logout');
    },
    // 提交表单
    async formSubmit() {
      // 清除错误信息
      errorHandle();
      // 显示加载图标
      this.loading = true;

      const user = await api.updateCurrentUserInfo(this.formData);

      if (user) {
        // 刷新页面
        this.$router.go(0);
      }
      // 隐藏加载图标
      this.loading = false;
    }
  }
};
</script>
