import Vue from 'vue';
import App from './App.vue';

import router from './router';
import store from './store';

import jquery from 'jquery';

import token from '@/utils/token.js';
import { requestBaseUrl } from '@/config/index.js';

import '@/styles/main.css';

// 使用同步请求获取用户信息
// 很多组件要根据是否是已登录来判断一些东西
// 如果使用异步，在 mounted 中无法获取 store 中的内容

// 如果本地存储中有 Token ，将尝试获取用户信息
if (token().length > 150) {
  // 使用 jQuery 发送同步请求，axios 不支持同步
  const result = jquery.ajax({
    url: requestBaseUrl + '/user',
    // 同步
    async: false,
    headers: {
      Authorization: token()
    }
  });

  if (result.status === 401) {
    console.log('Token 已失效');
    localStorage.removeItem('token');
  }
  // 将用户信息保存到 store
  store.commit('changeCurrentUser', result.responseJSON.data);
}

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
