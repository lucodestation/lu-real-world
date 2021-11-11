<template>
  <div>
    <div v-show="loading" class="article-preview">
      正在加载文章 <i class="ion-load-a"></i>
    </div>

    <div v-show="!articles.length && !loading" class="article-preview">
      没有文章
    </div>

    <ArticlePreviewItem
      v-for="(article, index) in articles"
      :key="index"
      :article="article"
    />

    <!-- 分页 -->
    <Pagination
      v-if="articlesCount > 10"
      :articlesCount="articlesCount"
      :limit="10"
      :currentPage="currentPage"
      @changePage="changePage"
    />
  </div>
</template>

<script>
import api from '@/utils/api.js';

export default {
  name: 'ArticlePreview',
  props: [
    // feedArticles 我的订阅
    // allArticles  全部文章
    // tagArticles  含此标签的文章
    // myArticles   我的文章
    // myFavorites  我的收藏
    'currentTabCard',
    'currentTag'
  ],
  components: {
    ArticlePreviewItem: () => import('@/components/ArticlePreviewItem.vue'),
    Pagination: () => import('@/components/Pagination.vue')
  },
  data() {
    return {
      loading: false,
      articles: [],
      articlesCount: 0,
      currentPage: 1
    };
  },
  created() {
    // console.log(this.currentTabCard, '被创建');
    // if (this.currentTag) {
    //   console.log('当前标签', this.currentTag);
    // }
    this.currentTabCard === 'feedArticles' && this.feedArticles();
    this.currentTabCard === 'allArticles' && this.allArticles();
    this.currentTabCard === 'tagArticles' && this.tagArticles();
    this.currentTabCard === 'myArticles' && this.myArticles();
    this.currentTabCard === 'myFavorites' && this.myFavorites();
  },
  methods: {
    async feedArticles(params = {}) {
      // console.log('我的订阅');
      // 清空之前的文章
      this.articles = [];

      // 显示加载图标
      this.loading = true;

      // 获取文章
      const result = await api.getArticlesFeed(params);

      if (result) {
        this.articles = result.data.articles;
        this.articlesCount = result.data.articlesCount;
      }

      // 隐藏加载图标
      this.loading = false;
    },
    async allArticles(params = {}) {
      // console.log('全部文章');
      // 清空之前的文章
      this.articles = [];

      // 显示加载图标
      this.loading = true;

      // 获取文章
      const result = await api.getArticles(params);

      if (result) {
        this.articles = result.data.articles;
        this.articlesCount = result.data.articlesCount;
      }

      // 隐藏加载图标
      this.loading = false;
    },
    async tagArticles(params = {}) {
      // console.log('含此标签的文章');
      // 清空之前的文章
      this.articles = [];

      // 显示加载图标
      this.loading = true;

      // 获取文章
      const result = await api.getArticles({
        ...params,
        tag: this.currentTag
      });

      if (result) {
        this.articles = result.data.articles;
        this.articlesCount = result.data.articlesCount;
      }

      // 隐藏加载图标
      this.loading = false;
    },
    async myArticles(params = {}) {
      // console.log('我的文章');
      // 清空之前的文章
      this.articles = [];

      // 显示加载图标
      this.loading = true;

      // 获取文章
      const result = await api.getArticles({
        ...params,
        author: this.$route.params.username
      });

      if (result) {
        this.articles = result.data.articles;
        this.articlesCount = result.data.articlesCount;
      }

      // 隐藏加载图标
      this.loading = false;
    },
    async myFavorites(params = {}) {
      // console.log('我的收藏');
      // 清空之前的文章
      this.articles = [];

      // 显示加载图标
      this.loading = true;

      // 获取文章
      const result = await api.getArticles({
        ...params,
        favorited: this.$route.params.username
      });

      if (result) {
        this.articles = result.data.articles;
        this.articlesCount = result.data.articlesCount;
      }

      // 隐藏加载图标
      this.loading = false;
    },
    async changePage(page) {
      this.currentPage = page;
      this.currentTabCard === 'feedArticles' &&
        this.feedArticles({
          limit: 10,
          offset: (page - 1) * 10
        });
      this.currentTabCard === 'allArticles' &&
        this.allArticles({
          limit: 10,
          offset: (page - 1) * 10
        });
      this.currentTabCard === 'tagArticles' &&
        this.tagArticles({
          limit: 10,
          offset: (page - 1) * 10
        });
      this.currentTabCard === 'myArticles' &&
        this.myArticles({
          limit: 10,
          offset: (page - 1) * 10
        });
      this.currentTabCard === 'myFavorites' &&
        this.myFavorites({
          limit: 10,
          offset: (page - 1) * 10
        });
    }
  }
};
</script>
