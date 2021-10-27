import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store/index.js';

import { Routes } from './routes.js';

Vue.use(VueRouter);

// 解决进入同一路由控制台报错问题（已在当前路由，使用 router.push 进入的还是当前路由）
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  // mode: 'history',
  routes: Routes,
  linkActiveClass: 'active'
});

import { BeforeEach } from './guards.js';
router.beforeEach(BeforeEach);

export default router;
