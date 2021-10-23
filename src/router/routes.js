const Routes = [
  {
    // 首页
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    // 文章详情
    path: '/article/:slug',
    component: () => import('@/views/ArticleDetails.vue')
  },
  {
    // 用户信息
    path: '/profile/:username',
    component: () => import('@/views/ProfilePage.vue')
  },
  {
    // 创建文章
    path: '/editor',
    name: 'editor',
    component: () => import('@/views/CreateArticle.vue')
  },
  {
    // 编辑文章
    path: '/editor/:slug',
    name: 'editor-article',
    component: () => import('@/views/EditorArticle.vue')
  },
  {
    // 设置
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue')
  },
  {
    // 登录
    path: '/login',
    name: 'login',
    component: () => import('@/views/AuthLogin.vue')
  },
  {
    // 注册
    path: '/register',
    name: 'register',
    component: () => import('@/views/AuthRegister.vue')
  },

  {
    // 404 Not Found
    path: '*',
    redirect: '/'
  }
];

export { Routes };
