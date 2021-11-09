<template>
  <div class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <!-- 头像 -->
            <img v-if="!notFound" :src="profile.image" class="user-img" />

            <!-- 用户名 -->
            <h4>{{ profile.username }}</h4>

            <div v-if="notFound" style="text-align: center">
              <h1>404 NOT FOUND</h1>
              <br />
              <h5>
                该用户不存在 | 返回 <router-link to="/">首页</router-link>
              </h5>
            </div>

            <!-- 个人简介 -->
            <p>{{ profile.bio }}</p>

            <!-- 设置 -->
            <router-link
              to="/settings"
              tag="button"
              v-if="
                $store.state.isLoggedIn &&
                $store.state.currentUser.username === $route.params.username
              "
              class="btn btn-sm btn-outline-secondary action-btn"
            >
              <i class="ion-gear-a"></i>
              &nbsp; 设置
            </router-link>
            <!-- 关注 -->
            <button
              v-else
              @click="followEvent"
              class="btn btn-sm btn-outline-secondary action-btn"
              :class="{
                disabled: followLoading
              }"
            >
              <i class="ion-plus-round"></i>
              {{ this.profile.following ? '取消关注' : '关注' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <a
                  @click="changeTab('myArticles')"
                  class="nav-link"
                  :class="{
                    active: currentTabCard === 'myArticles'
                  }"
                  href="javascript:"
                  >文章列表</a
                >
              </li>
              <li class="nav-item">
                <a
                  @click="changeTab('myFavorites')"
                  class="nav-link"
                  :class="{
                    active: currentTabCard === 'myFavorites'
                  }"
                  href="javascript:"
                  >收藏夹</a
                >
              </li>
            </ul>
          </div>

          <div v-show="loading" class="article-preview">
            正在加载文章 <i class="ion-load-a"></i>
          </div>
          <div v-show="!articles.length && !loading" class="article-preview">
            没有文章
          </div>

          <!-- 文章列表/预览 -->
          <article-preview
            v-for="(article, index) in articles"
            :key="index"
            :article="article"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api.js';

export default {
  name: 'ProfilePage',
  components: {
    ArticlePreview: () => import('@/components/ArticlePreview.vue')
  },
  data() {
    return {
      profile: {
        follows: []
      },
      articles: [],
      currentTabCard: 'myArticles',
      loading: false,
      followLoading: false,
      notFound: true
    };
  },
  methods: {
    // 加载个人信息
    async loadProfile() {
      const username = this.$route.params.username;

      // 判断是获取自己的信息还是获取他人的信息
      const prop =
        username === this.$store.state.currentUser.username
          ? 'getCurrentUserInfo'
          : 'getProfiles';

      // 获取信息
      const user = await api[prop](username);

      if (user) {
        this.profile = user.data;
        this.notFound = false;
      }
    },
    // 加载文章列表
    async loadArticle() {
      this.articles = [];
      this.loading = true;

      const paramsProp =
        this.currentTabCard === 'myArticles' ? 'author' : 'favorited';

      const articles = await api.getArticles({
        [paramsProp]: this.$route.params.username
      });

      if (articles) {
        this.articles = articles.data.articles;
      }
      this.loading = false;
    },
    // 切换选项卡
    changeTab(tab) {
      if (this.currentTabCard === tab) {
        return;
      }
      this.currentTabCard = tab;
      this.loadArticle();
    },
    // 关注/取消关注按钮
    async followEvent() {
      if (!this.$store.state.isLoggedIn) {
        // console.log('还没登录哦');
        this.$router.push('/register');
        return;
      }

      this.followLoading = true;

      // 判断是关注还是取消关注
      const prop = this.profile.following ? 'deleteFollowUser' : 'followUser';

      const user = await api[prop](this.profile.username);

      if (user) {
        this.profile = user.data;
      }
      this.followLoading = false;
    }
  },
  watch: {
    $route(to, from) {
      this.currentTabCard = 'myArticles';

      // 加载个人信息
      this.loadProfile();

      // 加载文章列表
      this.loadArticle();
    }
  },
  created() {
    // 加载个人信息
    this.loadProfile();

    // 加载文章列表
    this.loadArticle();
  }
};
</script>
