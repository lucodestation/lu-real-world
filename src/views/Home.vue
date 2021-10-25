<template>
  <div class="home-page">
    <!-- banner -->
    <HomeBanner />

    <div class="container page">
      <div class="row">
        <div class="col-md-9">
          <!-- 选项卡 -->
          <div class="feed-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <!-- 我的订阅 -->
                <a
                  @click="feedArticles"
                  class="nav-link"
                  :class="{
                    active: currentTabCard === 'feedArticles',
                    disabled: !$store.state.isLoggedIn
                  }"
                  href="javascript:"
                  >我的订阅</a
                >
              </li>

              <li class="nav-item">
                <!-- 全部文章 -->
                <a
                  @click="allArticles"
                  class="nav-link"
                  :class="{ active: currentTabCard === 'allArticles' }"
                  href="javascript:"
                  >全部文章</a
                >
              </li>

              <li v-show="currentTabCard === 'tagArticles'" class="nav-item">
                <!-- 标签 -->
                <a class="nav-link active" href="javascript:"
                  ># {{ currentTag }}</a
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
          <ArticlePreview
            v-for="(article, index) in articles"
            :key="index"
            :article="article"
          />
        </div>

        <!-- 标签 -->
        <HomeTags @tagArticles="tagArticles" />
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request.js';

import token from '@/utils/token.js';

export default {
  name: 'Home',
  data() {
    return {
      // 获取文章列表请求参数
      articles: [],
      loading: false,
      currentTabCard: 'allArticles',
      currentTag: ''
    };
  },
  components: {
    HomeBanner: () => import('@/components/HomeBanner.vue'),
    ArticlePreview: () => import('@/components/ArticlePreview.vue'),
    HomeTags: () => import('@/components/HomeTags.vue')
  },
  async mounted() {
    // 显示加载图标
    this.loading = true;

    // 获取文章
    const articles = await request({
      url: '/articles',
      params: {
        // limit: 1
      }
    }).catch((error) => {
      // 捕捉错误
      // console.log(error);
      // 隐藏加载图标
      this.loading = false;
    });
    // console.log('获取的文章列表', articles);
    if (articles && articles.data.articles.length) {
      // console.log(articles);
      // 将数据放到 articles 上会自动传给子组件
      this.articles = articles.data.articles;
    }
    // 隐藏加载图标
    this.loading = false;
  },
  methods: {
    // 我的订阅
    async feedArticles() {
      if (
        !this.$store.state.isLoggedIn ||
        this.currentTabCard === 'feedArticles'
      ) {
        return;
      }
      // 改变当前选项卡状态
      this.currentTabCard = 'feedArticles';

      // console.log('我的订阅');
      // 显示加载图标
      this.loading = true;

      // 清空之前的文章
      this.articles = [];

      // 获取文章
      const articles = await request({
        url: '/articles/feed',
        params: {
          // limit: 1
        }
      }).catch((error) => {
        // 捕捉错误
        // console.log(error);
        // 隐藏加载图标
        this.loading = false;
      });

      if (articles && articles.data.length) {
        // console.log(articles);
        // 将数据放到 articles 上会自动传给子组件
        this.articles = articles.data.articles;
        // console.log('获取我的订阅', this.articles);
      }
      // 隐藏加载图标
      this.loading = false;
    },
    // 全部文章
    async allArticles() {
      if (this.currentTabCard === 'allArticles') {
        return;
      }
      // 改变当前选项卡状态
      this.currentTabCard = 'allArticles';

      // console.log('所有文章');
      // 显示加载图标
      this.loading = true;

      // 清空之前的文章
      this.articles = [];

      // 获取文章
      const articles = await request({
        url: '/articles',
        params: {
          // limit: 1
        }
      }).catch((error) => {
        // 捕捉错误
        // console.log(error);
        // 隐藏加载图标
        this.loading = false;
      });

      if (articles) {
        // console.log(articles);
        // 将数据放到 articles 上会自动传给子组件
        this.articles = articles.data.articles;
      }
      // 隐藏加载图标
      this.loading = false;
    },
    // 标签
    async tagArticles(tag) {
      // 改变当前选项卡状态
      this.currentTabCard = 'tagArticles';

      // console.log('Home 组件', tag);
      // console.log('标签对应的文章');

      // 显示加载图标
      this.loading = true;

      // 清空之前的文章
      this.articles = [];

      // 获取文章
      const articles = await request({
        url: '/articles',
        params: {
          // limit: 1
          tag
        }
      }).catch((error) => {
        // 捕捉错误
        // console.log(error);
        // 隐藏加载图标
        this.loading = false;
      });

      if (articles) {
        this.currentTag = tag;
        // console.log(articles);
        // 将数据放到 articles 上会自动传给子组件
        this.articles = articles.data.articles;
        // 隐藏加载图标
        this.loading = false;
      }
    }
  }
};
</script>
