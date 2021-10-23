import Vue from 'vue';
import Vuex from 'vuex';

import router from '@/router/index.js';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isLoggedIn: false,
    currentUser: {},
    errorArray: []
  },
  mutations: {
    changeCurrentUser(state, payload) {
      if (payload === 'logout') {
        // 改变登录状态
        state.isLoggedIn = false;
        // 清空当前用户信息
        state.currentUser = {};
        // 删除 Token
        console.log('删除 Token');
        localStorage.removeItem('token');
        // 重定向到首页
        router.push('/');
      } else {
        // 改变登录状态
        state.isLoggedIn = true;
        // 存储当前用户信息
        state.currentUser = payload;
        // 存储 Token
        if (payload.token) {
          localStorage.setItem('token', payload.token);
        }
      }
      // 不要在这里重定向到首页
      // router.push('/');
    },
    changeErrorArray(state, payload) {
      console.log('payloadpayload', payload);
      if (payload.length !== 0) {
        state.errorArray = payload;
      } else {
        state.errorArray = [];
      }
    }
  },
  actions: {},
  modules: {},
  getters: {}
});
export default store;
