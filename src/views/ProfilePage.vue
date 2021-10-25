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
                  @click="myArticles"
                  class="nav-link"
                  :class="{
                    active: currentTabCard === 'myArticles'
                  }"
                  href="javascript:"
                  >我的文章</a
                >
              </li>
              <li class="nav-item">
                <a
                  @click="myFavorites"
                  class="nav-link"
                  :class="{
                    active: currentTabCard === 'myFavorites'
                  }"
                  href="javascript:"
                  >我的收藏</a
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
import request from '@/utils/request.js';

import token from '@/utils/token.js';

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
      notFound: false
    };
  },
  methods: {
    // 加载文章
    async loadArticle() {
      this.articles = [];
      this.loading = true;
      const paramsProp =
        this.currentTabCard === 'myArticles' ? 'author' : 'favorited';

      const articles = await request({
        url: '/articles',
        params: { [paramsProp]: this.$route.params.username }
      }).catch((error) => {
        // console.log(error);
      });

      if (articles) {
        this.articles = articles.data.articles;
      }
      this.loading = false;
    },
    myFavorites() {
      if (this.currentTabCard === 'myArticles') {
        this.currentTabCard = 'myFavorites';
        this.loadArticle();
      }
    },
    myArticles() {
      if (this.currentTabCard === 'myFavorites') {
        this.currentTabCard = 'myArticles';
        this.loadArticle();
      }
    },
    // 关注/取消关注按钮
    async followEvent() {
      if (!this.$store.state.isLoggedIn) {
        // console.log('还没登录哦');
        this.$router.push('/register');
        return;
      }

      this.followLoading = true;

      const method = this.profile.following ? 'delete' : 'post';

      const user = await request({
        url: `/profiles/${this.profile.username}/follow`,
        method
      });
      // console.log(user);
      if (user) {
        this.profile = user.data;
      }
      this.followLoading = false;
    }
  },
  async mounted() {
    // 加载个人信息
    let options = {};
    if (
      this.$store.state.currentUser.username === this.$route.params.username
    ) {
      options = {
        // 获取自己的信息
        url: '/user',
        headers: { Authorization: token() }
      };
    } else {
      options = {
        // 获取别人的信息
        url: `/profiles/${this.$route.params.username}`
      };
    }

    // 获取信息
    const user = await request(options).catch((error) => {
      // console.log(error);
      if (error.statusCode === 404) {
        console.error('找不到该用户');
        this.notFound = true;
      }
    });

    if (user) {
      this.profile = user.data;
    }

    // 加载文章列表
    this.loadArticle();
  }
};
</script>
