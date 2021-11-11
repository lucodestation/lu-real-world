<template>
  <div class="home-page">
    <!-- banner -->
    <HomeBanner :count="articles.articlesCount" />

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

          <!-- <div v-show="loading" class="article-preview">
            正在加载文章 <i class="ion-load-a"></i>
          </div>

          <div v-show="!articles.length && !loading" class="article-preview">
            没有文章
          </div> -->

          <!-- 文章列表/预览 -->
          <ArticlePreview
            v-if="currentTabCard"
            :articles="articles"
            :articlesCount="articlesCount"
            :currentTabCard="currentTabCard"
            :currentTag="currentTag"
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
      currentPage: 1,
      articlesCount: 0
    };
  },
  components: {
    HomeBanner: () => import('@/components/HomeBanner.vue'),
    ArticlePreview: () => import('@/components/ArticlePreview.vue'),
    HomeTags: () => import('@/components/HomeTags.vue')
  },
  created() {
    this.currentTabCard = 'allArticles';
  },
  methods: {
    // 我的订阅
    async feedArticles() {
      if (
        !this.$store.state.isLoggedIn ||
        this.currentTabCard === 'feedArticles'
      ) {
        // 如果用户未登录或已经处于“我的订阅”
        return;
      }

      this.currentTabCard = '';
      setTimeout(() => {
        this.currentTabCard = 'feedArticles';
      }, 0);
    },
    // 全部文章
    async allArticles() {
      if (this.currentTabCard === 'allArticles') {
        // 如果已经处于“全部文章”
        return;
      }
      this.currentTabCard = '';
      setTimeout(() => {
        this.currentTabCard = 'allArticles';
      }, 0);
    },
    // 标签
    async tagArticles(tag) {
      // 禁止重复点击同一标签
      if (this.currentTag === tag) {
        // 如果已经处于该标签
        return;
      }

      this.currentTag = tag;

      this.currentTabCard = '';
      setTimeout(() => {
        this.currentTabCard = 'tagArticles';
      }, 0);
    }
  }
};
</script>
