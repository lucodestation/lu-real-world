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
import Vue from 'vue';
import request from '@/utils/request.js';

import token from '@/utils/token.js';

import { errorHandle } from '@/utils/index.js';

export default {
  name: 'Settings',
  components: {
    ErrorList: () => import('@/components/ErrorList.vue')
  },
  // beforeRouteEnter(to, from, next) {
  //   next(async (vm) => {
  //     const user = await request({
  //       url: '/user',
  //       headers: {
  //         Authorization: token()
  //       }
  //     }).catch((error) => {
  //       errorHandle(error.detail);
  //     });

  //     if (user) {
  //       console.log('Settings.vue 获取当前用户数据成功');
  //       Vue.set(vm.formData, 'image', user.data.image);
  //       Vue.set(vm.formData, 'username', user.data.username);
  //       Vue.set(vm.formData, 'bio', user.data.bio);
  //       Vue.set(vm.formData, 'email', user.data.email);
  //     }
  //   });
  // },
  async created() {
    // 清空错误信息
    this.$store.commit('changeErrorArray', []);

    const user = await request({
      url: '/user',
      headers: {
        Authorization: token()
      }
    }).catch((error) => {
      errorHandle(error.detail);
    });

    if (user) {
      console.log('Settings.vue 获取当前用户数据成功');
      Vue.set(this.formData, 'image', user.data.image);
      Vue.set(this.formData, 'username', user.data.username);
      Vue.set(this.formData, 'bio', user.data.bio);
      Vue.set(this.formData, 'email', user.data.email);
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
      console.log('Settings 表单数据', this.formData);
      // 清除错误信息
      errorHandle();
      // 显示加载图标
      this.loading = true;
      // 修改信息
      const result = await request({
        url: '/user',
        method: 'put',
        headers: {
          Authorization: token()
        },
        data: this.formData
      }).catch((error) => {
        // 处理错误信息
        errorHandle(error.detail);
        // 隐藏加载图标
        this.loading = false;
      });
      if (result) {
        // 隐藏加载图标
        this.loading = false;
        // 刷新页面
        this.$router.go(0);
      }
    }
  }
};
</script>
