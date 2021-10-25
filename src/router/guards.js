import router from '@/router';
import token from '@/utils/token.js';
import store from '@/store/index.js';

const whiteList = ['/login', '/register'];
const blackList = ['/editor', '/settings'];

const BeforeEach = (to, from, next) => {
  // console.log('全局前置导航守卫');
  // console.log(to.path);

  // 已登录
  if (store.state.isLoggedIn && whiteList.includes(to.path)) {
    // console.log('已登录，将返回首页');
    router.push('/');
    return;
  }

  // 未登录
  if (!store.state.isLoggedIn && blackList.includes(to.path)) {
    // console.log('未登录，将返回首页');
    router.push('/');
    return;
  }

  // 未登录
  if (!store.state.isLoggedIn && to.path.substr(0, 7) === '/editor') {
    // console.log('未登录，将返回首页');
    router.push('/');
    return;
  }

  next();
};

export { BeforeEach };
