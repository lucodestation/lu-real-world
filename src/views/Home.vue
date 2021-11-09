<template>
  <div class="home-page">
    <!-- banner -->
    <HomeBanner :count="articles.articlesCount" />

    <div class="container page">
      <div class="row">
        <div class="col-md-9">
          <!-- 分页 -->
          <Pagination
            v-if="articles.articlesCount > 10"
            :limit="10"
            :currentPage="currentPage"
          />

          <!-- 选项卡 -->
          <div class="feed-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <!-- 我的订阅 -->
                <a
                  @click="loadArticles('feedArticles')"
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
                  @click="loadArticles('allArticles')"
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
import api from '@/utils/api.js';

export default {
  name: 'Home',
  data() {
    return {
      articles: [],
      loading: false,
      currentTabCard: '',
      currentTag: '',
      currentPage: 1
    };
  },
  components: {
    HomeBanner: () => import('@/components/HomeBanner.vue'),
    ArticlePreview: () => import('@/components/ArticlePreview.vue'),
    HomeTags: () => import('@/components/HomeTags.vue'),
    Pagination: () => import('@/components/Pagination.vue')
  },
  created() {
    this.loadArticles('allArticles');
  },
  methods: {
    async loadArticles(tab, params) {
      if (
        this.currentTabCard === tab &&
        this.currentTabCard !== 'tagArticles'
      ) {
        return;
      }

      // 改变当前选项卡状态
      this.currentTabCard = tab;

      // 当点击我的订阅或全部文章时清除 currentTag ，否则切换到我的订阅或全部文章后再次点击上次同一标签是没反应
      if (this.currentTabCard !== 'tagArticles') {
        this.currentTag = '';
      }

      // 清空之前的文章
      this.articles = [];

      // 显示加载图标
      this.loading = true;

      // 判断是否是要获取我的订阅
      const prop = tab === 'feedArticles' ? 'getArticlesFeed' : 'getArticles';

      // 获取文章
      const articles = await api[prop](params);

      if (articles) {
        // 将数据放到 articles 上会自动传给子组件
        this.articles = articles.data.articles;
      }

      // 隐藏加载图标
      this.loading = false;
    },
    // 标签
    async tagArticles(tag) {
      // 禁止重复点击同一标签
      if (this.currentTag === tag) {
        return;
      }

      this.currentTag = tag;

      this.loadArticles('tagArticles', { tag });
    }
  }
};
</script>
